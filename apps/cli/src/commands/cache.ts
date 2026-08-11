import { printBanner, getCache } from '../utils.js';

export async function cacheCommand(): Promise<void> {
  printBanner();
  const cache = getCache();
  const stats = await cache.getStats();
  const config = await cache.getConfig();

  console.log('Cache Information\n');
  console.log(`  Directory:  ${cache.getBaseDir()}`);
  console.log(`  Entries:    ${stats.entries}`);
  console.log(`  Size:       ${(stats.sizeBytes / 1024).toFixed(1)} KB`);
  console.log(`  Mode:       ${config.mode}\n`);
}

export async function cacheClearCommand(): Promise<void> {
  printBanner();
  const cache = getCache();
  const count = await cache.clear();
  console.log(`Cleared ${count} cache entries.\n`);
}
