import type { TerminalSummary } from './terminal.js';
import { stripAnsi } from './terminal.js';

export type TestRunner = 'jest' | 'vitest' | 'pytest' | 'generic';

export function detectTestRunner(content: string): TestRunner {
  const clean = stripAnsi(content);

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
