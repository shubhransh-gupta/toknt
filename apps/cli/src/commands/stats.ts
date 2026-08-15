import { printBanner, getCache } from '../utils.js';
import { StatsStore } from '@toknt/cache';
import { formatTokenCount } from '@toknt/tokenizer';

export async function statsCommand(options?: { json?: boolean }): Promise<void> {
  const cache = getCache();
  const stats = await new StatsStore(cache.getBaseDir()).load();

  if (options?.json) {
    console.log(JSON.stringify(stats, null, 2));
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
  console.log('  Note: Token counts are estimates, not exact billing data.\n');
}
