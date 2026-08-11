import { detectAgents, printBanner, getCache } from '../utils.js';
import { isInstalled } from './install.js';

export async function statusCommand(): Promise<void> {
  printBanner();
  const cache = getCache();
  const config = await cache.getConfig();
  const agents = await detectAgents();
  const stats = await cache.getStats();

  console.log('Status\n');
  console.log(`  Mode:        ${config.mode}`);
  console.log(`  Cache dir:   ${cache.getBaseDir()}`);
  console.log(`  Cache entries: ${stats.entries}`);
  console.log(`  Cache size:  ${(stats.sizeBytes / 1024).toFixed(1)} KB\n`);

  console.log('Integrations:\n');
  for (const agent of agents) {
    const tokntInstalled = await isInstalled(agent.id);
    const status = tokntInstalled ? '✓ active' : agent.installed ? '○ agent found, toknt not installed' : '✗ not found';
    console.log(`  ${agent.name.padEnd(14)} ${status}`);
  }
  console.log();
}
