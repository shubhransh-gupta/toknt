import { TokntEngine, detectContextType, type ContextItem } from '@toknt/core';
import { LocalCache } from '@toknt/cache';
import type { AgentAdapter, ToolInput, ToolOutput } from './types.js';
import { BaseAdapter } from './types.js';

export class OptimizingAdapterWrapper {
  private engine: TokntEngine;

  constructor(cache?: LocalCache, mode?: 'safe' | 'balanced' | 'aggressive') {
    const c = cache ?? new LocalCache();
    this.engine = new TokntEngine({ cache: c, mode });
  }

  getEngine(): TokntEngine {
    return this.engine;
  }

  async processToolOutput(output: ToolOutput): Promise<ToolOutput> {
    const type = detectContextType(output.toolName, output.content, {
      path: output.path,
      ...output.metadata,
    });

    const item: ContextItem = {
      id: crypto.randomUUID(),
      type,
      content: output.content,
      path: output.path,
      toolName: output.toolName,
      metadata: output.metadata,
    };

    const result = await this.engine.processContextItem(item);

    return {
      ...output,
      content: result.content,
      metadata: {
        ...output.metadata,
        toknt: {
          optimized: result.optimized,
          strategy: result.strategy,
          recallUri: result.recallUri,
          safetyConfidence: result.safetyConfidence,
        },
      },
    };
  }

  async processRecall(uri: string): Promise<string | null> {
    return this.engine.recall(uri);
  }
}

export function wrapAdapter(
  adapter: AgentAdapter,
  wrapper: OptimizingAdapterWrapper
): AgentAdapter {
  const originalOutput = adapter.interceptToolOutput?.bind(adapter);

  adapter.interceptToolOutput = async (output: ToolOutput) => {
    const processed = await wrapper.processToolOutput(output);
    if (originalOutput) {
      return originalOutput(processed);
    }
    return processed;
  };

  return adapter;
}

export * from './types.js';
