import { TokntEngine, detectContextType, type ContextItem, type OptimizationMode } from '@toknt/core';
import { LocalCache, StatsStore } from '@toknt/cache';
import { estimateTokens } from '@toknt/tokenizer';
import type { AgentAdapter, ToolOutput } from './types.js';

export type ProcessMode = 'deliver' | 'observe';

export class OptimizingAdapterWrapper {
  private engine: TokntEngine;
  private cache: LocalCache;
  private statsStore: StatsStore;
  private fixedMode?: OptimizationMode;

  constructor(cache?: LocalCache, mode?: OptimizationMode) {
    const c = cache ?? new LocalCache();
    this.cache = c;
    this.statsStore = new StatsStore(c.getBaseDir());
    this.fixedMode = mode;
    this.engine = new TokntEngine({ cache: c, mode: mode ?? 'safe' });
  }

  getEngine(): TokntEngine {
    return this.engine;
  }

  getStatsStore(): StatsStore {
    return this.statsStore;
  }

  /** When mode isn't fixed at construct time, follow ~/.toknt/config.json. */
  private async ensureMode(): Promise<void> {
    if (this.fixedMode) return;
    const { mode } = await this.cache.getConfig();
    if (mode !== this.engine.mode) {
      this.engine = new TokntEngine({ cache: this.cache, mode });
    }
  }

  /**
   * @param mode `deliver` — counts toward real savings (Shell wrap / MCP replace).
   *             `observe` — tracks opportunity only (Cursor cannot strip this tool output).
   */
  async processToolOutput(
    output: ToolOutput,
    mode: ProcessMode = 'deliver'
  ): Promise<ToolOutput> {
    await this.ensureMode();

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
    const originalTokens = estimateTokens(output.content).tokens;
    const optimizedTokens = estimateTokens(result.content).tokens;
    const savedTokens = Math.max(0, originalTokens - optimizedTokens);

    if (result.optimized) {
      if (mode === 'deliver') {
        await this.statsStore.recordOptimization(originalTokens, optimizedTokens);
      } else {
        await this.statsStore.recordOpportunity(originalTokens, optimizedTokens);
      }
    }

    await this.statsStore.recordEvent({
      tool: output.toolName,
      delivered: mode === 'deliver' && !!result.optimized,
      originalTokens,
      optimizedTokens,
      savedTokens: result.optimized ? savedTokens : 0,
      strategy: result.strategy,
    });

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
          mode,
          savedTokens: result.optimized ? savedTokens : 0,
        },
      },
    };
  }

  /** Track a tool call with no compression attempt (still moves live counters). */
  async trackToolCall(toolName: string): Promise<void> {
    await this.statsStore.recordEvent({
      tool: toolName,
      delivered: false,
      originalTokens: 0,
      optimizedTokens: 0,
      savedTokens: 0,
    });
  }

  async processRecall(uri: string): Promise<string | null> {
    const content = await this.engine.recall(uri);
    if (content) {
      await this.statsStore.recordRecall();
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
    const processed = await wrapper.processToolOutput(output, 'deliver');
    if (originalOutput) {
      return originalOutput(processed);
    }
    return processed;
  };

  return adapter;
}

export * from './types.js';
