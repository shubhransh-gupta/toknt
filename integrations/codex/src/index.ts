import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { BaseAdapter, type AgentInfo, type ToolOutput } from '@toknt/adapters';
import { OptimizingAdapterWrapper } from '@toknt/adapters';

export class CodexAdapter extends BaseAdapter {
  readonly name = 'codex';
  private wrapper: OptimizingAdapterWrapper;

  constructor() {
    super();
    this.wrapper = new OptimizingAdapterWrapper();
  }

  async detect(): Promise<AgentInfo> {
    const configPath = join(homedir(), '.codex');
    let installed = false;
    try {
      await access(configPath);
      installed = true;
    } catch {
      // not installed
    }
    return { name: 'Codex', installed, configPath };
  }

  async install(): Promise<void> {
    const { mkdir, writeFile } = await import('node:fs/promises');
    const hookDir = join(homedir(), '.codex', 'toknt');
    await mkdir(hookDir, { recursive: true });

    const config = {
      version: '1.0.0',
      provider: 'toknt',
      plugin: {
        name: 'toknt-optimizer',
        onToolResult: './hooks/on-tool-result.js',
      },
    };

    await writeFile(join(hookDir, 'toknt.json'), JSON.stringify(config, null, 2));
    await mkdir(join(hookDir, 'hooks'), { recursive: true });
    await writeFile(join(hookDir, 'hooks', 'on-tool-result.js'), CODEX_HOOK_SCRIPT);
  }

  async uninstall(): Promise<void> {
    const { rm } = await import('node:fs/promises');
    await rm(join(homedir(), '.codex', 'toknt'), { recursive: true, force: true });
  }

  async interceptToolOutput(output: ToolOutput): Promise<ToolOutput> {
    return this.wrapper.processToolOutput(output);
  }
}

const CODEX_HOOK_SCRIPT = `#!/usr/bin/env node
import { OptimizingAdapterWrapper } from '@toknt/adapters';

const wrapper = new OptimizingAdapterWrapper();

export async function onToolResult(context) {
  const { toolName, result } = context;
  if (!result) return context;

  const optimized = await wrapper.processToolOutput({
    toolName,
    content: typeof result === 'string' ? result : JSON.stringify(result),
    metadata: context.metadata,
  });

  return { ...context, result: optimized.content };
}
`;

export { CodexAdapter as default };
