import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { BaseAdapter, type AgentInfo, type ToolOutput } from '@toknt/adapters';
import { OptimizingAdapterWrapper } from '@toknt/adapters';

const WINDSURF_DIRS = ['.windsurf', '.codeium/windsurf'];

export class WindsurfAdapter extends BaseAdapter {
  readonly name = 'windsurf';
  private wrapper: OptimizingAdapterWrapper;
  private configPath?: string;

  constructor() {
    super();
    this.wrapper = new OptimizingAdapterWrapper();
  }

  async detect(): Promise<AgentInfo> {
    for (const dir of WINDSURF_DIRS) {
      const configPath = join(homedir(), dir);
      try {
        await access(configPath);
        this.configPath = configPath;
        return { name: 'Windsurf', installed: true, configPath };
      } catch {
        // try next
      }
    }
    return { name: 'Windsurf', installed: false };
  }

  async install(): Promise<void> {
    const info = await this.detect();
    const base = info.configPath ?? join(homedir(), '.windsurf');
    const { mkdir, writeFile } = await import('node:fs/promises');
    const hookDir = join(base, 'toknt');
    await mkdir(join(hookDir, 'hooks'), { recursive: true });

    const config = {
      version: '1.0.0',
      provider: 'toknt',
      hooks: {
        afterToolCall: './hooks/after-tool-call.js',
      },
    };

    await writeFile(join(hookDir, 'toknt.json'), JSON.stringify(config, null, 2));
    await writeFile(join(hookDir, 'hooks', 'after-tool-call.js'), WINDSURF_HOOK_SCRIPT);
  }

  async uninstall(): Promise<void> {
    const { rm } = await import('node:fs/promises');
    for (const dir of WINDSURF_DIRS) {
      await rm(join(homedir(), dir, 'toknt'), { recursive: true, force: true });
    }
  }

  async interceptToolOutput(output: ToolOutput): Promise<ToolOutput> {
    return this.wrapper.processToolOutput(output);
  }
}

const WINDSURF_HOOK_SCRIPT = `#!/usr/bin/env node
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

export { WindsurfAdapter as default };
