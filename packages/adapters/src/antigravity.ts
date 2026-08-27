import { access, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { BaseAdapter, type AgentInfo, type ToolOutput } from './types.js';
import { OptimizingAdapterWrapper } from './wrapper.js';

export class AntigravityAdapter extends BaseAdapter {
  readonly name = 'antigravity';
  private wrapper: OptimizingAdapterWrapper;

  constructor() {
    super();
    this.wrapper = new OptimizingAdapterWrapper(undefined, undefined, 'antigravity');
  }

  async detect(): Promise<AgentInfo> {
    const geminiPath = join(homedir(), '.gemini');
    const antigravityPath = join(homedir(), '.gemini', 'antigravity');
    let installed = false;
    let configPath = antigravityPath;

    try {
      await access(antigravityPath);
      installed = true;
      configPath = antigravityPath;
    } catch {
      try {
        await access(geminiPath);
        installed = true;
        configPath = geminiPath;
      } catch {
        // not found
      }
    }

    return { name: 'Google Antigravity', installed, configPath };
  }

  async install(): Promise<void> {
    const baseDir = join(homedir(), '.gemini', 'antigravity');
    const mcpDir = join(baseDir, 'mcp', 'toknt');
    await mkdir(mcpDir, { recursive: true });

    const mcpConfig = {
      name: 'toknt',
      description: "Tokn't token optimization layer and cache pool for AI coding agents",
      version: '1.0.0',
      command: 'toknt',
      args: ['mcp'],
      tools: [
        {
          name: 'toknt_compress',
          description: 'Compress file reads, terminal outputs, and tool responses before LLM ingestion',
        },
        {
          name: 'toknt_recall',
          description: 'Recall full cached content by toknt:// URI',
        },
        {
          name: 'toknt_stats',
          description: 'Get token savings statistics and cache pool metrics',
        },
      ],
    };

    await writeFile(join(mcpDir, 'config.json'), JSON.stringify(mcpConfig, null, 2));
  }

  async uninstall(): Promise<void> {
    const mcpDir = join(homedir(), '.gemini', 'antigravity', 'mcp', 'toknt');
    await rm(mcpDir, { recursive: true, force: true });
  }

  async interceptToolOutput(output: ToolOutput): Promise<ToolOutput> {
    return this.wrapper.processToolOutput({
      ...output,
      metadata: { ...output.metadata, agent: 'antigravity' },
    });
  }

  getWrapper(): OptimizingAdapterWrapper {
    return this.wrapper;
  }
}

export default AntigravityAdapter;
