import { Command } from 'commander';
import { printBanner, getCache } from '../utils.js';
import type { TokntConfig } from '@toknt/cache';
import { syncAgentHookConfigs } from '../config-sync.js';

const MODES = ['safe', 'balanced', 'aggressive'] as const;

function isMode(value: string): value is TokntConfig['mode'] {
  return (MODES as readonly string[]).includes(value);
}

function configPath(baseDir: string): string {
  return `${baseDir}/config.json`;
}

export async function configShowCommand(options: { json?: boolean }): Promise<void> {
  const cache = getCache();
  const path = configPath(cache.getBaseDir());
  const config = await cache.getConfig();
  const stats = await cache.getStats();

  if (options.json) {
    console.log(JSON.stringify({ path, config, cache: stats }, null, 2));
    return;
  }

  printBanner();
  console.log('Configuration\n');
  console.log(`  Path:           ${path}`);
  console.log(`  Mode:           ${config.mode}`);
  console.log(`  maxCacheSizeMB: ${config.maxCacheSizeMB ?? 500}`);
  console.log(`  Cache entries:  ${stats.entries}`);
  console.log(`  Cache size:     ${(stats.sizeBytes / 1024 / 1024).toFixed(2)} MB\n`);
  console.log('Integrations:');
  const integrations = config.integrations ?? {};
  if (Object.keys(integrations).length === 0) {
    console.log('  (none — run `toknt install`)');
  } else {
    for (const [agent, enabled] of Object.entries(integrations)) {
      console.log(`  ${agent.padEnd(12)} ${enabled ? '✓' : '✗'}`);
    }
  }
  console.log('\nExamples:');
  console.log('  toknt config set mode balanced');
  console.log('  toknt config set maxCacheSizeMB 1024');
  console.log('  toknt config get mode\n');
}

export async function configGetCommand(key: string, options: { json?: boolean }): Promise<void> {
  const cache = getCache();
  const config = await cache.getConfig();
  if (!(key in config)) {
    console.error(`Unknown key: ${key}`);
    process.exit(1);
  }
  const value = config[key as keyof TokntConfig];
  if (options.json) {
    console.log(JSON.stringify({ [key]: value }, null, 2));
  } else {
    console.log(String(value ?? ''));
  }
}

export async function configSetCommand(
  key: string,
  value: string,
  options: { json?: boolean }
): Promise<void> {
  const cache = getCache();
  const path = configPath(cache.getBaseDir());

  if (key === 'mode') {
    if (!isMode(value)) {
      console.error(`Invalid mode: ${value}. Use safe, balanced, or aggressive.`);
      process.exit(1);
    }
    const config = await cache.saveConfig({ mode: value });
    const synced = await syncAgentHookConfigs(config.mode);
    if (options.json) {
      console.log(JSON.stringify({ path, mode: config.mode, syncedAgents: synced }, null, 2));
      return;
    }
    printBanner();
    console.log(`✓ Mode set to ${config.mode}`);
    console.log(`  Config: ${path}`);
    console.log(synced.length > 0 ? `  Synced hooks: ${synced.join(', ')}` : '  Run `toknt install` to write agent hooks.');
    console.log('\n  Restart your coding agent for the new mode to take effect.\n');
    return;
  }

  if (key === 'maxCacheSizeMB') {
    const mb = Number(value);
    if (!Number.isFinite(mb) || mb < 1) {
      console.error('maxCacheSizeMB must be a positive number.');
      process.exit(1);
    }
    const config = await cache.saveConfig({ maxCacheSizeMB: mb });
    if (options.json) {
      console.log(JSON.stringify({ maxCacheSizeMB: config.maxCacheSizeMB }, null, 2));
      return;
    }
    console.log(`✓ maxCacheSizeMB set to ${config.maxCacheSizeMB}`);
    console.log(`  Config: ${path}\n`);
    return;
  }

  console.error(`Unknown key: ${key}. Supported: mode, maxCacheSizeMB`);
  process.exit(1);
}

export async function configPathCommand(): Promise<void> {
  console.log(configPath(getCache().getBaseDir()));
}

export function registerConfigCommands(program: Command): void {
  const configCmd = program.command('config').description('View or update Tokn\'t configuration');

  configCmd
    .command('show', { isDefault: true })
    .description('Show current configuration')
    .option('--json', 'Output as JSON')
    .action(configShowCommand);

  configCmd
    .command('get <key>')
    .description('Get a config value')
    .option('--json', 'Output as JSON')
    .action(configGetCommand);

  configCmd
    .command('set <key> <value>')
    .description('Set a config value (mode, maxCacheSizeMB)')
    .option('--json', 'Output as JSON')
    .action(configSetCommand);

  configCmd.command('path').description('Print config file path').action(configPathCommand);
}
