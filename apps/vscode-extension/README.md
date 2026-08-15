# Tokn't for VS Code

Local-first token optimization for AI coding agents — view savings, recall compressed content, and switch optimization modes from VS Code, VSCodium, or any VS Code-compatible editor.

Closes [#16](https://github.com/shubhransh-gupta/toknt/issues/16).

## Features

- **Status bar** — live token savings from `toknt stats`
- **Show Stats** — detailed savings breakdown in a notification
- **Recall URI** — open full content for any `toknt://file|output|directory|tool/<id>` URI
- **Mode control** — switch between `safe`, `balanced`, and `aggressive` via command palette or settings

## Prerequisites

Install the Tokn't CLI:

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt && npm install && npm run build
npm link -w toknt   # or: node apps/cli/dist/index.js
```

Verify:

```bash
toknt --version
toknt config set mode balanced
```

## Install the extension

### From source (development)

```bash
cd apps/vscode-extension
npm install
npm run build
```

Press **F5** in VS Code to launch the Extension Development Host.

### From `.vsix` package

```bash
cd apps/vscode-extension
npm install
npm run build
npm run package
code --install-extension toknt-vscode-1.0.0.vsix
```

### Open VSX

Publish with `vsce publish -i <openvsx-token>` when ready.

## Commands

| Command | Description |
|---------|-------------|
| `Tokn't: Show Stats` | Display token savings summary |
| `Tokn't: Recall URI` | Recall compressed content by URI |
| `Tokn't: Set Mode — Safe` | Switch to safe mode |
| `Tokn't: Set Mode — Balanced` | Switch to balanced mode |
| `Tokn't: Set Mode — Aggressive` | Switch to aggressive mode |
| `Tokn't: Refresh Status Bar` | Force refresh status bar |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `toknt.enabled` | `true` | Show status bar and enable commands |
| `toknt.cliPath` | `toknt` | Path to the toknt CLI binary |
| `toknt.mode` | `safe` | Optimization mode (synced to `~/.toknt/config.json`) |
| `toknt.statusBarRefreshSeconds` | `30` | Status bar refresh interval |

## How it works

The extension shells out to the `toknt` CLI — it does not require Cursor. Stats are persisted to `~/.toknt/stats.json` when agent hooks compress tool output.

## License

MIT
