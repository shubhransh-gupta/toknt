#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LocalCache, StatsStore } from '@toknt/cache';
import { handleToolCall, MCP_TOOLS } from './handlers.js';

const cache = new LocalCache();
const statsStore = new StatsStore(cache.getBaseDir());
const deps = { cache, statsStore };

const server = new Server(
  { name: 'toknt', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [...MCP_TOOLS],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await handleToolCall(
      request.params.name,
      request.params.arguments as Record<string, unknown> | undefined,
      deps
    ) as { content: Array<{ type: 'text'; text: string }>; isError?: boolean };
  } catch (err) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: String(err) }),
      }],
      isError: true,
    };
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
