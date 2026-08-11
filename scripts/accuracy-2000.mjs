#!/usr/bin/env node
/**
 * Tokn't 2000-case accuracy harness.
 * Generates diverse scenarios, runs the engine, validates outcomes vs tiktoken.
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalCache } from '@toknt/cache';
import { TokntEngine } from '@toknt/core';
import { estimateTokens, reductionPercent } from '@toknt/tokenizer';
import { detectTestRunner } from '@toknt/optimizer';
import { getEncoding } from 'js-tiktoken';

const enc = getEncoding('cl100k_base');
const CASE_COUNT = 2000;

/** Seeded PRNG for reproducible 2000 cases */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function exactTokens(text) {
  return enc.encode(text).length;
}

function generateFileContent(lines = 50) {
  const parts = [];
  for (let i = 0; i < lines; i++) {
    parts.push(`// line ${i}\nfunction fn_${i}() { return ${i}; }`);
  }
  return parts.join('\n');
}

function generateJestOutput(failCount) {
  const lines = [`Test Suites: ${failCount > 0 ? 1 : 0} failed, 2 passed, 3 total`, `Tests: ${failCount} failed, ${100 - failCount} passed, 100 total`];
  for (let i = 0; i < 80; i++) lines.push(`  ✓ test_${i}`);
  for (let i = 0; i < failCount; i++) lines.push(`  ● suite › test_${i}\n    Expected: true`);
  return lines.join('\n');
}

function generateVitestOutput(failCount) {
  return ` RUN  v2.1.0\n\n Test Files  ${failCount > 0 ? 1 : 0} failed | 2 passed (3)\n      Tests  ${failCount} failed | ${50 - failCount} passed (50)\n\n ❯ src/a.test.ts\n   × failing test`;
}

function generatePytestOutput(failCount) {
  const lines = [];
  for (let i = 0; i < 50; i++) lines.push(`tests/test_${i}.py::test_x PASSED`);
  for (let i = 0; i < failCount; i++) lines.push(`FAILED tests/test_${i}.py::test_y - AssertionError`);
  lines.push(`======= ${failCount} failed, ${50 - failCount} passed in 1.2s =======`);
  return lines.join('\n');
}

function generateDirListing(count) {
  const dirs = ['src', 'tests', 'lib', 'apps', 'packages'];
  const lines = [];
  for (let i = 0; i < count; i++) {
    lines.push(`${pick(dirs)}/file_${i}.ts`);
  }
  return lines.join('\n');
}

const CRITICAL_TYPES = ['user_request', 'git_diff', 'compiler_error', 'test_failure', 'patch_anchor', 'edited_file', 'tool_argument'];

