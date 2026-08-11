import { reductionPercent } from '@toknt/tokenizer';
import type { BenchmarkComparison, BenchmarkResult, BenchmarkTask } from './types.js';

export function computeEfficiencyScore(params: {
  reductionPercent: number;
  taskSuccess: boolean;
  toolCallReduction: number;
  executionTimeRatio: number;
  safetyConfidence: number;
}): number {
  if (!params.taskSuccess) {
    return Math.min(10, params.reductionPercent * 0.1);
  }

  const tokenScore = Math.min(40, params.reductionPercent * 0.8);
  const correctnessScore = 30;
  const toolScore = Math.min(15, params.toolCallReduction * 3);
  const timeScore = Math.min(10, (1 - params.executionTimeRatio) * 10);
  const safetyScore = params.safetyConfidence * 5;

  return Math.round((tokenScore + correctnessScore + toolScore + timeScore + safetyScore) * 10) / 10;
}

export function createComparison(
  task: BenchmarkTask,
  without: BenchmarkComparison['without'],
  withToknt: BenchmarkComparison['withToknt'],
): BenchmarkComparison {
  const reduction = reductionPercent(without.tokens, withToknt.tokens);
  const toolCallReduction =
    without.toolCalls > 0
      ? ((without.toolCalls - withToknt.toolCalls) / without.toolCalls) * 100
      : 0;
  const timeRatio =
    without.executionTimeMs > 0
      ? withToknt.executionTimeMs / without.executionTimeMs
      : 1;

  const taskCorrectnessPreserved = withToknt.taskSuccess && without.taskSuccess;

  const efficiencyScore = computeEfficiencyScore({
    reductionPercent: reduction,
    taskSuccess: taskCorrectnessPreserved,
    toolCallReduction,
    executionTimeRatio: timeRatio,
    safetyConfidence: 0.95,
  });

  return {
    task,
    without,
    withToknt,
    reductionPercent: reduction,
    taskCorrectnessPreserved,
    efficiencyScore,
  };
}

export function comparisonToResult(
  comparison: BenchmarkComparison,
  agent: string,
  mode: string
): BenchmarkResult {
  return {
    agent,
    task: comparison.task.id,
    taskName: comparison.task.name,
    originalTokens: comparison.without.tokens,
    optimizedTokens: comparison.withToknt.tokens,
    savedTokens: comparison.without.tokens - comparison.withToknt.tokens,
    reductionPercent: comparison.reductionPercent,
    toolCalls: comparison.without.toolCalls,
    toolCallsOptimized: comparison.withToknt.toolCalls,
    taskSuccess: comparison.taskCorrectnessPreserved,
    executionTimeMs: comparison.without.executionTimeMs,
    executionTimeOptimizedMs: comparison.withToknt.executionTimeMs,
    mode,
    timestamp: new Date().toISOString(),
    efficiencyScore: comparison.efficiencyScore,
  };
}

export function formatBenchmarkOutput(comparison: BenchmarkComparison): string {
  const lines = [
    'TOKN\'T BENCHMARK',
    '',
    `Task:`,
    comparison.task.name,
    '',
    'WITHOUT TOKN\'T',
    '────────────────────',
    '',
    `Tokens:`,
    comparison.without.tokens.toLocaleString(),
    '',
    `Tool calls:`,
    String(comparison.without.toolCalls),
    '',
    `Tests:`,
    comparison.without.taskSuccess ? 'PASS' : 'FAIL',
    '',
    '',
    'WITH TOKN\'T',
    '────────────────────',
    '',
    `Tokens:`,
    comparison.withToknt.tokens.toLocaleString(),
    '',
    `Tool calls:`,
    String(comparison.withToknt.toolCalls),
    '',
    `Tests:`,
    comparison.withToknt.taskSuccess ? 'PASS' : 'FAIL',
    '',
    '',
    'TOKEN REDUCTION',
    '',
    `${comparison.reductionPercent}%`,
    '',
    '',
    'TASK CORRECTNESS',
    '',
    comparison.taskCorrectnessPreserved ? 'PRESERVED ✓' : 'FAILED ✗',
  ];

  if (!comparison.taskCorrectnessPreserved) {
    lines.push('', 'Optimization rejected.');
  }

  lines.push('', `Efficiency Score: ${comparison.efficiencyScore}/100`);

  return lines.join('\n');
}
