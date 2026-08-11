import { createHash } from 'node:crypto';
import { summarizeByRunner } from './parsers.js';

export type { TestRunner } from './parsers.js';
export { detectTestRunner, parseJestOutput, parseVitestOutput, parsePytestOutput } from './parsers.js';

export interface TerminalSummary {
  totalTests: number;
  passed: number;
  failed: number;
  failures: string[];
  lineCount: number;
  exitCode?: number;
}

const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, '');
}

export function summarizeTerminalOutput(content: string): TerminalSummary {
  return summarizeByRunner(content);
}

export function formatTerminalSummary(summary: TerminalSummary, recallUri: string): string {
  const parts = [
    'TEST RESULT',
    '',
    `${summary.totalTests.toLocaleString()} tests`,
    `${summary.passed.toLocaleString()} passed`,
    `${summary.failed.toLocaleString()} failed`,
  ];

  if (summary.failures.length > 0) {
    parts.push('', 'FAILURES', '');
    for (const f of summary.failures) {
      parts.push(`❌ ${f}`);
    }
  }

  parts.push('', 'Full output stored locally.', `Reference: ${recallUri}`);
  return parts.join('\n');
}

export function shouldCompressTerminal(content: string, threshold = 100): boolean {
  return content.split('\n').length >= threshold;
}

export function hashOutput(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}