function buildCases() {
  const cases = [];
  let id = 0;

  // 350 duplicate file read pairs/triplets
  for (let i = 0; i < 350; i++) {
    const content = generateFileContent(10 + Math.floor(rand() * 90));
    const path = `src/file_${i}.ts`;
    const repeats = rand() > 0.5 ? 2 : 3;
    const items = [];
    for (let r = 0; r < repeats; r++) {
      items.push({ id: String(id++), type: 'file_read', content, path });
    }
    cases.push({
      id: `dup-file-${i}`,
      category: 'duplicate_file',
      mode: pick(['safe', 'balanced', 'aggressive']),
      items,
      expectCompressed: true,
      expectRecall: true,
    });
  }

  // 350 terminal outputs
  for (let i = 0; i < 350; i++) {
    const failCount = Math.floor(rand() * 8);
    const kind = pick(['jest', 'vitest', 'pytest', 'generic']);
    let content;
    if (kind === 'jest') content = generateJestOutput(failCount);
    else if (kind === 'vitest') content = generateVitestOutput(failCount);
    else if (kind === 'pytest') content = generatePytestOutput(failCount);
    else content = `${100 + i} tests, ${95} passed, ${failCount} failed\n` + 'x'.repeat(500 + Math.floor(rand() * 3000));

    const lineCount = content.split('\n').length;
    const mode = pick(['safe', 'balanced', 'aggressive']);
    const shouldCompress =
      mode === 'aggressive' ? lineCount > 50 :
      mode === 'balanced' ? lineCount > 100 :
      false;

    cases.push({
      id: `terminal-${i}`,
      category: 'terminal_output',
      mode,
      items: [{ id: String(id++), type: 'terminal_output', content }],
      expectCompressed: shouldCompress,
      expectRecall: shouldCompress,
      parserKind: kind,
    });
  }

  // 350 directory listings
  for (let i = 0; i < 350; i++) {
    const count = 20 + Math.floor(rand() * 500);
    const content = generateDirListing(count);
    const mode = pick(['safe', 'balanced', 'aggressive']);
    const shouldCompress = count > 50 && mode !== 'safe';

    cases.push({
      id: `dir-${i}`,
      category: 'directory_listing',
      mode,
      items: [{ id: String(id++), type: 'directory_listing', content }],
      expectCompressed: shouldCompress,
      expectRecall: shouldCompress,
    });
  }

  // 200 duplicate tool outputs
  for (let i = 0; i < 200; i++) {
    const content = JSON.stringify({ n: i, data: 'x'.repeat(100 + Math.floor(rand() * 500)) });
    cases.push({
      id: `dup-tool-${i}`,
      category: 'duplicate_tool_output',
      mode: pick(['safe', 'balanced', 'aggressive']),
      items: [
        { id: String(id++), type: 'tool_output', content, toolName: 'grep' },
        { id: String(id++), type: 'tool_output', content, toolName: 'grep' },
      ],
      expectCompressed: true,
      expectRecall: true,
    });
  }

  // 250 critical passthrough
  for (let i = 0; i < 250; i++) {
    const type = pick(CRITICAL_TYPES);
    const content = pick([
      'Fix the auth bug without breaking logout flow',
      'diff --git a/a.ts b/a.ts\n+added line',
      'error: line 42: expected 200 got 401',
      'FAIL test_x: assertion failed',
      '@@ -1,3 +1,4 @@\n context line',
      'const edited = true;',
      '{"path": "/secret", "action": "write"}',
    ]);
    cases.push({
      id: `critical-${i}`,
      category: 'critical_passthrough',
      mode: pick(['safe', 'balanced', 'aggressive']),
      items: [{ id: String(id++), type, content }],
      expectCompressed: false,
      expectRecall: false,
    });
  }

  // 150 secret detection (must passthrough)
  for (let i = 0; i < 150; i++) {
    const content = pick([
      'api_key=sk-' + 'x'.repeat(48),
      'Bearer ghp_' + 'a'.repeat(36),
      'password=supersecret123',
      'AKIA' + 'X'.repeat(16),
    ]);
    cases.push({
      id: `secret-${i}`,
      category: 'secret_passthrough',
      mode: pick(['safe', 'balanced', 'aggressive']),
      items: [{ id: String(id++), type: 'tool_output', content }],
      expectCompressed: false,
      expectRecall: false,
    });
  }

  // 200 file change invalidation
  for (let i = 0; i < 200; i++) {
    const v1 = generateFileContent(20);
    const v2 = v1 + '\n// changed';
    const path = `mut/file_${i}.ts`;
    cases.push({
      id: `invalidate-${i}`,
      category: 'file_invalidation',
      mode: 'balanced',
      items: [
        { id: String(id++), type: 'file_read', content: v1, path },
        { id: String(id++), type: 'file_read', content: v1, path },
        { id: String(id++), type: 'file_read', content: v2, path },
      ],
      expectCompressed: false, // third read is new content — first dup ok, last not dup of v1
      expectRecall: false,
      checkSecondDup: true,
    });
  }

  // 150 token estimator samples (no engine, just counting)
  for (let i = 0; i < 150; i++) {
    const content = pick([
      generateFileContent(30),
      generateJestOutput(3),
      generateDirListing(100),
      '{"key":"value"}'.repeat(50),
    ]);
    cases.push({
      id: `estimator-${i}`,
      category: 'token_estimator',
      mode: 'safe',
      items: [{ id: String(id++), type: 'file_read', content, path: `e${i}.ts` }],
      expectCompressed: false,
      expectRecall: false,
      estimatorOnly: true,
    });
  }

  // Trim or pad to exactly 2000
  while (cases.length < CASE_COUNT) {
    cases.push({
      id: `pad-${cases.length}`,
      category: 'duplicate_file',
      mode: 'safe',
      items: [
        { id: String(id++), type: 'file_read', content: 'x'.repeat(100), path: 'pad.ts' },
        { id: String(id++), type: 'file_read', content: 'x'.repeat(100), path: 'pad.ts' },
      ],
      expectCompressed: true,
      expectRecall: true,
    });
  }

  return cases.slice(0, CASE_COUNT);
}

