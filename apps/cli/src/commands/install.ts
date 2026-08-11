import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { detectAgents, printBanner, getCache } from '../utils.js';

export async function installCommand(): Promise<void> {
  printBanner();
  const agents = await detectAgents();
  const installed = agents.filter((a) => a.installed);

  console.log('Detected agents:\n');
  for (const agent of agents) {
    console.log(`  ${agent.installed ? '✓' : '✗'} ${agent.name}`);
  }

  if (installed.length === 0) {
    console.log('\nNo supported agents detected.');
    console.log('Install Claude Code, Cursor, or Codex first.\n');
    return;
  }

  console.log('\nInstalling Tokn\'t for all detected agents...\n');

  for (const agent of installed) {
    await installAgent(agent.id);
  }

  const cache = getCache();
  await cache.ensureDirs();
  await cache.saveConfig({
    integrations: Object.fromEntries(installed.map((a) => [a.id, true])),
  });

  console.log('\n✓ Tokn\'t installed successfully.');
  console.log(`  Cache: ${cache.getBaseDir()}`);
  console.log('  Mode: safe (default)\n');
}

export async function installAgentCommand(agent: string): Promise<void> {
  printBanner();
  await installAgent(agent);
  console.log(`\n✓ Tokn\'t installed for ${agent}.\n`);
}

async function installAgent(agentId: string): Promise<void> {
  const valid = ['claude', 'cursor', 'codex', 'all'];
  if (!valid.includes(agentId)) {
    console.error(`Unknown agent: ${agentId}`);
    console.error('Supported: claude, cursor, codex, all');
    process.exit(1);
  }

  const agents = agentId === 'all' ? ['claude', 'cursor', 'codex'] : [agentId];

  for (const id of agents) {
    const hookDir = getHookDir(id);
    await mkdir(hookDir, { recursive: true });

    const hookConfig = {
      version: '1.0.0',
      provider: 'toknt',
      mode: 'safe',
      hooks: {
        beforeToolCall: true,
        afterToolCall: true,
      },
    };

    await writeFile(join(hookDir, 'toknt.json'), JSON.stringify(hookConfig, null, 2));
    console.log(`  → Configured ${id} integration at ${hookDir}`);
  }
}

function getHookDir(agent: string): string {
  switch (agent) {
    case 'claude':
      return join(homedir(), '.claude', 'toknt');
    case 'cursor':
      return join(homedir(), '.cursor', 'toknt');
    case 'codex':
      return join(homedir(), '.codex', 'toknt');
    default:
      return join(homedir(), '.toknt', agent);
  }
}

export async function isInstalled(agent: string): Promise<boolean> {
  try {
    await readFile(join(getHookDir(agent), 'toknt.json'), 'utf-8');
    return true;
  } catch {
    return false;
  }
}
