import { detectAgents, printBanner, getCache } from '../utils.js';
import { isInstalled } from './install.js';
import { StatsStore } from '@toknt/cache';
import { formatTokenCount } from '@toknt/tokenizer';

export async function statusCommand(options?: { json?: boolean }): Promise<void> {
  const cache = getCache();
  const config = await cache.getConfig();
  const agents = await detectAgents();
  const cacheStats = await cache.getStats();
  const poolStats = await cache.getPoolStats();
  const statsStore = new StatsStore(cache.getBaseDir());
  const stats = await statsStore.load();

  if (options?.json) {
    console.log(
      JSON.stringify(
        {
          mode: config.mode,
          cacheDir: cache.getBaseDir(),
          cache: cacheStats,
          pool: poolStats,
          tokens: {
            originalTokens: stats.originalTokens,
            optimizedTokens: stats.optimizedTokens,
            savedTokens: stats.savedTokens,
            reductionPercent: stats.reductionPercent,
            compressedOutputs: stats.compressedOutputs,
            recalledOutputs: stats.recalledOutputs,
          },
          byAgent: stats.byAgent,
          byStrategy: stats.byStrategy,
          agents: await Promise.all(
            agents.map(async (a) => ({
              ...a,
              tokntInstalled: await isInstalled(a.id),
              stats: stats.byAgent[a.id.toLowerCase()] ?? null,
            }))
          ),
        },
        null,
        2
      )
    );
    return;
  }

  printBanner();
  console.log('Tokn\'t System & Cache Pool Status\n');
  console.log(`  Mode:            ${config.mode.toUpperCase()} (safe = deduplication only, balanced = test/listing summaries)`);
  console.log(`  Cache dir:       ${cache.getBaseDir()}`);
  console.log(`  Pool files:      ${poolStats.trackedFiles} files indexed`);
  console.log(`  Pool size:       ${(cacheStats.sizeBytes / 1024).toFixed(1)} KB`);
  console.log(`  Deduplications:  ${poolStats.duplicateHits} hits (${poolStats.totalReads} total reads tracked)\n`);

  console.log('Token Consumption & Savings\n');
  console.log(`  Original tokens processed:  ${formatTokenCount(stats.originalTokens)}`);
  console.log(`  Tokens delivered to agents: ${formatTokenCount(stats.optimizedTokens)}`);
  console.log(`  Tokens saved by Tokn't:     ${formatTokenCount(stats.savedTokens)} (${stats.reductionPercent}% reduction)`);
  console.log(`  Optimized outputs:          ${stats.compressedOutputs}`);
  console.log(`  Context recalls:            ${stats.recalledOutputs}\n`);

  console.log('AI Agent Integrations & Token Usage\n');
  console.log('  ' + 'Agent'.padEnd(18) + 'Status'.padEnd(26) + 'Consumed'.padEnd(12) + 'Saved'.padEnd(12) + 'Reduction');
  console.log('  ' + '─'.repeat(74));

  for (const agent of agents) {
    const tokntInstalled = await isInstalled(agent.id);
    const statusText = tokntInstalled
      ? '✓ active'
      : agent.installed
        ? '○ found (not active)'
        : '✗ not found';

    const agentStats = stats.byAgent[agent.id.toLowerCase()];
    const consumed = agentStats ? formatTokenCount(agentStats.originalTokens) : '0';
    const saved = agentStats ? formatTokenCount(agentStats.savedTokens) : '0';
    const reduction = agentStats && agentStats.originalTokens > 0 ? `${agentStats.reductionPercent}%` : '0%';

    console.log(
      '  ' +
        agent.name.padEnd(18) +
        statusText.padEnd(26) +
        consumed.padEnd(12) +
        saved.padEnd(12) +
        reduction
    );
  }

  // Display other recorded agents (e.g. MCP, custom scripts) not in detected list
  const standardIds = new Set(agents.map((a) => a.id.toLowerCase()));
  for (const [agentId, agentStats] of Object.entries(stats.byAgent)) {
    if (!standardIds.has(agentId)) {
      const name = agentId.toUpperCase();
      const statusText = '✓ recorded';
      const consumed = formatTokenCount(agentStats.originalTokens);
      const saved = formatTokenCount(agentStats.savedTokens);
      const reduction = agentStats.originalTokens > 0 ? `${agentStats.reductionPercent}%` : '0%';
      console.log(
        '  ' +
          name.padEnd(18) +
          statusText.padEnd(26) +
          consumed.padEnd(12) +
          saved.padEnd(12) +
          reduction
      );
    }
  }

  console.log('\n  Tip: Run "toknt install [agent]" to activate Tokn\'t for specific agents.\n');
}