async function runCase(testCase) {
  const tmpDir = await mkdtemp(join(tmpdir(), 'toknt-2k-'));
  const cache = new LocalCache(tmpDir);
  const engine = new TokntEngine({ cache, mode: testCase.mode });

  let anyCompressed = false;
  let recallOk = true;
  let passthroughOk = true;
  let origChars = 0;
  let optChars = 0;
  let hOrig = 0;
  let hOpt = 0;
  let tOrig = 0;
  let tOpt = 0;
  let secondWasDup = false;

  let thirdNotCompressed = true;

  for (let idx = 0; idx < testCase.items.length; idx++) {
    const item = testCase.items[idx];
    origChars += item.content.length;
    hOrig += estimateTokens(item.content).tokens;
    tOrig += exactTokens(item.content);

    const result = await engine.processContextItem(item);
    optChars += result.content.length;
    hOpt += estimateTokens(result.content).tokens;
    tOpt += exactTokens(result.content);

    if (result.optimized) anyCompressed = true;

    if (testCase.checkSecondDup && idx === 1 && result.optimized) secondWasDup = true;
    if (testCase.category === 'file_invalidation' && idx === 2 && result.optimized) thirdNotCompressed = false;

    if (result.recallUri) {
      const recalled = await engine.recall(result.recallUri);
      if (recalled !== item.content) recallOk = false;
    }

    if (testCase.category === 'critical_passthrough') {
      if (result.optimized || result.content !== item.content) passthroughOk = false;
    }
    if (testCase.category === 'secret_passthrough') {
      if (result.optimized) passthroughOk = false;
    }
  }

  await rm(tmpDir, { recursive: true, force: true });

  let pass = true;
  let reason = '';

  if (testCase.estimatorOnly) {
    const err = tOrig > 0 ? Math.abs(hOrig - tOrig) / tOrig : 0;
    pass = err < 0.5; // estimator within 50% — track separately
    return {
      id: testCase.id,
      category: testCase.category,
      pass,
      estimatorErrorPct: Math.round(err * 1000) / 10,
      hOrig,
      tOrig,
    };
  }

  if (testCase.category === 'file_invalidation') {
    pass = secondWasDup && thirdNotCompressed;
    if (!secondWasDup) reason = 'second read not deduped';
    else if (!thirdNotCompressed) reason = 'changed file incorrectly deduped';
  } else if (testCase.expectCompressed) {
    if (!anyCompressed) { pass = false; reason = 'expected compression, got passthrough'; }
  } else {
    if (anyCompressed) { pass = false; reason = 'expected passthrough, got compression'; }
    if (testCase.category === 'critical_passthrough' && !passthroughOk) {
      pass = false; reason = 'critical content modified';
    }
    if (testCase.category === 'secret_passthrough' && !passthroughOk) {
      pass = false; reason = 'secret content compressed';
    }
  }

  if (testCase.expectRecall && anyCompressed && !recallOk) {
    pass = false;
    reason = 'recall failed';
  }

  // Parser sanity for terminal cases
  if (testCase.parserKind && testCase.items[0]) {
    const c = testCase.items[0].content;
    const runner = detectTestRunner(c);
    if (testCase.parserKind !== 'generic' && runner === 'generic' && c.includes('tests')) {
      // soft check only
    }
  }

  const hRed = reductionPercent(hOrig, hOpt);
  const tRed = reductionPercent(tOrig, tOpt);

  return {
    id: testCase.id,
    category: testCase.category,
    mode: testCase.mode,
    pass,
    reason,
    anyCompressed,
    recallOk,
    hRed,
    tRed,
    redDeltaPp: Math.abs(hRed - tRed),
    hOrig,
    tOrig,
  };
}

