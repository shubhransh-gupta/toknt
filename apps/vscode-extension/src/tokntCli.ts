import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface TokntStats {
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  compressedOutputs: number;
  recalledOutputs: number;
  updatedAt: string;
}

export interface RecallResult {
  uri: string;
  content: string | null;
  error?: string;
}

export class TokntCli {
  constructor(private cliPath: string) {}

  private async run(args: string[]): Promise<string> {
    const { stdout } = await execFileAsync(this.cliPath, args, {
      maxBuffer: 10 * 1024 * 1024,
      env: process.env,
    });
    return stdout.trim();
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.run(['--version']);
      return true;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<TokntStats> {
    const output = await this.run(['stats', '--json']);
    return JSON.parse(output) as TokntStats;
  }

  async recall(uri: string): Promise<RecallResult> {
    try {
      const output = await this.run(['recall', uri, '--json']);
      return JSON.parse(output) as RecallResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { uri, content: null, error: message };
    }
  }

  async getMode(): Promise<string> {
    return this.run(['config', 'get', 'mode']);
  }

  async setMode(mode: string): Promise<void> {
    await this.run(['config', 'set', 'mode', mode]);
  }
}

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return String(tokens);
}
