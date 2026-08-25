import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface PersistedStats {
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  compressedOutputs: number;
  recalledOutputs: number;
  /** Every Agent tool call Tokn't saw (Shell, Read, Grep, …). */
  toolCallsTracked: number;
  /** Tokens estimated across all observed tool outputs (always rises with activity). */
  tokensScanned: number;
  /** Waste detected on tools Cursor cannot rewrite (e.g. Read) — not delivered. */
  opportunitySavedTokens: number;
  opportunityCount: number;
  lastTool?: string;
  lastEventAt?: string;
  lastSavedTokens?: number;
  lastDelivered?: boolean;
  updatedAt: string;
}

export const EMPTY_STATS: PersistedStats = {
  originalTokens: 0,
  optimizedTokens: 0,
  savedTokens: 0,
  reductionPercent: 0,
  compressedOutputs: 0,
  recalledOutputs: 0,
  toolCallsTracked: 0,
  tokensScanned: 0,
  opportunitySavedTokens: 0,
  opportunityCount: 0,
  updatedAt: new Date(0).toISOString(),
};

export interface ActivityEvent {
  at: string;
  tool: string;
  delivered: boolean;
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  strategy?: string;
}

function statsPath(baseDir: string): string {
  return join(baseDir, 'stats.json');
}

function activityPath(baseDir: string): string {
  return join(baseDir, 'activity.jsonl');
}

function livePath(baseDir: string): string {
  return join(baseDir, 'live.json');
}

export class StatsStore {
  constructor(private baseDir: string) {}

  async load(): Promise<PersistedStats> {
    try {
      const raw = await readFile(statsPath(this.baseDir), 'utf-8');
      return { ...EMPTY_STATS, ...JSON.parse(raw) };
    } catch {
      return { ...EMPTY_STATS };
    }
  }

  async save(stats: PersistedStats): Promise<void> {
    await mkdir(this.baseDir, { recursive: true });
    await writeFile(statsPath(this.baseDir), JSON.stringify(stats, null, 2));
    await writeFile(
      livePath(this.baseDir),
      JSON.stringify(
        {
          updatedAt: stats.updatedAt,
          savedTokens: stats.savedTokens,
          reductionPercent: stats.reductionPercent,
          compressedOutputs: stats.compressedOutputs,
          toolCallsTracked: stats.toolCallsTracked,
          tokensScanned: stats.tokensScanned,
          opportunitySavedTokens: stats.opportunitySavedTokens,
          lastTool: stats.lastTool,
          lastEventAt: stats.lastEventAt,
          lastSavedTokens: stats.lastSavedTokens,
          lastDelivered: stats.lastDelivered,
        },
        null,
        2
      )
    );
  }

  async recordOptimization(originalTokens: number, optimizedTokens: number): Promise<PersistedStats> {
    const stats = await this.load();
    stats.originalTokens += originalTokens;
    stats.optimizedTokens += optimizedTokens;
    stats.savedTokens = Math.max(0, stats.originalTokens - stats.optimizedTokens);
    stats.reductionPercent =
      stats.originalTokens === 0
        ? 0
        : Math.round(((stats.originalTokens - stats.optimizedTokens) / stats.originalTokens) * 10000) / 100;
    stats.compressedOutputs += 1;
    stats.updatedAt = new Date().toISOString();
    await this.save(stats);
    return stats;
  }

  async recordOpportunity(originalTokens: number, optimizedTokens: number): Promise<PersistedStats> {
    const saved = Math.max(0, originalTokens - optimizedTokens);
    const stats = await this.load();
    stats.opportunitySavedTokens += saved;
    stats.opportunityCount += 1;
    stats.updatedAt = new Date().toISOString();
    await this.save(stats);
    return stats;
  }

  async recordToolCall(tool: string): Promise<PersistedStats> {
    const stats = await this.load();
    stats.toolCallsTracked += 1;
    stats.lastTool = tool;
    stats.lastEventAt = new Date().toISOString();
    stats.updatedAt = stats.lastEventAt;
    await this.save(stats);
    return stats;
  }

  async recordEvent(event: Omit<ActivityEvent, 'at'>): Promise<PersistedStats> {
    const at = new Date().toISOString();
    const full: ActivityEvent = { at, ...event };
    await mkdir(this.baseDir, { recursive: true });
    await appendFile(activityPath(this.baseDir), `${JSON.stringify(full)}\n`);

    const stats = await this.load();
    stats.toolCallsTracked += 1;
    stats.tokensScanned += Math.max(0, event.originalTokens);
    stats.lastTool = event.tool;
    stats.lastEventAt = at;
    stats.lastSavedTokens = event.savedTokens;
    stats.lastDelivered = event.delivered;
    stats.updatedAt = at;
    await this.save(stats);
    return stats;
  }

  async recordRecall(): Promise<PersistedStats> {
    const stats = await this.load();
    stats.recalledOutputs += 1;
    stats.updatedAt = new Date().toISOString();
    await this.save(stats);
    return stats;
  }

  async reset(): Promise<PersistedStats> {
    const stats: PersistedStats = { ...EMPTY_STATS, updatedAt: new Date().toISOString() };
    await this.save(stats);
    try {
      await writeFile(activityPath(this.baseDir), '');
    } catch {
      // ignore
    }
    return stats;
  }

  async recentActivity(limit = 20): Promise<ActivityEvent[]> {
    try {
      const raw = await readFile(activityPath(this.baseDir), 'utf-8');
      const lines = raw.trim().split('\n').filter(Boolean);
      return lines
        .slice(-limit)
        .map((line) => JSON.parse(line) as ActivityEvent)
        .reverse();
    } catch {
      return [];
    }
  }
}
