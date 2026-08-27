import { countTokensExact } from '@toknt/tokenizer';

/** Skip compression when savings are negligible (avoids recall boilerplate inflating small content). */
export function shouldApplyCompression(
  original: string,
  compressed: string,
  minSavingsRatio = 0.1
): boolean {
  const origTokens = countTokensExact(original);
  const optTokens = countTokensExact(compressed);
  if (origTokens <= 0) return false;
  return (origTokens - optTokens) / origTokens >= minSavingsRatio;
}
