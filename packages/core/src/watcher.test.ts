import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalCache } from '@toknt/cache';
import { TokntEngine, FileWatcher, type ContextItem } from '../src/index.js';

describe('FileWatcher', () => {
  let tmpDir: string;
  let engine: TokntEngine;
  let watcher: FileWatcher;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'toknt-watch-'));
    engine = new TokntEngine({ cache: new LocalCache(tmpDir), mode: 'balanced' });
  });

  afterEach(async () => {
    watcher?.stop();
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('invalidates duplicate tracking when file changes on disk', async () => {
    const filePath = join(tmpDir, 'tracked.ts');
    const contentV1 = 'export const x = 1;';
    const contentV2 = 'export const x = 2;';
    await writeFile(filePath, contentV1);

    const item = (content: string): ContextItem => ({
      id: crypto.randomUUID(),
      type: 'file_read',
      content,
      path: filePath,
    });

    await engine.processContextItem(item(contentV1));
    const dup = await engine.processContextItem(item(contentV1));
    expect(dup.optimized).toBe(true);

    watcher = new FileWatcher({ engine, paths: [tmpDir] });
    watcher.start();

    await writeFile(filePath, contentV2);
    await new Promise((r) => setTimeout(r, 250));

    const afterChange = await engine.processContextItem(item(contentV2));
    expect(afterChange.optimized).toBe(false);
  });
});

describe('TokntEngine.invalidateFile', () => {
  let engine: TokntEngine;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'toknt-inv-'));
    engine = new TokntEngine({ cache: new LocalCache(tmpDir), mode: 'balanced' });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('clears path so changed content is not deduplicated', async () => {
    const path = 'changed.ts';
    const v1 = 'version one content here';
    const v2 = 'version two different content';

    const item = (content: string): ContextItem => ({
      id: crypto.randomUUID(),
      type: 'file_read',
      content,
      path,
    });

    await engine.processContextItem(item(v1));
    await engine.processContextItem(item(v1));
    engine.invalidateFile(path);
    const result = await engine.processContextItem(item(v2));
    expect(result.optimized).toBe(false);
  });
});
