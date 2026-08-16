#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LocalCache, StatsStore } from '@toknt/cache';
import { TokntEngine } from '@toknt/core';

const cache = new LocalCache();
const engine = new TokntEngine({ cache });
const statsStore = new StatsStore(cache.getBaseDir());

const server = new Server(
  { name: 'toknt', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
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
        },
        required: ['uri'],
      },
    },
    {
      name: 'toknt_stats',
      description: 'Get token savings statistics from ~/.toknt/stats.json',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'toknt_config',
      description: 'Read Toknt configuration and cache stats',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'toknt_recall': {
      const uri = String(request.params.arguments?.uri ?? '');
      const content = await engine.recall(uri);
      if (!content) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ uri, content: null, error: 'not_found' }) }],
          isError: true,
        };
      }
      await statsStore.recordRecall();
      return { content: [{ type: 'text', text: content }] };
    }
    case 'toknt_stats': {
      const stats = await statsStore.load();
      return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
    }
    case 'toknt_config': {
      const config = await cache.getConfig();
      const cacheStats = await cache.getStats();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ config, cache: cacheStats, path: cache.getBaseDir() }, null, 2),
        }],
      };
    }
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
