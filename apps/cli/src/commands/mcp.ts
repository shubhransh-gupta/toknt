import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export async function mcpCommand(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const mcpEntry = join(here, '../../../mcp-server/dist/index.js');

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
