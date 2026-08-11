import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { OptimizingAdapterWrapper } from '@toknt/adapters';
import { LocalCache } from '@toknt/cache';

/** Mirrors plugins/cursor/hooks/after-tool-call.js */
async function afterToolCall(
  wrapper: OptimizingAdapterWrapper,
  event: {
    toolName?: string;
    tool?: string;
    output?: string | unknown;
    path?: string;
    arguments?: { path?: string };
    metadata?: Record<string, unknown>;
  }
) {
  if (!event?.output) return event;

  const content =
    typeof event.output === 'string' ? event.output : JSON.stringify(event.output);

  const optimized = await wrapper.processToolOutput({
    toolName: event.toolName ?? event.tool ?? 'unknown',
    content,
    path: event.path ?? event.arguments?.path,
    metadata: event.metadata,
  });

  return {
    ...event,
    output: optimized.content,
    toknt: optimized.metadata?.toknt,
  };
}

describe('Cursor hook (e2e)', () => {
  let tmpDir: string;
  let wrapper: OptimizingAdapterWrapper;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'toknt-cursor-e2e-'));
    const cache = new LocalCache(tmpDir);
    await cache.saveConfig({ mode: 'balanced' });
    wrapper = new OptimizingAdapterWrapper(cache, 'balanced');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('passes through first file read', async () => {
    const result = await afterToolCall(wrapper, {
      toolName: 'Read',
      output: 'file content here',
      path: 'src/app.ts',
    });
    expect(result.toknt?.optimized).toBe(false);
    expect(result.output).toBe('file content here');
  });

  it('compresses duplicate file read via afterToolCall', async () => {
    const content = 'export class AuthService { login() {} }';
    await afterToolCall(wrapper, { toolName: 'Read', output: content, path: 'AuthService.ts' });

    const result = await afterToolCall(wrapper, {
      toolName: 'Read',
      output: content,
      path: 'AuthService.ts',
    });

    expect(result.toknt?.optimized).toBe(true);
    expect(result.output).toContain('[UNCHANGED FILE]');
    expect(result.toknt?.recallUri).toMatch(/^toknt:\/\/file\//);
  });

  it('compresses large terminal output', async () => {
    const output = 'RUN v2\n' + Array.from({ length: 200 }, (_, i) => `PASS test_${i}`).join('\n');
    const result = await afterToolCall(wrapper, {
      toolName: 'Shell',
      output,
    });
    expect(result.toknt?.optimized).toBe(true);
    expect(result.output).toContain('TEST RESULT');
  });

  it('never compresses user request content', async () => {
    const result = await afterToolCall(wrapper, {
      toolName: 'unknown',
      output: 'Fix the auth bug without breaking logout',
    });
    expect(result.toknt?.optimized).toBe(false);
  });

  it('recalls compressed content by URI', async () => {
    const content = 'same file content for recall test';
    await afterToolCall(wrapper, { toolName: 'Read', output: content, path: 'recall.ts' });
    const compressed = await afterToolCall(wrapper, {
      toolName: 'Read',
      output: content,
      path: 'recall.ts',
    });

    const recalled = await wrapper.processRecall(compressed.toknt!.recallUri!);
    expect(recalled).toBe(content);
  });
});
