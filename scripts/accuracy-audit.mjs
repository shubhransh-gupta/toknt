#!/usr/bin/env node
/**
 * Tokn't accuracy audit — measures real compression ratios and
 * compares heuristic token estimates vs tiktoken (cl100k_base).
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
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

async function runScenario(name, items, mode) {
  const tmpDir = await mkdtemp(join(tmpdir(), 'toknt-audit-'));
  const cache = new LocalCache(tmpDir);
  const engine = new TokntEngine({ cache, mode });

  let originalContent = '';
  let optimizedContent = '';
  let lastResult = null;
  let recallWorks = true;
  let infoLoss = false;

  for (const item of items) {
    originalContent += item.content;
    const result = await engine.processContextItem(item);
    optimizedContent += result.content;
    lastResult = result;

    if (result.recallUri) {
      const recalled = await engine.recall(result.recallUri);
      if (recalled !== item.content) {
        recallWorks = false;
        infoLoss = true;
      }
    }
  }

  await rm(tmpDir, { recursive: true, force: true });

  const hOrig = estimateTokens(originalContent).tokens;
  const hOpt = estimateTokens(optimizedContent).tokens;
  const tOrig = exactTokens(originalContent);
  const tOpt = exactTokens(optimizedContent);

  const heuristicReduction = reductionPercent(hOrig, hOpt);
  const tiktokenReduction = reductionPercent(tOrig, tOpt);
  const heuristicError = hOrig > 0 ? Math.abs(hOrig - tOrig) / tOrig * 100 : 0;

  return {
    name,
    mode,
    originalChars: originalContent.length,
    optimizedChars: optimizedContent.length,
    charReductionPct: reductionPercent(originalContent.length, optimizedContent.length),
    heuristicOriginal: hOrig,
    heuristicOptimized: hOpt,
    heuristicReductionPct: heuristicReduction,
    tiktokenOriginal: tOrig,
    tiktokenOptimized: tOpt,
    tiktokenReductionPct: tiktokenReduction,
    heuristicErrorPct: Math.round(heuristicError * 10) / 10,
    optimized: optimizedContent.length < originalContent.length,
    strategy: lastResult?.strategy,
    recallWorks,
    infoLoss,
  };
}

async function main() {
  const fileContent = `// UserService.swift
class UserService {
  func login() async throws -> User { return User(id: "1") }
  func logout() throws { session.clear() }
}`.repeat(40);

  const terminalOutput = (() => {
    const lines = ['1248 tests, 1241 passed, 7 failed'];
    for (let i = 0; i < 1200; i++) lines.push(`  ✓ test_${i} passed`);
    for (let i = 0; i < 7; i++) lines.push(`  ✗ AuthTests.swift:${180 + i} - assertion failed`);
    return lines.join('\n');
  })();

  const dirListing = (() => {
    const lines = [];
    for (const dir of ['src/auth', 'src/payments', 'src/networking', 'src/models']) {
      for (let i = 0; i < 800; i++) lines.push(`${dir}/file_${i}.ts`);
    }
    return lines.join('\n');
  })();

  const grepOutput = '{"status":"ok","matches":[]}'.repeat(150);

  const scenarios = [
    {
      name: 'Duplicate file reads (×3)',
      items: [
        { id: '1', type: 'file_read', content: fileContent, path: 'UserService.swift' },
        { id: '2', type: 'file_read', content: fileContent, path: 'UserService.swift' },
        { id: '3', type: 'file_read', content: fileContent, path: 'UserService.swift' },
      ],
    },
    {
      name: 'Large terminal output',
      items: [{ id: '1', type: 'terminal_output', content: terminalOutput }],
    },
    {
      name: 'Directory listing (3200 files)',
      items: [{ id: '1', type: 'directory_listing', content: dirListing }],
    },
    {
      name: 'Duplicate tool output',
      items: [
        { id: '1', type: 'tool_output', content: grepOutput, toolName: 'grep' },
        { id: '2', type: 'tool_output', content: grepOutput, toolName: 'grep' },
      ],
    },
    {
      name: 'Full agent session (realistic mix)',
      items: [
        { id: '1', type: 'file_read', content: fileContent, path: 'UserService.swift' },
        { id: '2', type: 'file_read', content: fileContent, path: 'UserService.swift' },
        { id: '3', type: 'terminal_output', content: terminalOutput },
        { id: '4', type: 'directory_listing', content: dirListing },
        { id: '5', type: 'file_read', content: '// AuthController.swift\n'.repeat(80), path: 'AuthController.swift' },
        { id: '6', type: 'tool_output', content: grepOutput, toolName: 'grep' },
        { id: '7', type: 'tool_output', content: grepOutput, toolName: 'grep' },
      ],
    },
    {
      name: 'Critical content (must NOT compress)',
      items: [
        { id: '1', type: 'user_request', content: 'Fix the authentication bug in UserService without breaking logout' },
        { id: '2', type: 'git_diff', content: 'diff --git a/UserService.swift\n+ func validateToken()' },
        { id: '3', type: 'compiler_error', content: 'error: AuthTests.swift:184: Assertion failed: expected 200 got 401' },
      ],
    },
  ];

  const modes = ['safe', 'balanced', 'aggressive'];

  console.log('TOKN\'T ACCURACY AUDIT');
  console.log('='.repeat(72));
  console.log('Token counts: heuristic vs tiktoken (cl100k_base / GPT-4 class models)\n');

  const allResults = [];

  for (const scenario of scenarios) {
    console.log(`\n## ${scenario.name}`);
    console.log('-'.repeat(72));

    for (const mode of modes) {
      const r = await runScenario(scenario.name, scenario.items, mode);
      allResults.push(r);

      console.log(`  [${mode.padEnd(10)}]`);
      console.log(`    Chars:     ${r.originalChars.toLocaleString()} → ${r.optimizedChars.toLocaleString()} (${r.charReductionPct}% reduction)`);
      console.log(`    Heuristic: ${r.heuristicOriginal.toLocaleString()} → ${r.heuristicOptimized.toLocaleString()} (${r.heuristicReductionPct}% reduction)`);
      console.log(`    Tiktoken:  ${r.tiktokenOriginal.toLocaleString()} → ${r.tiktokenOptimized.toLocaleString()} (${r.tiktokenReductionPct}% reduction)`);
      console.log(`    Est. error: ${r.heuristicErrorPct}% vs tiktoken on input`);
      console.log(`    Recall OK: ${r.recallWorks ? '✓' : '✗'}  Info loss: ${r.infoLoss ? 'YES ✗' : 'none ✓'}`);
    }
  }

  // Heuristic accuracy on raw samples
  console.log('\n\n## HEURISTIC ESTIMATOR ACCURACY (no compression)');
  console.log('-'.repeat(72));
  const samples = [
    { name: 'Swift code', text: fileContent },
    { name: 'Terminal output', text: terminalOutput },
    { name: 'Directory listing', text: dirListing },
    { name: 'JSON grep', text: grepOutput },
  ];
  for (const s of samples) {
    const h = estimateTokens(s.text).tokens;
    const t = exactTokens(s.text);
    const err = Math.abs(h - t) / t * 100;
    console.log(`  ${s.name.padEnd(20)} heuristic=${h.toLocaleString()}  tiktoken=${t.toLocaleString()}  error=${err.toFixed(1)}%`);
  }

  // Full session summary (balanced mode — default recommendation)
  const fullSession = allResults.filter((r) => r.name === 'Full agent session (realistic mix)' && r.mode === 'balanced')[0];
  const critical = allResults.filter((r) => r.name === 'Critical content (must NOT compress)' && r.mode === 'balanced')[0];

  console.log('\n\n## SUMMARY (balanced mode, realistic session)');
  console.log('='.repeat(72));
  if (fullSession) {
    console.log(`  Tiktoken reduction:  ${fullSession.tiktokenReductionPct}%`);
    console.log(`  Heuristic reduction: ${fullSession.heuristicReductionPct}%`);
    console.log(`  Char reduction:      ${fullSession.charReductionPct}%`);
    console.log(`  Delta (heuristic vs tiktoken): ${Math.abs(fullSession.heuristicReductionPct - fullSession.tiktokenReductionPct).toFixed(1)} percentage points`);
    console.log(`  Recall integrity:    ${fullSession.recallWorks ? 'PASS ✓' : 'FAIL ✗'}`);
  }
  if (critical) {
    console.log(`  Critical passthrough: ${critical.tiktokenReductionPct === 0 ? 'PASS ✓ (0% compression)' : 'FAIL ✗'}`);
  }

  console.log('\n## README CLAIM CHECK');
  console.log('-'.repeat(72));
  console.log('  README previously claimed ~39% reduction — superseded by measured audit above');
  if (fullSession) {
    console.log(`  Actual measured (tiktoken):   ${fullSession.tiktokenOriginal.toLocaleString()} → ${fullSession.tiktokenOptimized.toLocaleString()} (${fullSession.tiktokenReductionPct}%)`);
    console.log(`  Actual measured (heuristic):  ${fullSession.heuristicOriginal.toLocaleString()} → ${fullSession.heuristicOptimized.toLocaleString()} (${fullSession.heuristicReductionPct}%)`);
    const readmeClaim = 39;
    const diff = Math.abs(fullSession.tiktokenReductionPct - readmeClaim);
    console.log(`  vs README claim: ${diff <= 10 ? 'WITHIN ~10pp ✓' : 'OFF BY ' + diff.toFixed(1) + 'pp — README uses different/larger fixture ✗'}`);
  }

  console.log('\n## BENCHMARK CLI (simulated) vs ENGINE AUDIT');
  console.log('-'.repeat(72));
  const { runBenchmarkSimulation } = await import('@toknt/benchmark');
  const bench = await runBenchmarkSimulation('fix-authentication', 'cursor', 'balanced');
  console.log(`  CLI benchmark claims: ${bench.without.tokens.toLocaleString()} → ${bench.withToknt.tokens.toLocaleString()} (${bench.reductionPercent}%)`);
  if (fullSession) {
    console.log(`  Engine audit (tiktoken): ${fullSession.tiktokenOriginal.toLocaleString()} → ${fullSession.tiktokenOptimized.toLocaleString()} (${fullSession.tiktokenReductionPct}%)`);
  }
  console.log('  Note: CLI benchmark uses same fixture but heuristic-only counting.\n');

  // Write JSON report
  const reportPath = join(process.cwd(), 'benchmarks/results/accuracy-audit.json');
  await writeFile(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), results: allResults, fullSession, critical }, null, 2));
  console.log(`Report saved: ${reportPath}`);
}

main().catch(console.error);
