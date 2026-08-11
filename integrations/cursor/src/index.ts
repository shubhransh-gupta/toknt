import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { BaseAdapter, type AgentInfo, type ToolInput, type ToolOutput } from '@toknt/adapters';
import { OptimizingAdapterWrapper } from '@toknt/adapters';

export class CursorAdapter extends BaseAdapter {
  readonly name = 'cursor';
  private wrapper: OptimizingAdapterWrapper;

  constructor() {
    super();
    this.wrapper = new OptimizingAdapterWrapper();
  }

  async detect(): Promise<AgentInfo> {
    const configPath = join(homedir(), '.cursor');
    let installed = false;
    try {
      await access(configPath);
      installed = true;
    } catch {
      // not installed
    }
    return { name: 'Cursor', installed, configPath };
  }

  async install(): Promise<void> {
    const { mkdir, writeFile } = await import('node:fs/promises');
    const hookDir = join(homedir(), '.cursor', 'toknt');
    await mkdir(hookDir, { recursive: true });

    const config = {
      version: '1.0.0',
      provider: 'toknt',
      hooks: {
        afterToolCall: './hooks/after-tool-call.js',
        beforeToolCall: './hooks/before-tool-call.js',
      },
    };

    await writeFile(join(hookDir, 'toknt.json'), JSON.stringify(config, null, 2));
    await writeFile(
      join(hookDir, 'hooks', 'after-tool-call.js'),
      CURSOR_HOOK_SCRIPT,
      { flag: 'w' }
    ).catch(async () => {
      await mkdir(join(hookDir, 'hooks'), { recursive: true });
      await writeFile(join(hookDir, 'hooks', 'after-tool-call.js'), CURSOR_HOOK_SCRIPT);
    });
  }

  async uninstall(): Promise<void> {
    const { rm } = await import('node:fs/promises');
    await rm(join(homedir(), '.cursor', 'toknt'), { recursive: true, force: true });
  }

  async interceptToolOutput(output: ToolOutput): Promise<ToolOutput> {
    return this.wrapper.processToolOutput(output);
  }

  getWrapper(): OptimizingAdapterWrapper {
    return this.wrapper;
  }
}

const CURSOR_HOOK_SCRIPT = `#!/usr/bin/env node
// Tokn't Cursor Hook — optimizes tool output before it reaches the agent
import { OptimizingAdapterWrapper } from '@toknt/adapters';

const wrapper = new OptimizingAdapterWrapper();

export async function afterToolCall(event) {
  if (!event?.output) return event;
  const optimized = await wrapper.processToolOutput({
    toolName: event.toolName ?? 'unknown',
    content: typeof event.output === 'string' ? event.output : JSON.stringify(event.output),
    path: event.path,
    metadata: event.metadata,
  });
  return { ...event, output: optimized.content, toknt: optimized.metadata?.toknt };
}
`;

export { CursorAdapter as default };
