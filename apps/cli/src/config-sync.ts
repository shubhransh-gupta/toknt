import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { TokntConfig } from '@toknt/cache';
import { getCache } from './utils.js';

const AGENT_HOOK_DIRS = ['claude', 'cursor', 'codex', 'windsurf'] as const;

function hookDir(agent: string): string {
  switch (agent) {
    case 'claude':
      return join(homedir(), '.claude', 'toknt');
    case 'cursor':
      return join(homedir(), '.cursor', 'toknt');
    case 'codex':
      return join(homedir(), '.codex', 'toknt');
    case 'windsurf':
      return join(homedir(), '.windsurf', 'toknt');
    default:
      return join(homedir(), '.toknt', agent);
  }
}

export async function syncAgentHookConfigs(mode: TokntConfig['mode']): Promise<string[]> {
  const updated: string[] = [];

  for (const agent of AGENT_HOOK_DIRS) {
    const path = join(hookDir(agent), 'toknt.json');
    try {
      const raw = await readFile(path, 'utf-8');
      const config = JSON.parse(raw) as Record<string, unknown>;
      config.mode = mode;
      await writeFile(path, JSON.stringify(config, null, 2));
      updated.push(agent);
    } catch {
      // agent hook not installed
    }
  }

  return updated;
}

export async function loadConfigMode(): Promise<TokntConfig['mode']> {
  const cache = getCache();
  const config = await cache.getConfig();
  return config.mode;
}
