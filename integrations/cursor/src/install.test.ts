import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, rm, access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CursorAdapter } from './index.js';

describe('CursorAdapter.install', () => {
  let tmpHome: string;
  let prevHome: string | undefined;

  beforeEach(async () => {
    tmpHome = await mkdtemp(join(process.cwd(), 'tmp-toknt-cursor-install-'));
    prevHome = process.env.HOME;
    process.env.HOME = tmpHome;
    await mkdir(join(tmpHome, '.cursor'), { recursive: true });
  });

  afterEach(async () => {
    process.env.HOME = prevHome;
    await rm(tmpHome, { recursive: true, force: true });
  });

  it('registers native hooks.json and installs hook scripts + plugin', async () => {
    // Seed a plugin source by pointing cwd-relative path — adapter also checks package-relative path.
    const pluginSrc = join(process.cwd(), 'plugins/cursor');
    await access(join(pluginSrc, 'toknt-plugin.json'));

    const adapter = new CursorAdapter();
    await adapter.install();

    const hooks = JSON.parse(await readFile(join(tmpHome, '.cursor', 'hooks.json'), 'utf-8'));
    expect(hooks.version).toBe(1);
    expect(hooks.hooks.postToolUse?.some((h: { command: string }) => h.command.includes('toknt-'))).toBe(
      true
    );
    expect(hooks.hooks.preToolUse?.some((h: { command: string }) => h.command.includes('toknt-'))).toBe(
      true
    );
    expect(hooks.hooks.afterShellExecution ?? []).toHaveLength(0);

    await access(join(tmpHome, '.cursor', 'hooks', 'toknt-post-tool-use.mjs'));
    await access(join(tmpHome, '.cursor', 'hooks', 'toknt-pre-tool-use.mjs'));
    await access(join(tmpHome, '.cursor', 'hooks', 'toknt-shell-wrap.mjs'));
    await access(join(tmpHome, '.cursor', 'plugins', 'toknt', 'toknt-plugin.json'));

    const tokntJson = JSON.parse(
      await readFile(join(tmpHome, '.cursor', 'toknt', 'toknt.json'), 'utf-8')
    );
    expect(tokntJson.provider).toBe('toknt');
    expect(tokntJson.adaptersEntry).toContain('adapters');
  });

  it('preserves unrelated hooks on install and removes only toknt on uninstall', async () => {
    await writeFile(
      join(tmpHome, '.cursor', 'hooks.json'),
      JSON.stringify(
        {
          version: 1,
          hooks: {
            afterFileEdit: [{ command: './hooks/format.sh' }],
          },
        },
        null,
        2
      )
    );

    const adapter = new CursorAdapter();
    await adapter.install();
    let hooks = JSON.parse(await readFile(join(tmpHome, '.cursor', 'hooks.json'), 'utf-8'));
    expect(hooks.hooks.afterFileEdit).toHaveLength(1);
    expect(hooks.hooks.postToolUse.length).toBeGreaterThan(0);

    await adapter.uninstall();
    hooks = JSON.parse(await readFile(join(tmpHome, '.cursor', 'hooks.json'), 'utf-8'));
    expect(hooks.hooks.afterFileEdit).toHaveLength(1);
    expect(hooks.hooks.postToolUse ?? []).toHaveLength(0);
    expect(hooks.hooks.preToolUse ?? []).toHaveLength(0);
    expect(hooks.hooks.afterShellExecution ?? []).toHaveLength(0);
  });
});
