export interface BenchmarkResult {
  agent: string;
  task: string;
  taskName: string;
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  toolCalls: number;
  toolCallsOptimized: number;
  taskSuccess: boolean;
  executionTimeMs: number;
  executionTimeOptimizedMs: number;
  mode: string;
  timestamp: string;
  isDemo?: boolean;
  efficiencyScore: number;
  savingsBreakdown?: Record<string, number>;
}

export const DEMO_RESULTS: BenchmarkResult[] = [
  {
    agent: 'cursor',
    task: 'fix-authentication',
    taskName: 'Fix Authentication Bug',
    originalTokens: 182421,
    optimizedTokens: 112421,
    savedTokens: 70000,
    reductionPercent: 38.37,
    toolCalls: 42,
    toolCallsOptimized: 39,
    taskSuccess: true,
    executionTimeMs: 45000,
    executionTimeOptimizedMs: 42000,
    mode: 'balanced',
    timestamp: '2026-01-15T10:00:00Z',
    isDemo: true,
    efficiencyScore: 82.4,
    savingsBreakdown: {
      duplicate_file: 41,
      terminal_output: 27,
      directory_listing: 14,
      duplicate_tool_output: 11,
      stale_context: 7,
    },
  },
  {
    agent: 'claude',
    task: 'add-api-endpoint',
    taskName: 'Add API Endpoint',
    originalTokens: 156800,
    optimizedTokens: 98400,
    savedTokens: 58400,
    reductionPercent: 37.24,
    toolCalls: 38,
    toolCallsOptimized: 35,
    taskSuccess: true,
    executionTimeMs: 52000,
    executionTimeOptimizedMs: 48000,
    mode: 'balanced',
    timestamp: '2026-01-15T11:00:00Z',
    isDemo: true,
    efficiencyScore: 79.8,
    savingsBreakdown: {
      duplicate_file: 38,
      terminal_output: 30,
      directory_listing: 16,
      duplicate_tool_output: 10,
      stale_context: 6,
    },
  },
  {
    agent: 'codex',
    task: 'fix-failing-tests',
    taskName: 'Fix Failing Tests',
    originalTokens: 198500,
    optimizedTokens: 121300,
    savedTokens: 77200,
    reductionPercent: 38.89,
    toolCalls: 45,
    toolCallsOptimized: 41,
    taskSuccess: true,
    executionTimeMs: 61000,
    executionTimeOptimizedMs: 57000,
    mode: 'balanced',
    timestamp: '2026-01-15T12:00:00Z',
    isDemo: true,
    efficiencyScore: 83.1,
  },
];

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function aggregateStats(results: BenchmarkResult[]) {
  const totalOriginal = results.reduce((s, r) => s + r.originalTokens, 0);
  const totalOptimized = results.reduce((s, r) => s + r.optimizedTokens, 0);
  const totalSaved = totalOriginal - totalOptimized;
  const avgReduction = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100) : 0;
  const successRate = results.length > 0
    ? (results.filter((r) => r.taskSuccess).length / results.length) * 100
    : 0;

  return {
    totalOriginal,
    totalOptimized,
    totalSaved,
    avgReduction,
    successRate,
    runCount: results.length,
  };
}
