import { writeFile } from 'node:fs/promises';
import { printBanner } from '../utils.js';
import {
  runBenchmarkSimulation,
  runAllBenchmarks,
  formatBenchmarkOutput,
  BENCHMARK_TASKS,
} from '@toknt/benchmark';
import { detectAgents } from '../utils.js';

export async function benchmarkCommand(options: {
  agent?: string;
  task?: string;
  mode?: string;
  export?: string;
}): Promise<void> {
  printBanner();

  const agent = options.agent ?? 'cursor';
  const mode = (options.mode ?? 'balanced') as 'safe' | 'balanced' | 'aggressive';

  const agents = await detectAgents();
  const detected = agents.find((a) => a.id === agent);

  if (detected && !detected.installed) {
    console.log(`Agent not installed.\n`);
    console.log(`Benchmark skipped.\n`);
    console.log('[Running simulation with demo data instead]\n');
  }

  if (options.task) {
    const comparison = await runBenchmarkSimulation(options.task, agent, mode);
    console.log(formatBenchmarkOutput(comparison));

    if (options.export) {
      const { comparisonToResult } = await import('@toknt/benchmark');
      const result = comparisonToResult(comparison, agent, mode);
      await writeFile(options.export, JSON.stringify(result, null, 2));
      console.log(`\nExported to ${options.export}`);
    }
  } else {
    console.log('Running all benchmark tasks...\n');
    const results = await runAllBenchmarks(agent, mode);

    for (const result of results) {
      console.log(`── ${result.taskName} ──`);
      console.log(`  Without: ${result.originalTokens.toLocaleString()} tokens`);
      console.log(`  With:    ${result.optimizedTokens.toLocaleString()} tokens`);
      console.log(`  Saved:   ${result.reductionPercent}%`);
      console.log(`  Success: ${result.taskSuccess ? '✓' : '✗'}`);
      console.log(`  Score:   ${result.efficiencyScore}/100`);
      if (result.isDemo) console.log('  [DEMO DATA]');
      console.log();
    }

    if (options.export) {
      await writeFile(options.export, JSON.stringify(results, null, 2));
      console.log(`Exported to ${options.export}`);
    }
  }
}
