import * as vscode from 'vscode';
import { TokntCli, formatTokenCount } from './tokntCli';

let statusBarItem: vscode.StatusBarItem;
let refreshTimer: ReturnType<typeof setInterval> | undefined;

function getCli(): TokntCli {
  const config = vscode.workspace.getConfiguration('toknt');
  const cliPath = config.get<string>('cliPath', 'toknt');
  return new TokntCli(cliPath);
}

function isEnabled(): boolean {
  return vscode.workspace.getConfiguration('toknt').get<boolean>('enabled', true);
}

async function updateStatusBar(): Promise<void> {
  if (!statusBarItem) return;

  if (!isEnabled()) {
    statusBarItem.text = 'Tokn\'t: disabled';
    statusBarItem.tooltip = 'Enable in Settings → Tokn\'t';
    statusBarItem.backgroundColor = undefined;
    return;
  }

  const cli = getCli();
  const available = await cli.isAvailable();

  if (!available) {
    statusBarItem.text = 'Tokn\'t: CLI not found';
    statusBarItem.tooltip = 'Install toknt CLI: npm install -g toknt';
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    return;
  }

  try {
    const stats = await cli.getStats();
    const mode = await cli.getMode().catch(() => 'safe');
    statusBarItem.text = `$(zap) Tokn\'t: ${formatTokenCount(stats.savedTokens)} saved (${stats.reductionPercent}%)`;
    statusBarItem.tooltip = [
      `Mode: ${mode}`,
      `Saved: ${formatTokenCount(stats.savedTokens)} tokens (estimated)`,
      `Compressed: ${stats.compressedOutputs} outputs`,
      `Recalled: ${stats.recalledOutputs}`,
      '',
      'Click for stats · Right-click for commands',
    ].join('\n');
    statusBarItem.backgroundColor = undefined;
  } catch (err) {
    statusBarItem.text = 'Tokn\'t: error';
    statusBarItem.tooltip = err instanceof Error ? err.message : String(err);
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  }
}

async function showStats(): Promise<void> {
  const cli = getCli();
  if (!(await cli.isAvailable())) {
    void vscode.window.showErrorMessage(
      'Tokn\'t CLI not found. Install with: npm install -g toknt',
      'Open Docs'
    ).then((choice) => {
      if (choice === 'Open Docs') {
        void vscode.env.openExternal(vscode.Uri.parse('https://github.com/shubhransh-gupta/toknt#readme'));
      }
    });
    return;
  }

  try {
    const stats = await cli.getStats();
    const mode = await cli.getMode().catch(() => 'unknown');
    const message = [
      `Mode: ${mode}`,
      `Tokens saved: ${formatTokenCount(stats.savedTokens)} (${stats.reductionPercent}%)`,
      `Original → Optimized: ${formatTokenCount(stats.originalTokens)} → ${formatTokenCount(stats.optimizedTokens)}`,
      `Compressed outputs: ${stats.compressedOutputs}`,
      `Recalled: ${stats.recalledOutputs}`,
      '',
      'Counts are estimates, not billing data.',
    ].join('\n');

    const action = await vscode.window.showInformationMessage(message, 'Recall URI', 'Set Mode');
    if (action === 'Recall URI') {
      await recallUri();
    } else if (action === 'Set Mode') {
      await pickMode();
    }
  } catch (err) {
    void vscode.window.showErrorMessage(
      `Failed to load Tokn\'t stats: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

async function recallUri(): Promise<void> {
  const uri = await vscode.window.showInputBox({
    title: 'Tokn\'t Recall',
    prompt: 'Enter a toknt:// URI to recall compressed content',
    placeHolder: 'toknt://file/abc123def456',
    validateInput: (value) => {
      if (!value.trim()) return 'URI is required';
      if (!/^toknt:\/\/(file|output|directory|tool)\/[a-f0-9]+$/.test(value.trim())) {
        return 'Invalid URI format';
      }
      return undefined;
    },
  });

  if (!uri) return;

  const cli = getCli();
  if (!(await cli.isAvailable())) {
    void vscode.window.showErrorMessage('Tokn\'t CLI not found.');
    return;
  }

  const result = await cli.recall(uri.trim());
  if (!result.content) {
    void vscode.window.showErrorMessage(`Could not recall: ${uri}`);
    return;
  }

  const doc = await vscode.workspace.openTextDocument({
    content: result.content,
    language: 'plaintext',
  });
  await vscode.window.showTextDocument(doc, { preview: false });
  void vscode.window.showInformationMessage(`Recalled ${uri}`);
}

async function pickMode(): Promise<void> {
  const choice = await vscode.window.showQuickPick(
    [
      { label: 'safe', description: 'Default — duplicate files & tool output only' },
      { label: 'balanced', description: 'Heavy logs and directory listings (~91% savings)' },
      { label: 'aggressive', description: 'Experimental — higher savings, may affect quality' },
    ],
    { title: 'Tokn\'t optimization mode' }
  );

  if (!choice) return;
  await setMode(choice.label);
}

async function setMode(mode: string): Promise<void> {
  const cli = getCli();
  if (!(await cli.isAvailable())) {
    void vscode.window.showErrorMessage('Tokn\'t CLI not found.');
    return;
  }

  try {
    await cli.setMode(mode);
    await vscode.workspace.getConfiguration('toknt').update('mode', mode, vscode.ConfigurationTarget.Global);
    void vscode.window.showInformationMessage(`Tokn\'t mode set to ${mode}`);
    await updateStatusBar();
  } catch (err) {
    void vscode.window.showErrorMessage(
      `Failed to set mode: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

function scheduleRefresh(): void {
  if (refreshTimer) clearInterval(refreshTimer);
  const seconds = vscode.workspace.getConfiguration('toknt').get<number>('statusBarRefreshSeconds', 30);
  refreshTimer = setInterval(() => {
    void updateStatusBar();
  }, seconds * 1000);
}

export function activate(context: vscode.ExtensionContext): void {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'toknt.showStats';
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('toknt.showStats', () => showStats()),
    vscode.commands.registerCommand('toknt.recallUri', () => recallUri()),
    vscode.commands.registerCommand('toknt.setModeSafe', () => setMode('safe')),
    vscode.commands.registerCommand('toknt.setModeBalanced', () => setMode('balanced')),
    vscode.commands.registerCommand('toknt.setModeAggressive', () => setMode('aggressive')),
    vscode.commands.registerCommand('toknt.refreshStatus', () => updateStatusBar())
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('toknt')) {
        if (e.affectsConfiguration('toknt.mode')) {
          const mode = vscode.workspace.getConfiguration('toknt').get<string>('mode', 'safe');
          void getCli()
            .setMode(mode)
            .catch(() => {});
        }
        scheduleRefresh();
        void updateStatusBar();
      }
    })
  );

  statusBarItem.show();
  scheduleRefresh();
  void updateStatusBar();
}

export function deactivate(): void {
  if (refreshTimer) clearInterval(refreshTimer);
}
