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

  it('tracks opportunity and activity events', async () => {
    const store = new StatsStore(tmpDir);
    await store.recordOpportunity(1000, 100);
    await store.recordEvent({
      tool: 'Read',
      delivered: false,
      originalTokens: 1000,
      optimizedTokens: 100,
      savedTokens: 900,
      strategy: 'duplicate_file',
    });
    const stats = await store.load();
    expect(stats.opportunitySavedTokens).toBe(900);
    expect(stats.toolCallsTracked).toBe(1);
    const recent = await store.recentActivity();
    expect(recent[0]?.tool).toBe('Read');
  });
});
