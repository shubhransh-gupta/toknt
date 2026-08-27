import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export interface AgentTokenStats {
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  requests: number;
  compressedOutputs: number;
  recalledOutputs: number;
  lastActive: string;
}

export interface StrategyStats {
  count: number;
  savedTokens: number;
}

export interface PersistedStats {
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  compressedOutputs: number;
  recalledOutputs: number;
  updatedAt: string;
  byAgent: Record<string, AgentTokenStats>;
  byStrategy: Record<string, StrategyStats>;
}

export const EMPTY_STATS: PersistedStats = {
  originalTokens: 0,
  optimizedTokens: 0,
  savedTokens: 0,
  reductionPercent: 0,
  compressedOutputs: 0,
  recalledOutputs: 0,
  updatedAt: new Date(0).toISOString(),
  byAgent: {},
  byStrategy: {},
};

function statsPath(baseDir: string): string {
  return join(baseDir, 'stats.json');
}

export class StatsStore {
  constructor(private baseDir: string) {}

  async load(): Promise<PersistedStats> {
    try {
      const raw = await readFile(statsPath(this.baseDir), 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...EMPTY_STATS,
        ...parsed,
        byAgent: parsed.byAgent ?? {},
        byStrategy: parsed.byStrategy ?? {},
      };
    } catch {
      return { ...EMPTY_STATS, byAgent: {}, byStrategy: {} };
    }
  }

  async save(stats: PersistedStats): Promise<void> {
    await mkdir(this.baseDir, { recursive: true });
    await writeFile(statsPath(this.baseDir), JSON.stringify(stats, null, 2));
  }

  async recordOptimization(
    originalTokens: number,
    optimizedTokens: number,
    agentId?: string,
    strategy?: string
  ): Promise<PersistedStats> {
    const stats = await this.load();
    const saved = Math.max(0, originalTokens - optimizedTokens);
    const now = new Date().toISOString();

    stats.originalTokens += originalTokens;
    stats.optimizedTokens += optimizedTokens;
    stats.savedTokens = Math.max(0, stats.originalTokens - stats.optimizedTokens);
    stats.reductionPercent =
      stats.originalTokens === 0
        ? 0
        : Math.round(((stats.originalTokens - stats.optimizedTokens) / stats.originalTokens) * 10000) / 100;
    stats.compressedOutputs += 1;
    stats.updatedAt = now;

    if (agentId) {
      const normalizedAgent = agentId.toLowerCase().trim();
      const current = stats.byAgent[normalizedAgent] ?? {
        originalTokens: 0,
        optimizedTokens: 0,
        savedTokens: 0,
        reductionPercent: 0,
        requests: 0,
        compressedOutputs: 0,
        recalledOutputs: 0,
        lastActive: now,
      };

      current.originalTokens += originalTokens;
      current.optimizedTokens += optimizedTokens;
      current.savedTokens = Math.max(0, current.originalTokens - current.optimizedTokens);
      current.reductionPercent =
        current.originalTokens === 0
          ? 0
          : Math.round(((current.originalTokens - current.optimizedTokens) / current.originalTokens) * 10000) / 100;
      current.compressedOutputs += 1;
      current.requests += 1;
      current.lastActive = now;

      stats.byAgent[normalizedAgent] = current;
    }

    if (strategy) {
      const current = stats.byStrategy[strategy] ?? { count: 0, savedTokens: 0 };
      current.count += 1;
      current.savedTokens += saved;
      stats.byStrategy[strategy] = current;
    }

    await this.save(stats);
    return stats;
  }

  async recordPassthrough(tokens: number, agentId?: string): Promise<PersistedStats> {
    const stats = await this.load();
    const now = new Date().toISOString();

    stats.originalTokens += tokens;
    stats.optimizedTokens += tokens;
    stats.updatedAt = now;

    if (agentId) {
      const normalizedAgent = agentId.toLowerCase().trim();
      const current = stats.byAgent[normalizedAgent] ?? {
        originalTokens: 0,
        optimizedTokens: 0,
        savedTokens: 0,
        reductionPercent: 0,
        requests: 0,
        compressedOutputs: 0,
        recalledOutputs: 0,
        lastActive: now,
      };
      current.originalTokens += tokens;
      current.optimizedTokens += tokens;
      current.requests += 1;
      current.lastActive = now;
      stats.byAgent[normalizedAgent] = current;
    }

    await this.save(stats);
    return stats;
  }

  async recordRecall(agentId?: string): Promise<PersistedStats> {
    const stats = await this.load();
    const now = new Date().toISOString();
    stats.recalledOutputs += 1;
    stats.updatedAt = now;

    if (agentId) {
      const normalizedAgent = agentId.toLowerCase().trim();
      if (stats.byAgent[normalizedAgent]) {
        stats.byAgent[normalizedAgent].recalledOutputs += 1;
        stats.byAgent[normalizedAgent].lastActive = now;
      }
    }

    await this.save(stats);
    return stats;
  }
}
