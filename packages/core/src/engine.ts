import { createHash } from 'node:crypto';
import type { LocalCache } from '@toknt/cache';
import type { OptimizationMode } from './classifier.js';
import type { ContextItem, ContextItemType } from './classifier.js';
import { classifyContextItem } from './classifier.js';
import { validateOptimization, redactSecrets } from './safety.js';
import { MetricsEngine } from './metrics.js';

export interface OptimizationResult {
  content: string;
  optimized: boolean;
  strategy?: string;
  recallUri?: string;
  safetyConfidence: number;
  passthroughReason?: string;
}

export interface TokntEngineOptions {
  cache: LocalCache;
  mode?: OptimizationMode;
  sessionId?: string;
}

export class TokntEngine {
  readonly cache: LocalCache;
  readonly mode: OptimizationMode;
  readonly metrics: MetricsEngine;

  private fileHashes = new Map<string, string>();
  private toolOutputHashes = new Map<string, string>();

  constructor(options: TokntEngineOptions) {
    this.cache = options.cache;
    this.mode = options.mode ?? 'safe';
    this.metrics = new MetricsEngine(options.sessionId);
  }

  async processContextItem(item: ContextItem): Promise<OptimizationResult> {
    this.metrics.recordToolCall();

    const enriched = this.enrichWithDuplicateInfo(item);
    const validation = validateOptimization(enriched, this.mode);

    if (validation.action === 'passthrough') {
      const safeContent = redactSecrets(item.content);
      this.metrics.recordPassthrough(safeContent);
      return {
        content: safeContent,
        optimized: false,
        safetyConfidence: validation.confidence,
        passthroughReason: validation.reason,
      };
    }

    const result = await this.compress(enriched);
    this.metrics.recordOptimization(
      item.content,
      result.content,
      result.strategy ?? 'unknown',
      result.safetyConfidence
    );
    return result;
  }

  private enrichWithDuplicateInfo(item: ContextItem): ContextItem {
    if (item.type === 'file_read' && item.path) {
      const hash = this.hashContent(item.content);
      const prevHash = this.fileHashes.get(item.path);
      if (prevHash && prevHash === hash) {
        return { ...item, metadata: { ...item.metadata, isDuplicate: true, hash } };
      }
      this.fileHashes.set(item.path, hash);
      return { ...item, metadata: { ...item.metadata, hash } };
    }

    if (item.type === 'tool_output') {
      const hash = this.hashContent(item.content);
      const key = item.toolName ?? 'default';
      const prevHash = this.toolOutputHashes.get(key);
      if (prevHash && prevHash === hash) {
        return { ...item, metadata: { ...item.metadata, isDuplicate: true, hash } };
      }
      this.toolOutputHashes.set(key, hash);
      return { ...item, metadata: { ...item.metadata, hash } };
    }

    return item;
  }

  private async compress(item: ContextItem): Promise<OptimizationResult> {
    if (item.type === 'file_read' && item.metadata?.isDuplicate) {
      return this.compressDuplicateFile(item);
    }

    if (item.type === 'tool_output' && item.metadata?.isDuplicate) {
      return this.compressDuplicateToolOutput(item);
    }

    if (item.type === 'terminal_output') {
      return this.compressTerminalOutput(item);
    }

    if (item.type === 'directory_listing') {
      return this.compressDirectoryListing(item);
    }

    return {
      content: redactSecrets(item.content),
      optimized: false,
      safetyConfidence: 0,
      passthroughReason: 'No applicable optimizer',
    };
  }

  private async compressDuplicateFile(item: ContextItem): Promise<OptimizationResult> {
    const hash = item.metadata?.hash as string;
    const path = item.path ?? 'unknown';
    await this.cache.store('file', item.content, { path }, path);
    const uri = this.cache.makeUri('file', hash);

    const compressed = `[UNCHANGED FILE]

${path} was already loaded.

Content hash:
${hash}

Full content is available for recall.
Reference: ${uri}`;

    return {
      content: compressed,
      optimized: true,
      strategy: 'duplicate_file',
      recallUri: uri,
      safetyConfidence: 1.0,
    };
  }

  private async compressDuplicateToolOutput(item: ContextItem): Promise<OptimizationResult> {
    const hash = item.metadata?.hash as string;
    await this.cache.store('tool', item.content, { toolName: item.toolName });
    const uri = this.cache.makeUri('tool', hash);

    const compressed = `[UNCHANGED TOOL OUTPUT]

Previously returned:
output:${hash}

No changes detected.
Reference: ${uri}`;

    return {
      content: compressed,
      optimized: true,
      strategy: 'duplicate_tool_output',
      recallUri: uri,
      safetyConfidence: 1.0,
    };
  }