async function main() {
  console.log(`TOKN'T 2000-CASE ACCURACY HARNESS`);
  console.log('='.repeat(72));

  const cases = buildCases();
  console.log(`Generated ${cases.length} test cases\n`);

  const results = [];
  const batchSize = 50;
  for (let i = 0; i < cases.length; i += batchSize) {
    const batch = cases.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(runCase));
    results.push(...batchResults);
    process.stdout.write(`\r  Progress: ${Math.min(i + batchSize, cases.length)}/${cases.length}`);
  }
  console.log('\n');

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass);

  const byCategory = {};
  for (const r of results) {
    if (!byCategory[r.category]) byCategory[r.category] = { pass: 0, total: 0, redDeltas: [], estErrors: [] };
    byCategory[r.category].total++;
    if (r.pass) byCategory[r.category].pass++;
    if (r.redDeltaPp != null) byCategory[r.category].redDeltas.push(r.redDeltaPp);
    if (r.estimatorErrorPct != null) byCategory[r.category].estErrors.push(r.estimatorErrorPct);
  }

  console.log('## OVERALL');
  console.log(`  Passed:  ${passed}/${results.length} (${(passed / results.length * 100).toFixed(2)}%)`);
  console.log(`  Failed:  ${failed.length}`);

  console.log('\n## BY CATEGORY');
  for (const [cat, stats] of Object.entries(byCategory)) {
    const acc = (stats.pass / stats.total * 100).toFixed(2);
    const avgDelta = stats.redDeltas.length
      ? (stats.redDeltas.reduce((a, b) => a + b, 0) / stats.redDeltas.length).toFixed(2)
      : 'n/a';
    const avgEstErr = stats.estErrors.length
      ? (stats.estErrors.reduce((a, b) => a + b, 0) / stats.estErrors.length).toFixed(1)
      : 'n/a';
    console.log(`  ${cat.padEnd(24)} ${stats.pass}/${stats.total} (${acc}%)  avg Δred=${avgDelta}pp  avg est err=${avgEstErr}%`);
  }

  const recallCases = results.filter((r) => r.recallOk !== undefined && r.anyCompressed);
  const recallPass = recallCases.filter((r) => r.recallOk).length;
  console.log('\n## RECALL INTEGRITY');
  console.log(`  ${recallPass}/${recallCases.length} (${recallCases.length ? (recallPass / recallCases.length * 100).toFixed(2) : 0}%)`);

  const withRed = results.filter((r) => r.hRed != null && r.tRed != null && r.hOrig > 100);
  const avgRedDelta = withRed.reduce((s, r) => s + r.redDeltaPp, 0) / (withRed.length || 1);
  console.log('\n## TOKEN ESTIMATOR (reduction %)');
  console.log(`  Avg heuristic vs tiktoken delta: ${avgRedDelta.toFixed(2)} percentage points (${withRed.length} cases with meaningful tokens)`);

  const estResults = results.filter((r) => r.estimatorErrorPct != null);
  const avgEst = estResults.reduce((s, r) => s + r.estimatorErrorPct, 0) / (estResults.length || 1);
  const estWithin20 = estResults.filter((r) => r.estimatorErrorPct <= 20).length;
  console.log('\n## TOKEN ESTIMATOR (absolute counts)');
  console.log(`  Avg error vs tiktoken: ${avgEst.toFixed(1)}%`);
  console.log(`  Within 20% error: ${estWithin20}/${estResults.length} (${(estWithin20 / estResults.length * 100).toFixed(1)}%)`);

  if (failed.length > 0) {
    console.log('\n## SAMPLE FAILURES (first 10)');
    for (const f of failed.slice(0, 10)) {
      console.log(`  ${f.id} [${f.category}]: ${f.reason}`);
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    totalCases: results.length,
    passed,
    failed: failed.length,
    accuracyPercent: Math.round(passed / results.length * 10000) / 100,
    recallAccuracyPercent: recallCases.length ? Math.round(recallPass / recallCases.length * 10000) / 100 : 100,
    avgReductionDeltaPp: Math.round(avgRedDelta * 100) / 100,
    avgEstimatorErrorPct: Math.round(avgEst * 10) / 10,
    byCategory: Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [k, {
        pass: v.pass,
        total: v.total,
        accuracyPercent: Math.round(v.pass / v.total * 10000) / 100,
      }])
    ),
    failures: failed.slice(0, 50).map((f) => ({ id: f.id, category: f.category, reason: f.reason })),
  };

  const outPath = join(process.cwd(), 'benchmarks/results/accuracy-2000.json');
  await writeFile(outPath, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${outPath}`);
}

main().catch(console.error);
