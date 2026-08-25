import { watch } from 'node:fs';
import { join } from 'node:path';
import { getCache } from '../utils.js';
import { StatsStore } from '@toknt/cache';
import { formatTokenCount } from '@toknt/tokenizer';

function printStats(
  stats: Awaited<ReturnType<StatsStore['load']>>,
  recent: Awaited<ReturnType<StatsStore['recentActivity']>>,
  meta?: { refreshedAt: Date; reason: string }
): void {
  console.log("Tokn't live savings (Cursor Agent)\n");
  console.log(`  Delivered saved:   ${formatTokenCount(stats.savedTokens)} (${stats.reductionPercent}%)`);
  console.log(`  Delivered comps:   ${stats.compressedOutputs}`);
  console.log(`  Tool calls seen:   ${stats.toolCallsTracked}`);
  console.log(`  Tokens scanned:    ${formatTokenCount(stats.tokensScanned ?? 0)}`);
  console.log(
    `  Opportunity:       ${formatTokenCount(stats.opportunitySavedTokens)} detected (not deliverable via Cursor hooks)`
  );
  if (stats.lastTool) {
    console.log(
      `  Last event:        ${stats.lastTool} · saved ${formatTokenCount(stats.lastSavedTokens ?? 0)}` +
        (stats.lastDelivered ? ' · delivered' : ' · tracked')
    );
  }
  console.log();
  if (recent.length) {
    console.log('  Recent activity:');
    for (const e of recent.slice(0, 8)) {
      const tag = e.delivered ? 'DELIVERED' : e.savedTokens > 0 ? 'opportunity' : 'seen';
      console.log(
        `    [${tag}] ${e.tool}  -${formatTokenCount(e.savedTokens)}  ${e.strategy ?? ''}`.trimEnd()
      );
    }
    console.log();
  }
  console.log('  Delivered = model actually got less context (Shell wrap / MCP).');
  console.log('  Opportunity = waste Tokn\'t saw on Read/etc. (Cursor cannot strip those yet).');
  console.log('  Live view: toknt stats --watch   ·   Reset: toknt stats --reset');
  if (meta) {
    console.log(`\n  Watching ~/.toknt — ${meta.refreshedAt.toLocaleTimeString()} · ${meta.reason} (Ctrl+C to stop)`);
  } else {
    console.log();
  }
}

export async function statsCommand(options?: {
  json?: boolean;
  reset?: boolean;
  watch?: boolean;
}): Promise<void> {
  const cache = getCache();
  const store = new StatsStore(cache.getBaseDir());

  if (options?.reset) {
    const stats = await store.reset();
    if (options.json) {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }
    console.log('Token statistics reset.\n');
    return;
  }

  if (options?.watch) {
    let rendering = false;
    let pendingReason = 'start';

    const render = async (reason: string) => {
      pendingReason = reason;
      if (rendering) return;
      rendering = true;
      try {
        while (true) {
          const why = pendingReason;
          pendingReason = '';
          const stats = await store.load();
          const recent = await store.recentActivity(8);
          process.stdout.write('\x1b[H\x1b[2J');
          printStats(stats, recent, { refreshedAt: new Date(), reason: why || 'poll' });
          if (!pendingReason) break;
        }
      } finally {
        rendering = false;
      }
    };

    await render('start');

    const base = cache.getBaseDir();
    const watchers = ['stats.json', 'live.json', 'activity.jsonl'].map((name) => {
      try {
        return watch(join(base, name), () => {
          void render(`update:${name}`);
        });
      } catch {
        return null;
      }
    });

    const timer = setInterval(() => {
      void render('poll');
    }, 2000);

    await new Promise<void>((resolve) => {
      const stop = () => {
        clearInterval(timer);
        for (const w of watchers) w?.close();
        console.log('\n');
        resolve();
      };
      process.on('SIGINT', stop);
      process.on('SIGTERM', stop);
    });
    return;
  }

  const stats = await store.load();
  const recent = await store.recentActivity(8);

  if (options?.json) {
    console.log(JSON.stringify({ ...stats, recent }, null, 2));
    return;
  }

  printStats(stats, recent);
}
