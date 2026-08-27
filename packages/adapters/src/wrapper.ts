import { TokntEngine, detectContextType, type ContextItem } from '@toknt/core';
import { LocalCache, StatsStore } from '@toknt/cache';
import { estimateTokens } from '@toknt/tokenizer';
import type { AgentAdapter, ToolInput, ToolOutput } from './types.js';
import { BaseAdapter } from './types.js';

export class OptimizingAdapterWrapper {
  private engine: TokntEngine;
  private cache: LocalCache;
  private statsStore: StatsStore;
  private agentName?: string;

  constructor(cache?: LocalCache, mode?: 'safe' | 'balanced' | 'aggressive', agentName?: string) {
    const c = cache ?? new LocalCache();
    this.cache = c;
    this.agentName = agentName;
    this.statsStore = new StatsStore(c.getBaseDir());
    this.engine = new TokntEngine({ cache: c, mode });
  }

  getEngine(): TokntEngine {
    return this.engine;
  }

  getAgentName(): string | undefined {
    return this.agentName;
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

    const agent = this.agentName ?? (output.metadata?.agent as string | undefined);
    const result = await this.engine.processContextItem(item, agent);
    const originalTokens = estimateTokens(output.content).tokens;

    if (result.optimized) {
      const optimizedTokens = estimateTokens(result.content).tokens;
      await this.statsStore.recordOptimization(
        originalTokens,
        optimizedTokens,
        agent,
        result.strategy
      );
    } else {
      await this.statsStore.recordPassthrough(originalTokens, agent);
    }

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
    const content = await this.engine.recall(uri);
    if (content) {
      await this.statsStore.recordRecall(this.agentName);
    }
    return content;
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
