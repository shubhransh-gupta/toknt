import { printBanner, getCache } from '../utils.js';
import { TokntEngine } from '@toknt/core';

export async function recallCommand(uri: string): Promise<void> {
  printBanner();
  const cache = getCache();
  const engine = new TokntEngine({ cache });

  const content = await engine.recall(uri);
  if (!content) {
    console.error(`Could not recall: ${uri}`);
    console.error('Check the URI format: toknt://file|output|directory|tool/<id>\n');
    process.exit(1);
  }

  console.log(`Recalled: ${uri}\n`);
  console.log('─'.repeat(40));
  console.log(content);
  console.log('─'.repeat(40));
  console.log();
}
