import { describe, it, expect } from 'vitest';
import { computeEfficiencyScore, createComparison } from '../src/scoring.js';
import { BENCHMARK_TASKS } from '../src/types.js';

describe('computeEfficiencyScore', () => {
  it('scores failed tasks poorly', () => {
    const score = computeEfficiencyScore({
      reductionPercent: 70,
      taskSuccess: false,
      toolCallReduction: 20,
      executionTimeRatio: 0.9,
      safetyConfidence: 0.9,
    });
    expect(score).toBeLessThan(20);
  });

  it('scores successful tasks well', () => {
    const score = computeEfficiencyScore({
      reductionPercent: 40,
      taskSuccess: true,
      toolCallReduction: 10,
      executionTimeRatio: 0.95,
      safetyConfidence: 0.95,
    });
    expect(score).toBeGreaterThan(60);
  });
});

describe('createComparison', () => {
  it('creates valid comparison', () => {
    const comparison = createComparison(
      BENCHMARK_TASKS[0],
      { tokens: 100000, toolCalls: 40, taskSuccess: true, executionTimeMs: 30000 },
      { tokens: 60000, toolCalls: 35, taskSuccess: true, executionTimeMs: 28000 },
      true
    );
    expect(comparison.reductionPercent).toBe(40);
    expect(comparison.taskCorrectnessPreserved).toBe(true);
    expect(comparison.isDemo).toBe(true);
  });
});
