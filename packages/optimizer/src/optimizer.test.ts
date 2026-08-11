import { describe, it, expect } from 'vitest';
import { DuplicateTracker, summarizeTerminalOutput, parseDirectoryPaths } from '../src/index.js';

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

describe('summarizeTerminalOutput', () => {
  it('extracts test results', () => {
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
});

describe('parseDirectoryPaths', () => {
  it('groups by top-level directory', () => {
    const paths = ['src/a.ts', 'src/b.ts', 'tests/c.ts'];
    const summary = parseDirectoryPaths(paths);
    expect(summary.totalFiles).toBe(3);
    expect(summary.topLevelDirs.find((d) => d.name === 'src')?.count).toBe(2);
  });
});
