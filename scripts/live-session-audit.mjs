#!/usr/bin/env node
/**
 * Live session audit harness.
 *
 * Usage:
 *   node scripts/live-session-audit.mjs
 *   node scripts/live-session-audit.mjs --mode balanced --sessions 15
 *   node scripts/live-session-audit.mjs --input benchmarks/samples/sample-session.json
 *   node scripts/live-session-audit.mjs --input-dir benchmarks/samples/
 */
import { mkdtemp, rm, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalCache } from '@toknt/cache';
import { TokntEngine } from '@toknt/core';
import { countTokensExact, reductionPercent } from '@toknt/tokenizer';

function parseArgs() {
  const argv = process.argv.slice(2);
  const mode = argv.includes('--mode') ? argv[argv.indexOf('--mode') + 1] : 'balanced';
  const sessions = argv.includes('--sessions')
    ? parseInt(argv[argv.indexOf('--sessions') + 1], 10)
    : 15;
  const input = argv.includes('--input') ? argv[argv.indexOf('--input') + 1] : null;
  const inputDir = argv.includes('--input-dir') ? argv[argv.indexOf('--input-dir') + 1] : null;
  return { mode, sessions, input, inputDir };
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

async function loadSessionFile(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  const data = JSON.parse(raw);
  if (Array.isArray(data.steps)) {
    return {
      id: data.id ?? filePath.replace(/\.json$/, ''),
      label: data.label ?? 'imported',
      steps: data.steps,
    };
  }
  throw new Error(`Invalid session file: ${filePath}`);
}

async function loadSessionsFromDir(dirPath) {
  const files = await readdir(dirPath);
  const templates = [];
  for (const file of files) {
    if (extname(file) !== '.json') continue;
    templates.push(await loadSessionFile(join(dirPath, file)));
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
    const item = { id: String(i), type: step.type, content: step.content, path: step.path };
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
  const { mode, sessions, input, inputDir } = parseArgs();

  let templates;
  if (input) {
    templates = [await loadSessionFile(input)];
  } else if (inputDir) {
    templates = await loadSessionsFromDir(inputDir);
  } else {
    templates = buildSessionTemplates(sessions);
  }

  const results = [];
  for (const template of templates) {
    results.push(await runSession(mode, template));
  }

  const totalOrig = results.reduce((s, r) => s + r.original, 0);
  const totalOpt = results.reduce((s, r) => s + r.optimized, 0);

  const report = {
    timestamp: new Date().toISOString(),
    mode,
    sessionCount: results.length,
    source: input ? 'file' : inputDir ? 'directory' : 'simulated',
    sessions: results,
    aggregate: {
      original: totalOrig,
      optimized: totalOpt,
      reductionPercent: reductionPercent(totalOrig, totalOpt),
      avgReductionPercent:
        Math.round((results.reduce((s, r) => s + r.reductionPercent, 0) / results.length) * 100) / 100,
    },
  };

  const outPath = join(process.cwd(), 'benchmarks/results/live-session-audit.json');
  await writeFile(outPath, JSON.stringify(report, null, 2));

  console.log('TOKN\'T LIVE SESSION AUDIT');
  console.log('='.repeat(60));
  console.log(`Mode: ${mode} | Sessions: ${results.length} | Source: ${report.source}`);
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
