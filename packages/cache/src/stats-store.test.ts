import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { StatsStore } from '../src/stats-store.js';

describe('StatsStore', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'toknt-stats-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('starts empty', async () => {
    const store = new StatsStore(tmpDir);
    const stats = await store.load();
    expect(stats.savedTokens).toBe(0);
    expect(stats.compressedOutputs).toBe(0);
  });

  it('accumulates optimization stats', async () => {
    const store = new StatsStore(tmpDir);
    await store.recordOptimization(1000, 200);
    await store.recordOptimization(500, 100);
    const stats = await store.load();
    expect(stats.originalTokens).toBe(1500);
    expect(stats.optimizedTokens).toBe(300);
    expect(stats.savedTokens).toBe(1200);
    expect(stats.compressedOutputs).toBe(2);
    expect(stats.reductionPercent).toBe(80);
  });

  it('records recalls', async () => {
    const store = new StatsStore(tmpDir);
    await store.recordRecall();
    const stats = await store.load();
    expect(stats.recalledOutputs).toBe(1);
  });

  it('tracks per-agent token metrics and breakdown', async () => {
    const store = new StatsStore(tmpDir);
    await store.recordOptimization(1000, 200, 'cursor', 'duplicate_file');
    await store.recordOptimization(500, 100, 'antigravity', 'terminal_output');
    await store.recordPassthrough(300, 'cursor');
    await store.recordRecall('antigravity');

    const stats = await store.load();
    expect(stats.byAgent['cursor']).toBeDefined();
    expect(stats.byAgent['cursor'].originalTokens).toBe(1300);
    expect(stats.byAgent['cursor'].optimizedTokens).toBe(500);
    expect(stats.byAgent['cursor'].savedTokens).toBe(800);
    expect(stats.byAgent['cursor'].requests).toBe(2);

    expect(stats.byAgent['antigravity']).toBeDefined();
    expect(stats.byAgent['antigravity'].originalTokens).toBe(500);
    expect(stats.byAgent['antigravity'].savedTokens).toBe(400);
    expect(stats.byAgent['antigravity'].recalledOutputs).toBe(1);

    expect(stats.byStrategy['duplicate_file']).toEqual({ count: 1, savedTokens: 800 });
    expect(stats.byStrategy['terminal_output']).toEqual({ count: 1, savedTokens: 400 });
  });
});