  private async compressTerminalOutput(item: ContextItem): Promise<OptimizationResult> {
    const summary = parseTerminalOutput(item.content);
    const entry = await this.cache.store('output', item.content, {
      lines: item.content.split('\n').length,
    });
    const uri = this.cache.makeUri('output', entry.id);

    const compressed = `TEST RESULT

${summary.summary}

${summary.failures.length > 0 ? 'FAILURES\n\n' + summary.failures.map((f) => `❌ ${f}`).join('\n') : ''}

Full output stored locally.
Reference: ${uri}`;

    return {
      content: compressed.trim(),
      optimized: true,
      strategy: 'terminal_output',
      recallUri: uri,
      safetyConfidence: 0.85,
    };
  }

  private async compressDirectoryListing(item: ContextItem): Promise<OptimizationResult> {
    const structure = parseDirectoryListing(item.content);
    const entry = await this.cache.store('directory', item.content, {
      totalFiles: structure.totalFiles,
    });
    const uri = this.cache.makeUri('directory', entry.id);

    const compressed = `PROJECT STRUCTURE

${structure.tree}

Total:
${structure.totalFiles.toLocaleString()} files

Detailed listing available for recall.
Reference: ${uri}`;

    return {
      content: compressed,
      optimized: true,
      strategy: 'directory_listing',
      recallUri: uri,
      safetyConfidence: 0.85,
    };
  }

  async recall(uri: string): Promise<string | null> {
    const entry = await this.cache.recall(uri);
    if (!entry) return null;
    this.metrics.recordRecall();
    return entry.content;
  }

  invalidateFile(path: string, newContent: string): void {
    const hash = this.hashContent(newContent);
    this.fileHashes.set(path, hash);
  }

  private hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }
}

function parseTerminalOutput(content: string): { summary: string; failures: string[] } {
  const lines = content.split('\n');
  const failures: string[] = [];

  const passMatch = content.match(/(\d+)\s+pass/i);
  const failMatch = content.match(/(\d+)\s+fail/i);
  const testMatch = content.match(/(\d+)\s+test/i);

  const total = testMatch ? parseInt(testMatch[1], 10) : lines.length;
  const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
  const failed = failMatch ? parseInt(failMatch[1], 10) : 0;

  for (const line of lines) {
    if (/FAIL|✗|❌|failed|error/i.test(line) && line.trim().length > 0) {
      const cleaned = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
      if (cleaned.length < 200) failures.push(cleaned);
    }
  }

  const summary = `${total.toLocaleString()} tests\n${passed.toLocaleString()} passed\n${failed.toLocaleString()} failed`;

  return { summary, failures: failures.slice(0, 10) };
}

function parseDirectoryListing(content: string): { tree: string; totalFiles: number } {
  const lines = content.split('\n').filter((l) => l.trim());
  const dirs = new Map<string, number>();

  for (const line of lines) {
    const parts = line.replace(/^\.\//, '').split('/');
    if (parts.length > 0) {
      const topDir = parts[0];
      dirs.set(topDir, (dirs.get(topDir) ?? 0) + 1);
    }
  }

  const sorted = [...dirs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const tree = sorted
    .map(([dir, count]) => `${dir}/          ${count.toLocaleString()} files`)
    .join('\n');

  return { tree, totalFiles: lines.length };
}

export function detectContextType(
  toolName: string,
  content: string,
  metadata?: Record<string, unknown>
): ContextItemType {
  const lower = toolName.toLowerCase();

  if (lower.includes('read') && metadata?.path) return 'file_read';
  if (lower.includes('write') || lower.includes('edit')) return 'edited_file';
  if (lower.includes('shell') || lower.includes('terminal') || lower.includes('bash'))
    return 'terminal_output';
  if (lower.includes('glob') || lower.includes('list') || lower.includes('find'))
    return 'directory_listing';
  if (lower.includes('grep') || lower.includes('search')) return 'tool_output';
  if (lower.includes('diff')) return 'git_diff';

  if (content.includes('BEGIN PRIVATE KEY') || content.includes('api_key')) {
    return 'structured_data';
  }

  return 'tool_output';
}
