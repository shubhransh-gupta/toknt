import { access } from 'node:fs/promises';
import { printBanner, detectAgents, getCache } from '../utils.js';
import { isInstalled } from './install.js';

export async function doctorCommand(): Promise<void> {
  printBanner();
  console.log('Tokn\'t Doctor\n');

  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

  const nodeVersion = process.version;
  const nodeOk = parseInt(nodeVersion.slice(1), 10) >= 20;
  checks.push({
    name: 'Node.js version',
    ok: nodeOk,
    detail: `${nodeVersion} ${nodeOk ? '(>= 20)' : '(need >= 20)'}`,
  });

  const cache = getCache();
  try {
    await cache.ensureDirs();
    checks.push({ name: 'Cache directory', ok: true, detail: cache.getBaseDir() });
  } catch (e) {
    checks.push({ name: 'Cache directory', ok: false, detail: String(e) });
  }

  try {
    await access(cache.getBaseDir());
    checks.push({ name: 'Cache permissions', ok: true, detail: 'Read/write OK' });
  } catch {
    checks.push({ name: 'Cache permissions', ok: false, detail: 'Cannot access cache' });
  }

  const agents = await detectAgents();
  for (const agent of agents) {
    const tokntOk = await isInstalled(agent.id);
    checks.push({
      name: `${agent.name} integration`,
      ok: tokntOk,
      detail: tokntOk ? 'Active' : agent.installed ? 'Agent found, Tokn\'t not installed' : 'Not found',
    });
  }

  const config = await cache.getConfig();
  checks.push({
    name: 'Configuration',
    ok: true,
    detail: `Mode: ${config.mode}`,
  });

  for (const check of checks) {
    const icon = check.ok ? '✓' : '✗';
    console.log(`  ${icon} ${check.name.padEnd(26)} ${check.detail}`);
  }

  const failed = checks.filter((c) => !c.ok).length;
  console.log();
  if (failed === 0) {
    console.log('All checks passed.\n');
  } else {
    console.log(`${failed} check(s) need attention.\n`);
  }
}
