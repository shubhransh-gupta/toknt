import { describe, it, expect } from 'vitest';
import {
  DuplicateTracker,
  summarizeTerminalOutput,
  parseDirectoryPaths,
  detectTestRunner,
  parseJestOutput,
  parseVitestOutput,
  parsePytestOutput,
} from '../src/index.js';

describe('DuplicateTracker', () => {
  it('detects duplicate files', () => {
    const tracker = new DuplicateTracker();
    const first = tracker.checkFile('a.ts', 'content');
    expect(first.isDuplicate).toBe(false);

    const second = tracker.checkFile('a.ts', 'content');
    expect(second.isDuplicate).toBe(true);
  });

  it('invalidates on content change', () => {
    const tracker = new DuplicateTracker();
    tracker.checkFile('a.ts', 'v1');
    tracker.invalidateFile('a.ts');
    const result = tracker.checkFile('a.ts', 'v2');
    expect(result.isDuplicate).toBe(false);
  });
});

describe('detectTestRunner', () => {
  it('detects jest', () => {
    expect(detectTestRunner('Test Suites: 1 failed, 2 passed')).toBe('jest');
  });

  it('detects vitest', () => {
    expect(detectTestRunner(' RUN  v2.1.0\n Test Files  1 passed (1)')).toBe('vitest');
  });

  it('detects pytest', () => {
    expect(detectTestRunner('FAILED tests/test_auth.py::test_login')).toBe('pytest');
  });
});

describe('parseJestOutput', () => {
  it('parses Jest summary line', () => {
    const output = `
Test Suites: 1 failed, 2 passed, 3 total
Tests:       2 failed, 48 passed, 50 total
  ● AuthService › should login
    Expected: true
    Received: false
    FAIL src/auth.test.ts
`.trim();

    const summary = parseJestOutput(output);
    expect(summary.totalTests).toBe(50);
    expect(summary.passed).toBe(48);
    expect(summary.failed).toBe(2);
    expect(summary.failures.some((f) => f.includes('AuthService'))).toBe(true);
  });
});

describe('parseVitestOutput', () => {
  it('parses Vitest summary', () => {
    const output = `
 RUN  v2.1.0

 ❯ src/utils.test.ts (3 tests | 1 failed) 42ms
   × should format tokens 12ms

 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 14 passed (15)
`.trim();

    const summary = parseVitestOutput(output);
    expect(summary.totalTests).toBe(15);
    expect(summary.passed).toBe(14);
    expect(summary.failed).toBe(1);
    expect(summary.failures.length).toBeGreaterThan(0);
  });
});

describe('parsePytestOutput', () => {
  it('parses pytest summary', () => {
    const output = `
tests/test_auth.py::test_login PASSED
tests/test_auth.py::test_logout FAILED
FAILED tests/test_auth.py::test_logout - AssertionError: expected 200
======= 1 failed, 9 passed in 0.42s =======
`.trim();

    const summary = parsePytestOutput(output);
    expect(summary.passed).toBe(9);
    expect(summary.failed).toBe(1);
    expect(summary.failures.some((f) => f.includes('test_logout'))).toBe(true);
  });
});

describe('summarizeTerminalOutput', () => {
  it('extracts generic test results', () => {
    const output = '100 tests, 95 passed, 5 failed\nFAIL AuthTests.swift:42';
    const summary = summarizeTerminalOutput(output);
    expect(summary.failed).toBeGreaterThan(0);
    expect(summary.failures.length).toBeGreaterThan(0);
  });

  it('strips ANSI codes', () => {
    const output = '\x1b[31mError\x1b[0m: something failed';
    const summary = summarizeTerminalOutput(output);
    expect(summary.failures.some((f) => f.includes('Error'))).toBe(true);
  });

  it('routes to jest parser automatically', () => {
    const output = 'Tests: 2 failed, 48 passed, 50 total\nTest Suites: 1 failed';
    const summary = summarizeTerminalOutput(output);
    expect(summary.totalTests).toBe(50);
  });
});

describe('parseDirectoryPaths', () => {
  it('groups by top-level directory', () => {
    const paths = ['src/a.ts', 'src/b.ts', 'tests/c.ts'];
    const summary = parseDirectoryPaths(paths);
    expect(summary.totalFiles).toBe(3);
    expect(summary.topLevelDirs.find((d) => d.name === 'src')?.count).toBe(2);
  });
});
