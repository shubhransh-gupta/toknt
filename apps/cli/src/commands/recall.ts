import { printBanner, getCache } from '../utils.js';
import { StatsStore } from '@toknt/cache';
import { TokntEngine } from '@toknt/core';

export async function recallCommand(uri: string, options?: { json?: boolean }): Promise<void> {
  const cache = getCache();
  const engine = new TokntEngine({ cache });

  const content = await engine.recall(uri);
  if (!content) {
    if (options?.json) {
      console.log(JSON.stringify({ uri, content: null, error: 'not_found' }));
      process.exit(1);
    }
    printBanner();
    console.error(`Could not recall: ${uri}`);
    console.error('Check the URI format: toknt://file|output|directory|tool/<id>\n');
    process.exit(1);
  }

  await new StatsStore(cache.getBaseDir()).recordRecall();

  if (options?.json) {
    console.log(JSON.stringify({ uri, content }));
    return;
  }

  printBanner();
  console.log(`Recalled: ${uri}\n`);
  console.log('─'.repeat(40));
  console.log(content);
  console.log('─'.repeat(40));
  console.log();
}
