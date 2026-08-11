#!/usr/bin/env node
/**
 * Phase 2 — Live session audit harness.
 * Simulates a realistic agent session with configurable mode and reports tiktoken savings.
 *
 * Usage:
 *   node scripts/live-session-audit.mjs
 *   node scripts/live-session-audit.mjs --mode balanced
 */
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalCache } from '@toknt/cache';
import { TokntEngine } from '@toknt/core';
import { estimateTokens, reductionPercent } from '@toknt/tokenizer';
import { getEncoding } from 'js-tiktoken';

const enc = getEncoding('cl100k_base');

function exactTokens(text) {
  return enc.encode(text).length;
}

function parseArgs() {
  const mode = process.argv.includes('--mode')
    ? process.argv[process.argv.indexOf('--mode') + 1]
    : 'balanced';
  return { mode };
}

async function main() {
  const { mode } = parseArgs();
  const tmpDir = await mkdtemp(join(tmpdir(), 'toknt-live-'));
  const cache = new LocalCache(tmpDir);
  await cache.saveConfig({ mode });
  const engine = new TokntEngine({ cache, mode });

  const repoDir = join(tmpDir, 'repo');
  await mkdtemp(join(tmpdir(), 'x-'));
  const { mkdir } = await import('node:fs/promises');
  await mkdir(repoDir, { recursive: true });

  const authFile = `export class AuthService {
  login() { return true; }
  logout() { return true; }
}`;
  await writeFile(join(repoDir, 'AuthService.ts'), authFile);

  const testOutput = 'RUN v2\n' + Array.from({ length: 400 }, (_, i) =>
    i % 17 === 0 ? `FAIL test_${i}` : `PASS test_${i}`
  ).join('\n');

  const dirListing = Array.from({ length: 200 }, (_, i) => `src/file_${i}.ts`).join('\n');

  const session = [
    { type: 'user_request', content: 'Fix the auth bug without breaking logout', path: undefined },
    { type: 'file_read', content: authFile, path: 'AuthService.ts' },
    { type: 'file_read', content: authFile, path: 'AuthService.ts' },
    { type: 'terminal_output', content: testOutput },
    { type: 'directory_listing', content: dirListing },
    { type: 'file_read', content: authFile, path: 'AuthService.ts' },
    { type: 'git_diff', content: 'diff --git a/AuthService.ts\n+fixed line' },
  ];

  let hOrig = 0;
  let hOpt = 0;
  let tOrig = 0;
  let tOpt = 0;
  const steps = [];

  for (let i = 0; i < session.length; i++) {
    const item = { id: String(i), ...session[i] };
    hOrig += estimateTokens(item.content).tokens;
    tOrig += exactTokens(item.content);
    const result = await engine.processContextItem(item);
    hOpt += estimateTokens(result.content).tokens;
    tOpt += exactTokens(result.content);
    steps.push({
      step: i + 1,
      type: item.type,
      optimized: result.optimized,
      strategy: result.strategy ?? null,
      recallUri: result.recallUri ?? null,
    });
  }

  const report = {
    timestamp: new Date().toISOString(),
    mode,
    steps,
    heuristic: {
      original: hOrig,
      optimized: hOpt,
      reductionPercent: reductionPercent(hOrig, hOpt),
    },
    tiktoken: {
      original: tOrig,
      optimized: tOpt,
      reductionPercent: reductionPercent(tOrig, tOpt),
    },
    note: 'Simulated realistic session — replace with exported agent logs in Phase 2B',
  };

  const outPath = join(process.cwd(), 'benchmarks/results/live-session-audit.json');
  await writeFile(outPath, JSON.stringify(report, null, 2));

  console.log('TOKN\'T LIVE SESSION AUDIT (Phase 2)');
  console.log('='.repeat(60));
  console.log(`Mode: ${mode}`);
  console.log(`Tiktoken:  ${tOrig.toLocaleString()} → ${tOpt.toLocaleString()} (${report.tiktoken.reductionPercent}%)`);
  console.log(`Heuristic: ${hOrig.toLocaleString()} → ${hOpt.toLocaleString()} (${report.heuristic.reductionPercent}%)`);
  console.log(`Report: ${outPath}`);

  await rm(tmpDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
