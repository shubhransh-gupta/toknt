import { access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { LocalCache } from '@toknt/cache';
import { TokntEngine } from '@toknt/core';

export interface DetectedAgent {
  name: string;
  id: string;
  installed: boolean;
  configPath?: string;
}

export async function detectAgents(): Promise<DetectedAgent[]> {
  const agents: DetectedAgent[] = [
    {
      name: 'Claude Code',
      id: 'claude',
      installed: await exists(join(homedir(), '.claude')),
      configPath: join(homedir(), '.claude'),
    },
    {
      name: 'Cursor',
      id: 'cursor',
      installed: await exists(join(homedir(), '.cursor')),
      configPath: join(homedir(), '.cursor'),
    },
    {
      name: 'Codex',
      id: 'codex',
      installed: await exists(join(homedir(), '.codex')),
      configPath: join(homedir(), '.codex'),
    },
    {
      name: 'Windsurf',
      id: 'windsurf',
      installed: await exists(join(homedir(), '.windsurf')) || await exists(join(homedir(), '.codeium', 'windsurf')),
      configPath: join(homedir(), '.windsurf'),
    },
  ];
  return agents;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function printBanner(): void {
  console.log(`
╔══════════════════════════════════════╗
║              TOKN'T                  ║
║     Cut the token waste.             ║
║     Keep the intelligence.           ║
╚══════════════════════════════════════╝
`);
}

export function getCache(): LocalCache {
  return new LocalCache();
}

export async function getEngine(): Promise<TokntEngine> {
  const cache = getCache();
  const config = await cache.getConfig();
  return new TokntEngine({ cache, mode: config.mode });
}
