/**
 * Token counting for Tokn't.
 * Uses js-tiktoken (cl100k_base) for accurate estimates aligned with GPT-style models.
 * Falls back to a character heuristic if tiktoken fails.
 * These are ESTIMATES — not exact provider billing data.
 */

import { getEncoding, type Tiktoken } from 'js-tiktoken';

const CODE_CHAR_RATIO = 3.5;
const TEXT_CHAR_RATIO = 4.0;
const WHITESPACE_BONUS = 0.9;

let encoding: Tiktoken | null = null;

function getEncoder(): Tiktoken {
  if (!encoding) {
    encoding = getEncoding('cl100k_base');
  }
  return encoding;
}

export interface TokenEstimate {
  tokens: number;
  isEstimate: true;
  method: 'tiktoken' | 'heuristic';
}

function heuristicEstimate(text: string): number {
  const codeIndicators = /[{}\[\]();=<>]|function|const|let|var|import|export|class|def |async/;
  const isLikelyCode = codeIndicators.test(text.slice(0, 500));

  const ratio = isLikelyCode ? CODE_CHAR_RATIO : TEXT_CHAR_RATIO;
  const whitespaceRatio = (text.match(/\s/g)?.length ?? 0) / text.length;
  const adjustedRatio = ratio * (1 - whitespaceRatio * (1 - WHITESPACE_BONUS));

  return Math.ceil(text.length / adjustedRatio);
}

export function countTokensExact(text: string): number {
  if (!text || text.length === 0) return 0;
  return getEncoder().encode(text).length;
}

export function estimateTokens(text: string): TokenEstimate {
  if (!text || text.length === 0) {
    return { tokens: 0, isEstimate: true, method: 'tiktoken' };
  }

  try {
    const tokens = countTokensExact(text);
    return { tokens, isEstimate: true, method: 'tiktoken' };
  } catch {
    const tokens = heuristicEstimate(text);
    return { tokens, isEstimate: true, method: 'heuristic' };
  }
}

export function estimateTokensSaved(original: string, optimized: string): number {
  const orig = estimateTokens(original);
  const opt = estimateTokens(optimized);
  return Math.max(0, orig.tokens - opt.tokens);
}

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return String(tokens);
}

export function reductionPercent(original: number, optimized: number): number {
  if (original === 0) return 0;
  return Math.round(((original - optimized) / original) * 10000) / 100;
}
