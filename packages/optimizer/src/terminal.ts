import { createHash } from 'node:crypto';

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
  const clean = stripAnsi(content);
  const lines = clean.split('\n');
  const failures: string[] = [];

  const passMatch = clean.match(/(\d+)\s+pass/i);
  const failMatch = clean.match(/(\d+)\s+fail/i);
  const testMatch = clean.match(/(\d+)\s+test/i);

  for (const line of lines) {
    if (/FAIL|✗|❌|×|failed|AssertionError|Error:/i.test(line)) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 300) {
        failures.push(trimmed);
      }
    }
  }

  return {
    totalTests: testMatch ? parseInt(testMatch[1], 10) : lines.length,
    passed: passMatch ? parseInt(passMatch[1], 10) : 0,
    failed: failMatch ? parseInt(failMatch[1], 10) : failures.length,
    failures: failures.slice(0, 20),
    lineCount: lines.length,
  };
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
