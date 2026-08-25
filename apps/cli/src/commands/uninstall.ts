import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { CursorAdapter } from '@toknt/integration-cursor';
import { printBanner, getCache } from '../utils.js';

export async function uninstallCommand(): Promise<void> {
  printBanner();
  console.log('Removing Tokn\'t integrations...\n');

  try {
    await new CursorAdapter().uninstall();
    console.log('  ✓ Removed cursor integration (hooks + plugin)');
  } catch {
    console.log('  - cursor integration not found');
  }

  const agents = ['claude', 'codex', 'windsurf'];
  for (const agent of agents) {
    const hookDir = join(homedir(), `.${agent}`, 'toknt');
    try {
      await rm(hookDir, { recursive: true, force: true });
      console.log(`  ✓ Removed ${agent} integration`);
    } catch {
      console.log(`  - ${agent} integration not found`);
    }
  }

  const cache = getCache();
  await cache.saveConfig({ integrations: {} });

  console.log('\n✓ Tokn\'t uninstalled.');
  console.log('  Cache preserved at:', cache.getBaseDir());
  console.log('  Run `toknt cache clear` to remove cached data.\n');
}
