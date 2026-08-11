#!/usr/bin/env node

import { Command } from 'commander';
import { installCommand, installAgentCommand } from './commands/install.js';
import { uninstallCommand } from './commands/uninstall.js';
import { statusCommand } from './commands/status.js';
import { statsCommand } from './commands/stats.js';
import { explainCommand } from './commands/explain.js';
import { benchmarkCommand } from './commands/benchmark.js';
import { cacheCommand, cacheClearCommand } from './commands/cache.js';
import { doctorCommand } from './commands/doctor.js';
import { recallCommand } from './commands/recall.js';

const program = new Command();

program
  .name('toknt')
  .description('Tokn\'t — Cut the token waste. Keep the intelligence.')
  .version('1.0.0');

program
  .command('install [agent]')
  .description('Install Tokn\'t integrations (claude, cursor, codex, or all)')
  .action(async (agent?: string) => {
    if (agent) {
      await installAgentCommand(agent);
    } else {
      await installCommand();
    }
  });

program.command('uninstall').description('Remove Tokn\'t integrations').action(uninstallCommand);
program.command('status').description('Show Tokn\'t status').action(statusCommand);
program.command('stats').description('Show token savings statistics').action(statsCommand);
program.command('explain').description('Explain how Tokn\'t works').action(explainCommand);
program
  .command('benchmark')
  .description('Run benchmark comparison')
  .option('--agent <agent>', 'Agent to benchmark (claude, cursor, codex)', 'cursor')
  .option('--task <task>', 'Specific task ID')
  .option('--mode <mode>', 'Optimization mode (safe, balanced, aggressive)', 'balanced')
  .option('--export <file>', 'Export results to JSON')
  .action(benchmarkCommand);
const cacheCmd = program.command('cache').description('Cache commands');
cacheCmd.command('clear').description('Clear the local cache').action(cacheClearCommand);
cacheCmd.command('status', { isDefault: true }).description('Show cache information').action(cacheCommand);
program.command('doctor').description('Diagnose Tokn\'t installation').action(doctorCommand);
program
  .command('recall <uri>')
  .description('Recall compressed content by URI (toknt://type/id)')
  .action(recallCommand);

program.parse();
