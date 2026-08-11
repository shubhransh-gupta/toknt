import { describe, it, expect } from 'vitest';
import { estimateTokens, formatTokenCount, reductionPercent } from '../src/index.js';

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('').tokens).toBe(0);
  });

  it('estimates tokens for text', () => {
    const result = estimateTokens('Hello world, this is a test sentence.');
    expect(result.tokens).toBeGreaterThan(0);
    expect(result.isEstimate).toBe(true);
  });

  it('estimates more tokens for longer content', () => {
    const short = estimateTokens('hello');
    const long = estimateTokens('hello '.repeat(100));
    expect(long.tokens).toBeGreaterThan(short.tokens);
  });
});

describe('formatTokenCount', () => {
  it('formats thousands', () => {
    expect(formatTokenCount(1500)).toBe('1.5K');
  });

  it('formats millions', () => {
    expect(formatTokenCount(2_500_000)).toBe('2.50M');
  });
});

describe('reductionPercent', () => {
  it('calculates reduction', () => {
    expect(reductionPercent(100, 60)).toBe(40);
  });

  it('returns 0 for no reduction', () => {
    expect(reductionPercent(100, 100)).toBe(0);
  });
});
