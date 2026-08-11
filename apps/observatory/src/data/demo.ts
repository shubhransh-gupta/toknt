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
  isMeasured?: boolean;
  efficiencyScore: number;
  savingsBreakdown?: Record<string, number>;
  tokenMethod?: string;
}

/** Locally measured with tiktoken cl100k_base — see scripts/accuracy-audit.mjs */
export const DEMO_RESULTS: BenchmarkResult[] = [
  {
    agent: 'cursor',
    task: 'fix-authentication',
    taskName: 'Mixed agent session (measured)',
    originalTokens: 38216,
    optimizedTokens: 3236,
    savedTokens: 34980,
    reductionPercent: 91.53,
    toolCalls: 7,
    toolCallsOptimized: 7,
    taskSuccess: true,
    executionTimeMs: 0,
    executionTimeOptimizedMs: 0,
    mode: 'balanced',
    timestamp: '2026-08-11T07:18:24Z',
    isMeasured: true,
    isDemo: false,
    efficiencyScore: 90,
    tokenMethod: 'tiktoken cl100k_base',
    savingsBreakdown: {
      duplicate_file: 35,
      terminal_output: 40,
      directory_listing: 15,
      duplicate_tool_output: 10,
    },
  },
  {
    agent: 'cursor',
    task: 'safe-mode-session',
    taskName: 'Same session — safe mode (default)',
    originalTokens: 38216,
    optimizedTokens: 35741,
    savedTokens: 2475,
    reductionPercent: 6.5,
    toolCalls: 7,
    toolCallsOptimized: 7,
    taskSuccess: true,
    executionTimeMs: 0,
    executionTimeOptimizedMs: 0,
    mode: 'safe',
    timestamp: '2026-08-11T07:18:24Z',
    isMeasured: true,
    isDemo: false,
    efficiencyScore: 72,
    tokenMethod: 'tiktoken cl100k_base',
    savingsBreakdown: {
      duplicate_file: 70,
      duplicate_tool_output: 30,
    },
  },
  {
    agent: 'cursor',
    task: 'real-repo-reads',
    taskName: 'Real repo duplicate file reads',
    originalTokens: 8640,
    optimizedTokens: 4632,
    savedTokens: 4008,
    reductionPercent: 46.4,
    toolCalls: 5,
    toolCallsOptimized: 5,
    taskSuccess: true,
    executionTimeMs: 0,
    executionTimeOptimizedMs: 0,
    mode: 'safe',
    timestamp: '2026-08-11T07:18:24Z',
    isMeasured: true,
    isDemo: false,
    efficiencyScore: 78,
    tokenMethod: 'tiktoken cl100k_base',
  },
];

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function aggregateStats(results: BenchmarkResult[]) {
  const measured = results.filter((r) => r.isMeasured);
  const pool = measured.length > 0 ? measured : results;

  const totalOriginal = pool.reduce((s, r) => s + r.originalTokens, 0);
  const totalOptimized = pool.reduce((s, r) => s + r.optimizedTokens, 0);
  const totalSaved = totalOriginal - totalOptimized;
  const avgReduction = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100) : 0;
  const successRate = pool.length > 0
    ? (pool.filter((r) => r.taskSuccess).length / pool.length) * 100
    : 0;

  return {
    totalOriginal,
    totalOptimized,
    totalSaved,
    avgReduction,
    successRate,
    runCount: pool.length,
  };
}
