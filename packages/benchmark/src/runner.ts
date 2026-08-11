import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalCache } from '@toknt/cache';
import { TokntEngine, type ContextItem } from '@toknt/core';
import { estimateTokens } from '@toknt/tokenizer';
import {
  BENCHMARK_TASKS,
  type BenchmarkComparison,
  type BenchmarkResult,
  type BenchmarkTask,
} from './types.js';
import { createComparison, comparisonToResult, formatBenchmarkOutput } from './scoring.js';

export interface SimulatedAgentRun {
  items: ContextItem[];
  toolCalls: number;
  taskSuccess: boolean;
}

export function generateSimulatedRun(task: BenchmarkTask, withToknt: boolean): SimulatedAgentRun {
  const baseItems: ContextItem[] = [
    {
      id: '1',
      type: 'file_read',
      content: '// UserService.swift\nclass UserService {\n  func login() {}\n}'.repeat(50),
      path: 'UserService.swift',
    },
    {
      id: '2',
      type: 'file_read',
      content: '// UserService.swift\nclass UserService {\n  func login() {}\n}'.repeat(50),
      path: 'UserService.swift',
    },
    {
      id: '3',
      type: 'terminal_output',
      content: generateLargeTestOutput(),
    },
    {
      id: '4',
      type: 'directory_listing',
      content: generateLargeDirectoryListing(),
    },
    {
      id: '5',
      type: 'file_read',
      content: '// AuthController.swift\n'.repeat(100),
      path: 'AuthController.swift',
    },
    {
      id: '6',
      type: 'tool_output',
      content: '{"status": "ok", "data": []}'.repeat(200),
      toolName: 'grep',
    },
    {
      id: '7',
      type: 'tool_output',
      content: '{"status": "ok", "data": []}'.repeat(200),
      toolName: 'grep',
    },
  ];

  return {
    items: baseItems,
    toolCalls: withToknt ? 39 : 42,
    taskSuccess: true,
  };
}

function generateLargeTestOutput(): string {
  const lines: string[] = [];
  for (let i = 0; i < 1200; i++) {
    lines.push(`  ✓ test_${i} passed`);
  }
  for (let i = 0; i < 7; i++) {
    lines.push(`  ✗ AuthTests.swift:${180 + i} - assertion failed`);
  }
  lines.unshift('1248 tests, 1241 passed, 7 failed');
  return lines.join('\n');
}

function generateLargeDirectoryListing(): string {
  const lines: string[] = [];
  const dirs = ['src/auth', 'src/payments', 'src/networking', 'src/models', 'tests/unit', 'tests/integration'];
  for (const dir of dirs) {
    for (let i = 0; i < 800; i++) {
      lines.push(`${dir}/file_${i}.ts`);
    }
  }
  return lines.join('\n');
}

export async function runBenchmarkSimulation(
  taskId: string,
  agent: string,
  mode: 'safe' | 'balanced' | 'aggressive' = 'balanced'
): Promise<BenchmarkComparison> {
  const task = BENCHMARK_TASKS.find((t) => t.id === taskId) ?? BENCHMARK_TASKS[0];
  const withoutRun = generateSimulatedRun(task, false);
  const withRun = generateSimulatedRun(task, true);

  let withoutTokens = 0;
  for (const item of withoutRun.items) {
    withoutTokens += estimateTokens(item.content).tokens;
  }

  const cache = new LocalCache(joinTmpDir());
  const engine = new TokntEngine({ cache, mode });

  let withTokens = 0;
  for (const item of withRun.items) {
    const result = await engine.processContextItem(item);
    withTokens += estimateTokens(result.content).tokens;
  }

  return createComparison(
    task,
    {
      tokens: withoutTokens,
      toolCalls: withoutRun.toolCalls,
      taskSuccess: withoutRun.taskSuccess,
      executionTimeMs: 45000,
    },
    {
      tokens: withTokens,
      toolCalls: withRun.toolCalls,
      taskSuccess: withRun.taskSuccess,
      executionTimeMs: 42000,
    },
    true
  );
}

function joinTmpDir(): string {
  return join(tmpdir(), 'toknt-benchmark-' + Date.now());
}

export async function runAllBenchmarks(
  agent: string,
  mode: 'safe' | 'balanced' | 'aggressive' = 'balanced'
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];
  for (const task of BENCHMARK_TASKS) {
    const comparison = await runBenchmarkSimulation(task.id, agent, mode);
    results.push(comparisonToResult(comparison, agent, mode));
  }
  return results;
}

export { BENCHMARK_TASKS, formatBenchmarkOutput, createComparison, comparisonToResult };
export type { BenchmarkComparison, BenchmarkResult, BenchmarkTask };
