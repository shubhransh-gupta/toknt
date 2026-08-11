import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { BaseAdapter, type AgentInfo, type ToolOutput } from '@toknt/adapters';
import { OptimizingAdapterWrapper } from '@toknt/adapters';

export class ClaudeAdapter extends BaseAdapter {
  readonly name = 'claude';
  private wrapper: OptimizingAdapterWrapper;

  constructor() {
    super();
    this.wrapper = new OptimizingAdapterWrapper();
  }

  async detect(): Promise<AgentInfo> {
    const configPath = join(homedir(), '.claude');
    let installed = false;
    try {
      await access(configPath);
      installed = true;
    } catch {
      // not installed
    }
    return { name: 'Claude Code', installed, configPath };
  }

  async install(): Promise<void> {
    const { mkdir, writeFile } = await import('node:fs/promises');
    const hookDir = join(homedir(), '.claude', 'toknt');
    await mkdir(hookDir, { recursive: true });

    const config = {
      version: '1.0.0',
      provider: 'toknt',
      hooks: {
        PostToolUse: './hooks/post-tool-use.js',
      },
    };

    await writeFile(join(hookDir, 'toknt.json'), JSON.stringify(config, null, 2));

    await mkdir(join(hookDir, 'hooks'), { recursive: true });
    await writeFile(join(hookDir, 'hooks', 'post-tool-use.js'), CLAUDE_HOOK_SCRIPT);
  }

  async uninstall(): Promise<void> {
    const { rm } = await import('node:fs/promises');
    await rm(join(homedir(), '.claude', 'toknt'), { recursive: true, force: true });
  }

  async interceptToolOutput(output: ToolOutput): Promise<ToolOutput> {
    return this.wrapper.processToolOutput(output);
  }
}

const CLAUDE_HOOK_SCRIPT = `#!/usr/bin/env node
import { OptimizingAdapterWrapper } from '@toknt/adapters';

const wrapper = new OptimizingAdapterWrapper();

export default async function postToolUse(input) {
  const { tool_name, tool_output } = input;
  if (!tool_output) return input;

  const optimized = await wrapper.processToolOutput({
    toolName: tool_name,
    content: typeof tool_output === 'string' ? tool_output : JSON.stringify(tool_output),
  });

  return { ...input, tool_output: optimized.content };
}
`;

export { ClaudeAdapter as default };
