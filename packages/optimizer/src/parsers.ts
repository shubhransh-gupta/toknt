import type { TerminalSummary } from './terminal.js';
import { stripAnsi } from './terminal.js';

export type TestRunner = 'jest' | 'vitest' | 'pytest' | 'maven' | 'go' | 'cargo' | 'generic';

export function detectTestRunner(content: string): TestRunner {
  const clean = stripAnsi(content);

  if (/Tests run:\s*\d+|<<< (?:FAILURE|ERROR)!|BUILD FAILURE/i.test(clean)) return 'maven';
  if (/^running \d+ tests$/m.test(clean) || /test result:\s*(?:FAILED|ok)/i.test(clean)) return 'cargo';
  if (/^=== RUN\s/m.test(clean) || /^--- (?:PASS|FAIL):\s/m.test(clean) || /^FAIL\t/m.test(clean)) return 'go';
  if (/pytest|=== FAILURES ===|FAILED .*::|\d+ failed,\s*\d+ passed in/i.test(clean)) return 'pytest';
  if (/vitest|Test Files\s+\d+|RUN\s+v\d+\.\d+\.\d+/i.test(clean)) return 'vitest';
  if (/jest|Test Suites:|Tests:\s+\d+/.test(clean)) return 'jest';

  return 'generic';
}

export function parseJestOutput(content: string): TerminalSummary {
  const clean = stripAnsi(content);
  const lines = clean.split('\n');
  const failures: string[] = [];

  const suitesMatch = clean.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/i)
    ?? clean.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/i);
  const testFilesMatch = clean.match(/Test Suites:\s+(\d+)\s+failed/i);

  let failed = 0;
  let passed = 0;
  let total = 0;

  if (suitesMatch) {
    if (suitesMatch.length >= 4) {
      failed = parseInt(suitesMatch[1], 10);
      passed = parseInt(suitesMatch[2], 10);
      total = parseInt(suitesMatch[3], 10);
    } else {
      passed = parseInt(suitesMatch[1], 10);
      total = parseInt(suitesMatch[2], 10);
      failed = total - passed;
    }
  }

  for (const line of lines) {
    if (/●\s|FAIL\s|✕\s|Expected:|Received:/.test(line)) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 300 && !/^Tests:/.test(trimmed)) {
        failures.push(trimmed.replace(/^●\s*/, ''));
      }
    }
  }

  return {
    totalTests: total || lines.length,
    passed,
    failed: failed || failures.length,
    failures: dedupeFailures(failures).slice(0, 20),
    lineCount: lines.length,
    exitCode: testFilesMatch ? 1 : 0,
  };
}

export function parseVitestOutput(content: string): TerminalSummary {
  const clean = stripAnsi(content);
  const lines = clean.split('\n');
  const failures: string[] = [];

  const filesMatch = clean.match(/Test Files\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed\s+\((\d+)\)/i)
    ?? clean.match(/Test Files\s+(\d+)\s+passed\s+\((\d+)\)/i);
  const testsMatch = clean.match(/Tests\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed\s+\((\d+)\)/i)
    ?? clean.match(/Tests\s+(\d+)\s+passed\s+\((\d+)\)/i);

  let failed = 0;
  let passed = 0;
  let total = 0;

  if (testsMatch) {
    if (testsMatch.length >= 4) {
      failed = parseInt(testsMatch[1], 10);
      passed = parseInt(testsMatch[2], 10);
      total = parseInt(testsMatch[3], 10);
    } else {
      passed = parseInt(testsMatch[1], 10);
      total = parseInt(testsMatch[2], 10);
    }
  } else if (filesMatch) {
    total = parseInt(filesMatch[filesMatch.length - 1], 10);
  }

  for (const line of lines) {
    if (/FAIL\s|×\s|❯\s|AssertionError|Expected/.test(line)) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 300 && !/^Test Files/.test(trimmed)) {
        failures.push(trimmed.replace(/^[×❯]\s*/, ''));
      }
    }
  }

  return {
    totalTests: total || passed + failed || lines.length,
    passed,
    failed: failed || failures.length,
    failures: dedupeFailures(failures).slice(0, 20),
    lineCount: lines.length,
  };
}

export function parsePytestOutput(content: string): TerminalSummary {
  const clean = stripAnsi(content);
  const lines = clean.split('\n');
  const failures: string[] = [];

  const summaryMatch = clean.match(/(\d+)\s+failed,\s*(\d+)\s+passed/i)
    ?? clean.match(/(\d+)\s+passed(?:,\s*(\d+)\s+failed)?(?:,\s*(\d+)\s+skipped)?/i);

  let passed = 0;
  let failed = 0;
  let total = 0;

  if (summaryMatch) {
    if (summaryMatch[0].includes('failed') && summaryMatch[0].indexOf('failed') < summaryMatch[0].indexOf('passed')) {
      failed = parseInt(summaryMatch[1], 10);
      passed = parseInt(summaryMatch[2], 10);
    } else {
      passed = parseInt(summaryMatch[1], 10);
      failed = summaryMatch[2] ? parseInt(summaryMatch[2], 10) : 0;
    }
    total = passed + failed + (summaryMatch[3] ? parseInt(summaryMatch[3], 10) : 0);
  }

  for (const line of lines) {
    if (/^FAILED\s|FAILED .*::|E\s+AssertionError|E\s+assert/.test(line)) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 300) {
        failures.push(trimmed.replace(/^FAILED\s*/, ''));
      }
    }
  }

  return {
    totalTests: total || passed + failed || lines.length,
    passed,
    failed: failed || failures.length,
    failures: dedupeFailures(failures).slice(0, 20),
    lineCount: lines.length,
  };
}

