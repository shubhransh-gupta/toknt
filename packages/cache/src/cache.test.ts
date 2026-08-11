import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalCache, hashContent } from '../src/index.js';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('LocalCache', () => {
  let cache: LocalCache;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'toknt-test-'));
    cache = new LocalCache(tmpDir);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('stores and retrieves content', async () => {
    const entry = await cache.store('file', 'hello world', { path: 'test.ts' }, 'test.ts');
    expect(entry.id).toBeTruthy();
    expect(entry.hash).toBe(hashContent('hello world'));

    const retrieved = await cache.get(entry.id, 'file');
    expect(retrieved?.content).toBe('hello world');
  });

  it('recalls by URI', async () => {
    const entry = await cache.store('output', 'big output');
    const uri = cache.makeUri('output', entry.id);
    const recalled = await cache.recall(uri);
    expect(recalled?.content).toBe('big output');
  });

  it('clears cache', async () => {
    await cache.store('file', 'content1');
    await cache.store('file', 'content2');
    const count = await cache.clear();
    expect(count).toBeGreaterThan(0);
  });

  it('saves and loads config', async () => {
    const config = await cache.saveConfig({ mode: 'balanced' });
    expect(config.mode).toBe('balanced');
    const loaded = await cache.getConfig();
    expect(loaded.mode).toBe('balanced');
  });

  it('evicts oldest entries when over size limit', async () => {
    await cache.saveConfig({ maxCacheSizeMB: 0.000001 });
    await cache.store('file', 'a'.repeat(500));
    await cache.store('file', 'b'.repeat(500));
    const stats = await cache.getStats();
    expect(stats.entries).toBeLessThan(3);
  });
});

describe('hashContent', () => {
  it('produces consistent hashes', () => {
    expect(hashContent('test')).toBe(hashContent('test'));
    expect(hashContent('test')).not.toBe(hashContent('other'));
  });
});
