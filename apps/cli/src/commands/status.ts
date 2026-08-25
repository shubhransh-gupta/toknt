import { detectAgents, getCache } from '../utils.js';
import { isInstalled } from './install.js';
import { StatsStore } from '@toknt/cache';
import { formatTokenCount } from '@toknt/tokenizer';

export async function statusCommand(): Promise<void> {
  const cache = getCache();
  const config = await cache.getConfig();
  const agents = await detectAgents();
  const stats = await cache.getStats();
  const tokStats = await new StatsStore(cache.getBaseDir()).load();

  console.log('Status\n');
  console.log(`  Mode:          ${config.mode}`);
  console.log(`  Cache dir:     ${cache.getBaseDir()}`);
  console.log(`  Cache entries: ${stats.entries}`);
  console.log(`  Cache size:    ${(stats.sizeBytes / 1024).toFixed(1)} KB`);
  console.log(`  Tokens saved:  ${formatTokenCount(tokStats.savedTokens)} (${tokStats.reductionPercent}%)`);
  console.log(`  Tool calls:    ${tokStats.toolCallsTracked}`);
  console.log(`  Tokens scanned:${formatTokenCount(tokStats.tokensScanned ?? 0)}`);
  console.log(`  Opportunity:   ${formatTokenCount(tokStats.opportunitySavedTokens)}`);
  console.log(`  Compressed:    ${tokStats.compressedOutputs}`);
  console.log(`  Recalled:      ${tokStats.recalledOutputs}\n`);

  console.log('Integrations:\n');
  for (const agent of agents) {
    const tokntInstalled = await isInstalled(agent.id);
    const status = tokntInstalled
      ? '✓ active'
      : agent.installed
        ? '○ agent found, toknt not installed'
        : '✗ not found';
    console.log(`  ${agent.name.padEnd(14)} ${status}`);
  }

  if (tokStats.toolCallsTracked === 0) {
    console.log('\n  No Agent tool calls tracked yet. Use Cursor Agent (not Ask-only),');
    console.log('  then run: toknt stats --watch\n');
  } else {
    console.log();
  }
}