export function parseMavenOutput(content: string): TerminalSummary {
  const clean = stripAnsi(content);
  const lines = clean.split('\n');
  const failures: string[] = [];
  const summaryMatches = [...clean.matchAll(
    /Tests run:\s*(\d+),\s*Failures:\s*(\d+),\s*Errors:\s*(\d+),\s*Skipped:\s*(\d+)/gi
  )];
  const summaryMatch = summaryMatches.at(-1);

  const total = summaryMatch ? parseInt(summaryMatch[1], 10) : lines.length;
  const failed = summaryMatch ? parseInt(summaryMatch[2], 10) : 0;
  const errors = summaryMatch ? parseInt(summaryMatch[3], 10) : 0;
  const skipped = summaryMatch ? parseInt(summaryMatch[4], 10) : 0;
  const passed = Math.max(0, total - failed - errors - skipped);

  for (let i = 0; i < lines.length; i++) {
    if (!/<<< (?:FAILURE|ERROR)!/.test(lines[i])) continue;

    const beforeMarker = lines[i].split(/<<< (?:FAILURE|ERROR)!/)[0];
    const candidates = beforeMarker.trim() ? [beforeMarker] : lines.slice(i + 1);

    for (const candidate of candidates) {
      const trimmed = candidate.replace(/^\[ERROR\]\s*/, '').trim();
      if (!trimmed) continue;

      const nameMatch = trimmed.match(
        /([A-Za-z_$][\w$]*\([\w$.[\]-]+\)|[\w$.[\]-]+\.[A-Za-z_$][\w$]*)/
      );
      if (nameMatch) failures.push(nameMatch[1]);
      break;
    }
  }

  return {
    totalTests: total,
    passed,
    failed: summaryMatch ? failed : failures.length,
    errors,
    skipped,
    failures: dedupeFailures(failures).slice(0, 20),
    lineCount: lines.length,
    exitCode: /BUILD FAILURE|<<< (?:FAILURE|ERROR)!/.test(clean) ? 1 : 0,
  };
}

export function parseGoTestOutput(content: string): TerminalSummary {
  const clean = stripAnsi(content);
  const lines = clean.split('\n');
  const failures: string[] = [];
  let passed = 0;
  let failed = 0;

  for (const line of lines) {
    const passMatch = line.match(/^--- PASS:\s+(\S+)/);
    const failMatch = line.match(/^--- FAIL:\s+(\S+)/);
    if (passMatch) {
      passed++;
    } else if (failMatch) {
      failed++;
      failures.push(failMatch[1]);
    }
  }

  const total = (passed + failed) || lines.length;

  return {
    totalTests: total,
    passed,
    failed: failed || failures.length,
    failures: dedupeFailures(failures).slice(0, 20),
    lineCount: lines.length,
    exitCode: /^FAIL\t/m.test(clean) || failed > 0 ? 1 : 0,
  };
}

export function parseCargoTestOutput(content: string): TerminalSummary {
  const clean = stripAnsi(content);
  const lines = clean.split('\n');
  const failures: string[] = [];

  const summaryMatch = clean.match(
    /test result:\s*(?:FAILED|ok)\.\s*(\d+)\s+passed;\s*(\d+)\s+failed(?:;\s*(\d+)\s+ignored)?(?:;\s*(\d+)\s+measured)?/i
  );

  let passed = summaryMatch ? parseInt(summaryMatch[1], 10) : 0;
  let failed = summaryMatch ? parseInt(summaryMatch[2], 10) : 0;
  const skipped = summaryMatch?.[3] ? parseInt(summaryMatch[3], 10) : 0;
  const total = (passed + failed + skipped) || lines.length;

  for (const line of lines) {
    const failLine = line.match(/^test\s+(\S+)\s+\.\.\.\s+FAILED/i);
    if (failLine) failures.push(failLine[1]);
  }

  if (!summaryMatch && failures.length > 0) {
    failed = failures.length;
    passed = Math.max(0, total - failed);
  }

  return {
    totalTests: total,
    passed,
    failed: failed || failures.length,
    skipped: skipped || undefined,
    failures: dedupeFailures(failures).slice(0, 20),
    lineCount: lines.length,
    exitCode: /test result:\s*FAILED/i.test(clean) ? 1 : 0,
  };
}

function dedupeFailures(failures: string[]): string[] {
  return [...new Set(failures)];
}

export function summarizeByRunner(content: string): TerminalSummary {
  const runner = detectTestRunner(content);
  switch (runner) {
    case 'jest':
      return parseJestOutput(content);
    case 'vitest':
      return parseVitestOutput(content);
    case 'pytest':
      return parsePytestOutput(content);
    case 'maven':
      return parseMavenOutput(content);
    case 'go':
      return parseGoTestOutput(content);
    case 'cargo':
      return parseCargoTestOutput(content);
    default:
      return parseGenericOutput(content);
  }
}

function parseGenericOutput(content: string): TerminalSummary {
  const clean = stripAnsi(content);
  const lines = clean.split('\n');
  const failures: string[] = [];

  const passMatch = clean.match(/(\d+)\s+pass/i);
  const failMatch = clean.match(/(\d+)\s+fail/i);
  const testMatch = clean.match(/(\d+)\s+test/i);

  for (const line of lines) {
    if (/FAIL|✗|❌|×|failed|AssertionError|Error:/i.test(line)) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 300) failures.push(trimmed);
    }
  }

  return {
    totalTests: testMatch ? parseInt(testMatch[1], 10) : lines.length,
    passed: passMatch ? parseInt(passMatch[1], 10) : 0,
    failed: failMatch ? parseInt(failMatch[1], 10) : failures.length,
    failures: dedupeFailures(failures).slice(0, 20),
    lineCount: lines.length,
  };
}
