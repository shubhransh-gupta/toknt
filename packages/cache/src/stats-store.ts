import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export interface PersistedStats {
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  compressedOutputs: number;
  recalledOutputs: number;
  updatedAt: string;
}

export const EMPTY_STATS: PersistedStats = {
  originalTokens: 0,
  optimizedTokens: 0,
  savedTokens: 0,
  reductionPercent: 0,
  compressedOutputs: 0,
  recalledOutputs: 0,
  updatedAt: new Date(0).toISOString(),
};

function statsPath(baseDir: string): string {
  return join(baseDir, 'stats.json');
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

  async recordRecall(): Promise<PersistedStats> {
    const stats = await this.load();
    stats.recalledOutputs += 1;
    stats.updatedAt = new Date().toISOString();
    await this.save(stats);
    return stats;
  }
}
