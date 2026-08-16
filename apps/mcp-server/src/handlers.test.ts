import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalCache, StatsStore } from '@toknt/cache';
import { handleToolCall } from './handlers.js';

describe('MCP handlers', () => {
  let tmpDir: string;
  let cache: LocalCache;
  let statsStore: StatsStore;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'toknt-mcp-'));
    cache = new LocalCache(tmpDir);
    await cache.ensureDirs();
    statsStore = new StatsStore(tmpDir);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('toknt_config returns mode and cache path', async () => {
    const result = await handleToolCall('toknt_config', {}, { cache, statsStore });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.config.mode).toBe('safe');
    expect(parsed.path).toBe(tmpDir);
  });

  it('toknt_stats returns empty stats for fresh install', async () => {
    const result = await handleToolCall('toknt_stats', {}, { cache, statsStore });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.savedTokens).toBe(0);
  });

  it('toknt_recall returns not_found for invalid URI', async () => {
    const result = await handleToolCall('toknt_recall', { uri: 'toknt://file/nope' }, { cache, statsStore });
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe('not_found');
  });

  it('toknt_compress optimizes large terminal output in balanced mode', async () => {
    await cache.saveConfig({ mode: 'balanced' });
    const lines = Array.from({ length: 200 }, (_, i) => `line ${i} ok`).join('\n');
    const output = `=== RUN TestFoo\n${lines}\n--- PASS: TestFoo (0.01s)\nPASS\nok\tpkg\t0.1s\n`;

    const result = await handleToolCall('toknt_compress', {
      type: 'terminal_output',
      content: output,
    }, { cache, statsStore });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.optimized).toBe(true);
    expect(parsed.recallUri).toMatch(/^toknt:\/\//);
    expect(parsed.content.length).toBeLessThan(output.length);
  });

  it('toknt_compress rejects invalid type', async () => {
    const result = await handleToolCall('toknt_compress', {
      type: 'user_request',
      content: 'hello',
    }, { cache, statsStore });

    expect(result.isError).toBe(true);
  });
});
