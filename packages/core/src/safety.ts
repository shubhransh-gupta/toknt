import type { ClassificationResult, ContextItem, OptimizationMode } from './classifier.js';
import { classifyContextItem, shouldCompress } from './classifier.js';

export interface SafetyValidationResult {
  safe: boolean;
  action: 'compress' | 'passthrough';
  reason: string;
  confidence: number;
}

const SECRET_PATTERNS = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{20,}/i,
  /bearer\s+[a-zA-Z0-9_\-.]+/i,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  /(?:password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{4,}/i,
  /(?:secret|token)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{16,}/i,
  /AKIA[0-9A-Z]{16}/,
  /(?:aws_secret|aws_access)[_\w]*\s*[:=]/i,
  /ghp_[a-zA-Z0-9]{36}/,
  /sk-[a-zA-Z0-9]{20,}/,
  /xox[baprs]-[a-zA-Z0-9\-]+/,
];

export function containsSecrets(content: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(content));
}

export function redactSecrets(content: string): string {
  let redacted = content;
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

export function validateSafety(
  item: ContextItem,
  classification: ClassificationResult,
  mode: OptimizationMode
): SafetyValidationResult {
  if (containsSecrets(item.content)) {
    return {
      safe: false,
      action: 'passthrough',
      reason: 'Potential secrets detected — never compress',
      confidence: 1.0,
    };
  }

  if (classification.level === 'CRITICAL') {
    return {
      safe: false,
      action: 'passthrough',
      reason: classification.reason,
      confidence: 1.0,
    };
  }

  if (!shouldCompress(classification, mode)) {
    return {
      safe: false,
      action: 'passthrough',
      reason: 'Not eligible for compression in current mode',
      confidence: 0.9,
    };
  }

  const confidence =
    classification.level === 'DUPLICATE'
      ? 1.0
      : classification.level === 'RECOVERABLE'
        ? 0.85
        : 0.6;

  return {
    safe: true,
    action: 'compress',
    reason: classification.reason,
    confidence,
  };
}

export function validateOptimization(
  item: ContextItem,
  mode: OptimizationMode
): SafetyValidationResult {
  const classification = classifyContextItem(item, mode);
  return validateSafety(item, classification, mode);
}
