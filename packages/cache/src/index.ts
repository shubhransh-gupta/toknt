import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink, readdir, stat, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

export type CacheEntryType = 'file' | 'output' | 'directory' | 'tool';

export interface CacheEntry {
  id: string;
  type: CacheEntryType;
  hash: string;
  path?: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  lastAccessedAt: string;
}

export interface TokntConfig {
  mode: 'safe' | 'balanced' | 'aggressive';
  cacheDir?: string;
  maxCacheSizeMB?: number;
  watchEnabled?: boolean;
  watchPaths?: string[];
  integrations: {
    claude?: boolean;
    cursor?: boolean;
    codex?: boolean;
    windsurf?: boolean;
  };
}

export const DEFAULT_CONFIG: TokntConfig = {
  mode: 'safe',
  maxCacheSizeMB: 500,
  integrations: {},
};

export function getDefaultCacheDir(): string {
  return join(homedir(), '.toknt');
}

export function hashContent(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

export class LocalCache {
  private baseDir: string;
  private configPath: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? getDefaultCacheDir();
    this.configPath = join(this.baseDir, 'config.json');
  }

  getBaseDir(): string {
    return this.baseDir;
  }

  async ensureDirs(): Promise<void> {
    const dirs = ['cache', 'sessions', 'outputs', 'indexes', 'benchmarks'];
    for (const dir of dirs) {
      await mkdir(join(this.baseDir, dir), { recursive: true });
    }
  }

  async getConfig(): Promise<TokntConfig> {
    try {
      const raw = await readFile(this.configPath, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  async saveConfig(config: Partial<TokntConfig>): Promise<TokntConfig> {
    await this.ensureDirs();
    const current = await this.getConfig();
    const merged = { ...current, ...config };
    await writeFile(this.configPath, JSON.stringify(merged, null, 2));
    return merged;
  }

  private entryPath(id: string, type: CacheEntryType): string {
    const subdir = type === 'output' ? 'outputs' : type === 'directory' ? 'indexes' : 'cache';
    return join(this.baseDir, subdir, `${id}.json`);
  }

  async store(
    type: CacheEntryType,
    content: string,
    metadata: Record<string, unknown> = {},
    path?: string
  ): Promise<CacheEntry> {
    await this.ensureDirs();
    const hash = hashContent(content);
    const id = hash;
    const now = new Date().toISOString();
    const entry: CacheEntry = {
      id,
      type,
      hash,
      path,
      content,
      metadata,
      createdAt: now,
      lastAccessedAt: now,
    };
    await writeFile(this.entryPath(id, type), JSON.stringify(entry, null, 2));
    await this.enforceSizeLimit();
    return entry;
  }

  async get(id: string, type: CacheEntryType): Promise<CacheEntry | null> {
    try {
      const raw = await readFile(this.entryPath(id, type), 'utf-8');
      const entry = JSON.parse(raw) as CacheEntry;
      entry.lastAccessedAt = new Date().toISOString();
      await writeFile(this.entryPath(id, type), JSON.stringify(entry, null, 2));
      return entry;
    } catch {
      return null;
    }
  }

  async recall(uri: string): Promise<CacheEntry | null> {
    const match = uri.match(/^toknt:\/\/(file|output|directory|tool)\/([a-f0-9]+)$/);
    if (!match) return null;
    const [, type, id] = match;
    return this.get(id, type as CacheEntryType);
  }

  async has(id: string, type: CacheEntryType): Promise<boolean> {
    try {
      await stat(this.entryPath(id, type));
      return true;
    } catch {
      return false;
    }
  }

  async delete(id: string, type: CacheEntryType): Promise<void> {
    try {
      await unlink(this.entryPath(id, type));
    } catch {
      // ignore
    }
  }

  async clear(): Promise<number> {
    let count = 0;
    const subdirs = ['cache', 'outputs', 'indexes'];
    for (const subdir of subdirs) {
      const dir = join(this.baseDir, subdir);
      try {
        const files = await readdir(dir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            await unlink(join(dir, file));
            count++;
          }
        }
      } catch {
        // dir may not exist
      }
    }
    return count;
  }

  async getStats(): Promise<{ entries: number; sizeBytes: number }> {
    let entries = 0;
    let sizeBytes = 0;
    const subdirs = ['cache', 'outputs', 'indexes', 'sessions', 'benchmarks'];
    for (const subdir of subdirs) {
      const dir = join(this.baseDir, subdir);
      try {
        const files = await readdir(dir);
        for (const file of files) {
          const filePath = join(dir, file);
          const s = await stat(filePath);
          entries++;
          sizeBytes += s.size;
        }
      } catch {
        // ignore
      }
    }
    return { entries, sizeBytes };
  }

  async listEntries(): Promise<CacheEntry[]> {
    const entries: CacheEntry[] = [];
    const mapping: Array<[string, CacheEntryType]> = [
      ['cache', 'file'],
      ['outputs', 'output'],
      ['indexes', 'directory'],
    ];

    for (const [subdir, type] of mapping) {
      const dir = join(this.baseDir, subdir);
      try {
        const files = await readdir(dir);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          try {
            const raw = await readFile(join(dir, file), 'utf-8');
            entries.push(JSON.parse(raw) as CacheEntry);
          } catch {
            // skip corrupt entry
          }
        }
      } catch {
        // dir missing
      }
    }

    return entries;
  }

  async enforceSizeLimit(): Promise<number> {
    const config = await this.getConfig();
    const maxBytes = (config.maxCacheSizeMB ?? DEFAULT_CONFIG.maxCacheSizeMB ?? 500) * 1024 * 1024;
    let stats = await this.getStats();
    if (stats.sizeBytes <= maxBytes) return 0;

    const entries = await this.listEntries();
    entries.sort((a, b) => a.lastAccessedAt.localeCompare(b.lastAccessedAt));

    let evicted = 0;
    for (const entry of entries) {
      stats = await this.getStats();
      if (stats.sizeBytes <= maxBytes) break;
      await this.delete(entry.id, entry.type);
      evicted++;
    }

    return evicted;
  }

  makeUri(type: CacheEntryType, id: string): string {
    return `toknt://${type}/${id}`;
  }
}

export async function ensureParentDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}
