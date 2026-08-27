import type { LocalCache } from '@toknt/cache';
import { StatsStore } from '@toknt/cache';
import { TokntEngine, type ContextItemType } from '@toknt/core';
import { estimateTokens } from '@toknt/tokenizer';

const COMPRESS_TYPES = new Set<ContextItemType>([
  'terminal_output',
  'file_read',
  'directory_listing',
  'tool_output',
]);

export interface McpDeps {
  cache: LocalCache;
  statsStore: StatsStore;
}

export interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

let cachedEngine: TokntEngine | null = null;
let cachedEngineMode: string | null = null;

async function getSharedEngine(cache: LocalCache): Promise<TokntEngine> {
  const { mode } = await cache.getConfig();
  if (!cachedEngine || cachedEngineMode !== mode) {
    cachedEngine = new TokntEngine({ cache, mode });
    cachedEngineMode = mode;
  }
  return cachedEngine;
}

export async function handleToolCall(
  name: string,
  args: Record<string, unknown> | undefined,
  deps: McpDeps
): Promise<ToolResult> {
  switch (name) {
    case 'toknt_recall':
      return handleRecall(String(args?.uri ?? ''), String(args?.agent ?? 'mcp'), deps);
    case 'toknt_stats':
      return handleStats(deps);
    case 'toknt_config':
      return handleConfig(deps);
    case 'toknt_compress':
      return handleCompress(args ?? {}, deps);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleRecall(uri: string, agent: string, deps: McpDeps): Promise<ToolResult> {
  const engine = await getSharedEngine(deps.cache);
  const content = await engine.recall(uri);
  if (!content) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ uri, content: null, error: 'not_found' }) }],
      isError: true,
    };
  }
  await deps.statsStore.recordRecall(agent);
  return { content: [{ type: 'text', text: content }] };
}

async function handleStats(deps: McpDeps): Promise<ToolResult> {
  const stats = await deps.statsStore.load();
  const poolStats = await deps.cache.getPoolStats();
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ ...stats, pool: poolStats }, null, 2),
    }],
  };
}

async function handleConfig(deps: McpDeps): Promise<ToolResult> {
  const config = await deps.cache.getConfig();
  const cacheStats = await deps.cache.getStats();
  const poolStats = await deps.cache.getPoolStats();
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(
        { config, cache: cacheStats, pool: poolStats, path: deps.cache.getBaseDir() },
        null,
        2
      ),
    }],
  };
}

async function handleCompress(
  args: Record<string, unknown>,
  deps: McpDeps
): Promise<ToolResult> {
  const type = String(args.type ?? '') as ContextItemType;
  const content = String(args.content ?? '');
  const agent = String(args.agent ?? 'mcp');

  if (!COMPRESS_TYPES.has(type)) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'invalid_type',
          message: 'type must be terminal_output, file_read, directory_listing, or tool_output',
        }),
      }],
      isError: true,
    };
  }

  if (!content) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'missing_content' }) }],
      isError: true,
    };
  }

  const engine = await getSharedEngine(deps.cache);
  const result = await engine.processContextItem({
    id: `mcp-${Date.now()}`,
    type,
    content,
    path: args.path ? String(args.path) : undefined,
    toolName: args.toolName ? String(args.toolName) : undefined,
  }, agent);

  const origTokens = estimateTokens(content).tokens;
  if (result.optimized) {
    const optTokens = estimateTokens(result.content).tokens;
    await deps.statsStore.recordOptimization(origTokens, optTokens, agent, result.strategy);
  } else {
    await deps.statsStore.recordPassthrough(origTokens, agent);
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        optimized: result.optimized,
        strategy: result.strategy,
        recallUri: result.recallUri,
        safetyConfidence: result.safetyConfidence,
        passthroughReason: result.passthroughReason,
        content: result.content,
      }, null, 2),
    }],
  };
}

export const MCP_TOOLS = [
  {
    name: 'toknt_recall',
    description: 'Recall full compressed content by toknt:// URI',
    inputSchema: {
      type: 'object',
      properties: {
        uri: {
          type: 'string',
          description: 'toknt://file|output|directory|tool/<id>',
        },
        agent: {
          type: 'string',
          description: 'Name of the calling AI agent (optional)',
        },
      },
      required: ['uri'],
    },
  },
  {
    name: 'toknt_stats',
    description: 'Get token savings statistics and cache pool status from ~/.toknt/',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'toknt_config',
    description: 'Read Toknt configuration, cache stats, and cache pool info',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'toknt_compress',
    description: 'Compress terminal output, file reads, directory listings, or tool output',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['terminal_output', 'file_read', 'directory_listing', 'tool_output'],
          description: 'Context item type to optimize',
        },
        content: { type: 'string', description: 'Raw content to compress' },
        path: { type: 'string', description: 'File or directory path (optional)' },
        toolName: { type: 'string', description: 'Tool name for tool_output (optional)' },
        agent: { type: 'string', description: 'Requesting AI agent name (e.g. antigravity, cursor, codex, claude)' },
      },
      required: ['type', 'content'],
    },
  },
] as const;

