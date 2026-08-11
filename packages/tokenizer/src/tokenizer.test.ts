import { describe, it, expect } from 'vitest';
import { estimateTokens, countTokensExact } from '../src/index.js';

const SAMPLES = [
  'Hello world, this is a plain text sentence for testing.',
  `export class AuthService {
  login() { return true; }
  logout() { return true; }
}`,
  'RUN v2\n' + Array.from({ length: 50 }, (_, i) => (i % 5 === 0 ? `FAIL test_${i}` : `PASS test_${i}`)).join('\n'),
  Array.from({ length: 80 }, (_, i) => `src/components/File_${i}.tsx`).join('\n'),
  JSON.stringify({ users: Array.from({ length: 20 }, (_, i) => ({ id: i, name: `user_${i}` })) }),
  'diff --git a/src/app.ts\n+added line\n-removed line',
  '# README\n\nTokn\'t reduces token waste in AI coding agents.\n\n## Install\n\n```bash\nnpm install -g toknt\n```',
  'const x = 1;\n'.repeat(100),
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30),
  'async function fetchData(url: string): Promise<Response> {\n  return fetch(url);\n}',
];

describe('estimateTokens accuracy vs tiktoken', () => {
  it('uses tiktoken method for non-empty content', () => {
    const result = estimateTokens('hello world');
    expect(result.method).toBe('tiktoken');
    expect(result.tokens).toBeGreaterThan(0);
  });

  it('matches tiktoken exactly on diverse samples', () => {
    let totalErrorPct = 0;

    for (const sample of SAMPLES) {
      const estimated = estimateTokens(sample).tokens;
      const exact = countTokensExact(sample);
      const errorPct = exact === 0 ? 0 : (Math.abs(estimated - exact) / exact) * 100;
      totalErrorPct += errorPct;
      expect(estimated).toBe(exact);
    }

    const avgError = totalErrorPct / SAMPLES.length;
    expect(avgError).toBeLessThan(15);
  });

  it('returns 0 for empty string', () => {
    expect(estimateTokens('').tokens).toBe(0);
  });
});
