export interface BenchmarkTask {
  id: string;
  name: string;
  description: string;
  expectedBehavior: string;
}

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
  efficiencyScore: number;
  savingsBreakdown?: Record<string, number>;
}

export interface BenchmarkComparison {
  task: BenchmarkTask;
  without: {
    tokens: number;
    toolCalls: number;
    taskSuccess: boolean;
    executionTimeMs: number;
  };
  withToknt: {
    tokens: number;
    toolCalls: number;
    taskSuccess: boolean;
    executionTimeMs: number;
  };
  reductionPercent: number;
  taskCorrectnessPreserved: boolean;
  efficiencyScore: number;
}

export const BENCHMARK_TASKS: BenchmarkTask[] = [
  {
    id: 'fix-authentication',
    name: 'Fix Authentication Bug',
    description: 'Find and fix an authentication bug in the codebase',
    expectedBehavior: 'Auth tests pass, login flow works',
  },
  {
    id: 'add-api-endpoint',
    name: 'Add API Endpoint',
    description: 'Add a new API endpoint with tests',
    expectedBehavior: 'New endpoint responds correctly, tests pass',
  },
  {
    id: 'fix-failing-tests',
    name: 'Fix Failing Tests',
    description: 'Fix failing tests without changing intended behavior',
    expectedBehavior: 'All tests pass, behavior unchanged',
  },
  {
    id: 'refactor-networking',
    name: 'Refactor Networking Module',
    description: 'Refactor the networking module for clarity',
    expectedBehavior: 'Tests pass, API unchanged',
  },
  {
    id: 'offline-caching',
    name: 'Implement Offline Caching',
    description: 'Implement offline caching functionality',
    expectedBehavior: 'Cache works offline, tests pass',
  },
  {
    id: 'fix-production-crash',
    name: 'Fix Production Crash',
    description: 'Investigate and fix a simulated production crash',
    expectedBehavior: 'Crash resolved, error handling improved',
  },
];
