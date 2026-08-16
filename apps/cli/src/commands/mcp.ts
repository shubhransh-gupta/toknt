import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);

export function resolveMcpEntry(): string {
  return require.resolve('@toknt/mcp-server');
}

export async function mcpCommand(): Promise<void> {
  const mcpEntry = resolveMcpEntry();

  const child = spawn(process.execPath, [mcpEntry], {
    stdio: 'inherit',
    env: process.env,
  });

  await new Promise<void>((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0 || code === null) resolve();
      else reject(new Error(`MCP server exited with code ${code}`));
    });
  });
}

interface McpConfig {
  mcpServers: Record<string, { command: string; args: string[] }>;
}

async function readMcpConfig(path: string): Promise<McpConfig> {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as McpConfig;
  } catch {
    return { mcpServers: {} };
  }
}

export async function mcpInstallCommand(options: { global?: boolean }): Promise<void> {
  const mcpEntry = resolveMcpEntry();
  const targetDir = options.global ? join(homedir(), '.cursor') : join(process.cwd(), '.cursor');
  const configPath = join(targetDir, 'mcp.json');

  await mkdir(targetDir, { recursive: true });
  const config = await readMcpConfig(configPath);
  config.mcpServers.toknt = {
    command: process.execPath,
    args: [mcpEntry],
  };

  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');

  console.log('Tokn\'t MCP installed\n');
  console.log(`  Cursor config: ${configPath}`);
  console.log(`  Server entry:  ${mcpEntry}\n`);
  console.log('Claude Desktop (~/.config/claude/claude_desktop_config.json):\n');
  console.log(JSON.stringify({
    mcpServers: {
      toknt: {
        command: process.execPath,
        args: [mcpEntry],
      },
    },
  }, null, 2));
  console.log('\nStart manually: toknt mcp\n');
}
