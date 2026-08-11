import { estimateTokens, reductionPercent } from '@toknt/tokenizer';

export interface OptimizationRecord {
  timestamp: string;
  strategy: string;
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  safetyConfidence: number;
  recalled: boolean;
}

export interface SessionMetrics {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  toolCalls: number;
  compressedOutputs: number;
  recalledOutputs: number;
  optimizations: OptimizationRecord[];
}

export class MetricsEngine {
  private session: SessionMetrics;
  private allTimeOriginal = 0;
  private allTimeOptimized = 0;
  private allTimeCompressed = 0;
  private allTimeRecalled = 0;

  constructor(sessionId?: string) {
    this.session = {
      sessionId: sessionId ?? crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      originalTokens: 0,
      optimizedTokens: 0,
      savedTokens: 0,
      reductionPercent: 0,
      toolCalls: 0,
      compressedOutputs: 0,
      recalledOutputs: 0,
      optimizations: [],
    };
  }

  recordToolCall(): void {
    this.session.toolCalls++;
  }

  recordOptimization(
    original: string,
    optimized: string,
    strategy: string,
    safetyConfidence: number
  ): void {
    const origTokens = estimateTokens(original).tokens;
    const optTokens = estimateTokens(optimized).tokens;
    const saved = Math.max(0, origTokens - optTokens);

    this.session.originalTokens += origTokens;
    this.session.optimizedTokens += optTokens;
    this.session.savedTokens += saved;
    this.session.compressedOutputs++;

    this.allTimeOriginal += origTokens;
    this.allTimeOptimized += optTokens;
    this.allTimeCompressed++;

    this.session.optimizations.push({
      timestamp: new Date().toISOString(),
      strategy,
      originalTokens: origTokens,
      optimizedTokens: optTokens,
      savedTokens: saved,
      reductionPercent: reductionPercent(origTokens, optTokens),
      safetyConfidence,
      recalled: false,
    });

    this.updateReduction();
  }

  recordPassthrough(content: string): void {
    const tokens = estimateTokens(content).tokens;
    this.session.originalTokens += tokens;
    this.session.optimizedTokens += tokens;
    this.allTimeOriginal += tokens;
    this.allTimeOptimized += tokens;
  }

  recordRecall(): void {
    this.session.recalledOutputs++;
    this.allTimeRecalled++;
  }

  private updateReduction(): void {
    this.session.reductionPercent = reductionPercent(
      this.session.originalTokens,
      this.session.optimizedTokens
    );
  }

  endSession(): SessionMetrics {
    this.session.endedAt = new Date().toISOString();
    return { ...this.session };
  }

  getSession(): SessionMetrics {
    return { ...this.session };
  }

  getAllTimeStats(): {
    originalTokens: number;
    optimizedTokens: number;
    savedTokens: number;
    reductionPercent: number;
    compressedOutputs: number;
    recalledOutputs: number;
  } {
    return {
      originalTokens: this.allTimeOriginal,
      optimizedTokens: this.allTimeOptimized,
      savedTokens: Math.max(0, this.allTimeOriginal - this.allTimeOptimized),
      reductionPercent: reductionPercent(this.allTimeOriginal, this.allTimeOptimized),
      compressedOutputs: this.allTimeCompressed,
      recalledOutputs: this.allTimeRecalled,
    };
  }

  getSavingsBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    let total = 0;
    for (const opt of this.session.optimizations) {
      breakdown[opt.strategy] = (breakdown[opt.strategy] ?? 0) + opt.savedTokens;
      total += opt.savedTokens;
    }
    if (total === 0) return breakdown;
    const percentages: Record<string, number> = {};
    for (const [strategy, saved] of Object.entries(breakdown)) {
      percentages[strategy] = Math.round((saved / total) * 100);
    }
    return percentages;
  }
}
