#!/usr/bin/env node
/**
 * Phase 2B — Live session audit harness.
 * Runs multiple simulated agent sessions and reports token savings.
 *
 * Usage:
 *   node scripts/live-session-audit.mjs
 *   node scripts/live-session-audit.mjs --mode balanced
 *   node scripts/live-session-audit.mjs --sessions 15
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalCache } from '@toknt/cache';
import { TokntEngine } from '@toknt/core';
import { estimateTokens, countTokensExact, reductionPercent } from '@toknt/tokenizer';

function parseArgs() {
  const argv = process.argv.slice(2);
  const mode = argv.includes('--mode') ? argv[argv.indexOf('--mode') + 1] : 'balanced';
  const sessions = argv.includes('--sessions')
    ? parseInt(argv[argv.indexOf('--sessions') + 1], 10)
    : 15;
  return { mode, sessions };
}

function generateAuthFile(variant) {
  return `export class AuthService${variant} {
  login() { return true; }
  logout() { return true; }
  validate(token: string) { return token.length > 0; }
}`;
}

function generateTestOutput(lines) {
  return (
    'RUN v2\n' +
    Array.from({ length: lines }, (_, i) => (i % 17 === 0 ? `FAIL test_${i}` : `PASS test_${i}`)).join('\n')
  );
}

function generateDirListing(count) {
  return Array.from({ length: count }, (_, i) => `src/file_${i}.ts`).join('\n');
}

function buildSessionTemplates(count) {
  const templates = [];
  for (let i = 0; i < count; i++) {
    const authFile = generateAuthFile(i);
    const testLines = 200 + (i % 5) * 100;
    const dirCount = 100 + (i % 4) * 50;
    templates.push({
      id: `session-${i + 1}`,
      label: ['bug-fix', 'refactor', 'test-run', 'explore', 'review'][i % 5],
      steps: [
        { type: 'user_request', content: `Task ${i + 1}: fix auth and run tests`, path: undefined },
        { type: 'file_read', content: authFile, path: `AuthService${i}.ts` },
        { type: 'file_read', content: authFile, path: `AuthService${i}.ts` },
        { type: 'terminal_output', content: generateTestOutput(testLines) },
        { type: 'directory_listing', content: generateDirListing(dirCount) },
        { type: 'file_read', content: authFile, path: `AuthService${i}.ts` },
        { type: 'git_diff', content: `diff --git a/AuthService${i}.ts\n+fixed line ${i}` },
      ],
    });
  }
  return templates;
}

async function runSession(mode, template) {
  const tmpDir = await mkdtemp(join(tmpdir(), 'toknt-live-'));
  const cache = new LocalCache(tmpDir);
  await cache.saveConfig({ mode });
  const engine = new TokntEngine({ cache, mode });

  let orig = 0;
  let opt = 0;
  const steps = [];

  for (let i = 0; i < template.steps.length; i++) {
    const step = template.steps[i];
    const item = { id: String(i), ...step };
    orig += countTokensExact(item.content);
    const result = await engine.processContextItem(item);
    opt += countTokensExact(result.content);
    steps.push({
      step: i + 1,
      type: item.type,
      optimized: result.optimized,
      strategy: result.strategy ?? null,
    });
  }

  await rm(tmpDir, { recursive: true, force: true });

  return {
    id: template.id,
    label: template.label,
    original: orig,
    optimized: opt,
    reductionPercent: reductionPercent(orig, opt),
    steps,
  };
}

async function main() {
  const { mode, sessions } = parseArgs();
  const templates = buildSessionTemplates(sessions);
  const results = [];

  for (const template of templates) {
    results.push(await runSession(mode, template));
  }

  const totalOrig = results.reduce((s, r) => s + r.original, 0);
  const totalOpt = results.reduce((s, r) => s + r.optimized, 0);

  const report = {
    timestamp: new Date().toISOString(),
    mode,
    sessionCount: sessions,
    sessions: results,
    aggregate: {
      original: totalOrig,
      optimized: totalOpt,
      reductionPercent: reductionPercent(totalOrig, totalOpt),
      avgReductionPercent:
        Math.round((results.reduce((s, r) => s + r.reductionPercent, 0) / results.length) * 100) / 100,
    },
    note: 'Phase 2B batch audit — 15 simulated sessions; replace with exported agent logs for production validation',
  };

  const outPath = join(process.cwd(), 'benchmarks/results/live-session-audit.json');
  await writeFile(outPath, JSON.stringify(report, null, 2));

  console.log('TOKN\'T LIVE SESSION AUDIT (Phase 2B)');
  console.log('='.repeat(60));
  console.log(`Mode: ${mode} | Sessions: ${sessions}`);
  console.log(
    `Aggregate: ${totalOrig.toLocaleString()} → ${totalOpt.toLocaleString()} (${report.aggregate.reductionPercent}%)`
  );
  console.log(`Avg per session: ${report.aggregate.avgReductionPercent}%`);
  console.log(`Report: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
