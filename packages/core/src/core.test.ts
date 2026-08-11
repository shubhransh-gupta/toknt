import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TokntEngine, type ContextItem } from '../src/index.js';
import { LocalCache } from '@toknt/cache';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { classifyContextItem, shouldCompress } from '../src/classifier.js';
import { containsSecrets, redactSecrets } from '../src/safety.js';

describe('TokntEngine', () => {
  let engine: TokntEngine;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'toknt-engine-'));
    engine = new TokntEngine({ cache: new LocalCache(tmpDir), mode: 'balanced' });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('passes through first file read', async () => {
    const item: ContextItem = {
      id: '1',
      type: 'file_read',
      content: 'file content here',
      path: 'test.ts',
    };
    const result = await engine.processContextItem(item);
    expect(result.optimized).toBe(false);
  });

  it('compresses duplicate file read', async () => {
    const content = 'same file content';
    const item: ContextItem = { id: '1', type: 'file_read', content, path: 'dup.ts' };
    await engine.processContextItem(item);

    const item2: ContextItem = { id: '2', type: 'file_read', content, path: 'dup.ts' };
    const result = await engine.processContextItem(item2);
    expect(result.optimized).toBe(true);
    expect(result.content).toContain('[UNCHANGED FILE]');
    expect(result.recallUri).toBeTruthy();
  });

  it('compresses large terminal output', async () => {
    const lines = Array.from({ length: 200 }, (_, i) => `test ${i} passed`).join('\n');
    const item: ContextItem = { id: '1', type: 'terminal_output', content: lines };
    const result = await engine.processContextItem(item);
    expect(result.optimized).toBe(true);
    expect(result.content).toContain('TEST RESULT');
  });

  it('compresses directory listing', async () => {
    const paths = Array.from({ length: 100 }, (_, i) => `src/file_${i}.ts`).join('\n');
    const item: ContextItem = { id: '1', type: 'directory_listing', content: paths };
    const result = await engine.processContextItem(item);
    expect(result.optimized).toBe(true);
    expect(result.content).toContain('PROJECT STRUCTURE');
  });

  it('never compresses user request', async () => {
    const item: ContextItem = { id: '1', type: 'user_request', content: 'Fix the bug' };
    const result = await engine.processContextItem(item);
    expect(result.optimized).toBe(false);
  });

  it('recalls compressed content', async () => {
    const content = 'same content';
    const item: ContextItem = { id: '1', type: 'file_read', content, path: 'recall.ts' };
    await engine.processContextItem(item);
    const item2: ContextItem = { id: '2', type: 'file_read', content, path: 'recall.ts' };
    const result = await engine.processContextItem(item2);

    const recalled = await engine.recall(result.recallUri!);
    expect(recalled).toBe(content);
  });
});

describe('classifier', () => {
  it('marks user request as CRITICAL', () => {
    const result = classifyContextItem({ id: '1', type: 'user_request', content: 'fix bug' });
    expect(result.level).toBe('CRITICAL');
    expect(result.compressible).toBe(false);
  });

  it('allows duplicate compression in safe mode', () => {
    const result = classifyContextItem(
      { id: '1', type: 'file_read', content: 'x', metadata: { isDuplicate: true } },
      'safe'
    );
    expect(shouldCompress(result, 'safe')).toBe(true);
  });
});

describe('safety', () => {
  it('detects API keys', () => {
    expect(containsSecrets('api_key=sk-1234567890123456789012345678901234')).toBe(true);
  });

  it('redacts secrets', () => {
    const redacted = redactSecrets('api_key=sk-1234567890123456789012345678901234');
    expect(redacted).toContain('[REDACTED]');
  });

  it('does not redact normal content', () => {
    expect(redactSecrets('const x = 42;')).toBe('const x = 42;');
  });
});
