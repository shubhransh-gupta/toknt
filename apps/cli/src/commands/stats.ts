import { printBanner, getEngine } from '../utils.js';
import { formatTokenCount } from '@toknt/tokenizer';

export async function statsCommand(options?: { json?: boolean }): Promise<void> {
  const jsonFlag = process.argv.includes('--json');
  const engine = await getEngine();
  const stats = engine.metrics.getAllTimeStats();
  const breakdown = engine.metrics.getSavingsBreakdown();

  if (jsonFlag) {
    console.log(JSON.stringify({ ...stats, breakdown }, null, 2));
    return;
  }

  printBanner();
  console.log('Token Statistics\n');
  console.log(`  Original tokens:  ${formatTokenCount(stats.originalTokens)} (estimated)`);
  console.log(`  Optimized tokens: ${formatTokenCount(stats.optimizedTokens)} (estimated)`);
  console.log(`  Tokens saved:     ${formatTokenCount(stats.savedTokens)}`);
  console.log(`  Reduction:        ${stats.reductionPercent}%`);
  console.log(`  Compressed:       ${stats.compressedOutputs}`);
  console.log(`  Recalled:         ${stats.recalledOutputs}\n`);

  if (Object.keys(breakdown).length > 0) {
    console.log('Savings breakdown:\n');
    for (const [strategy, pct] of Object.entries(breakdown)) {
      console.log(`  ${strategy.padEnd(24)} ${pct}%`);
    }
    console.log();
  }

  console.log('  Note: Token counts are estimates, not exact billing data.\n');
}
