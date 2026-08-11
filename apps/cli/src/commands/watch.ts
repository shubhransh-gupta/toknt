import { printBanner, getCache, getEngine } from '../utils.js';
import { FileWatcher } from '@toknt/core';
import { resolve } from 'node:path';

export async function watchCommand(watchPath?: string): Promise<void> {
  printBanner();
  const cache = getCache();
  const config = await cache.getConfig();
  const paths = watchPath
    ? [resolve(watchPath)]
    : config.watchPaths?.map((p) => resolve(p)) ?? [process.cwd()];

  const engine = await getEngine();
  const watcher = new FileWatcher({
    engine,
    paths,
    onInvalidate: (path) => {
      console.log(`  ↻ invalidated ${path}`);
    },
  });

  console.log('Tokn\'t file watcher — clearing duplicate cache on file changes\n');
  console.log(`  Mode: ${config.mode}`);
  console.log(`  Watching: ${paths.join(', ')}\n`);
  console.log('Press Ctrl+C to stop.\n');

  watcher.start();

  await new Promise<void>((resolvePromise) => {
    process.on('SIGINT', () => {
      watcher.stop();
      console.log('\nWatcher stopped.');
      resolvePromise();
    });
  });
}
