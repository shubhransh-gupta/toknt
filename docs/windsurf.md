# Windsurf Integration

## Install

```bash
toknt install windsurf
```

## How It Works

Tokn't installs hooks at `~/.windsurf/toknt/` (or `~/.codeium/windsurf/toknt/` if present).

The `afterToolCall` hook optimizes tool output before it reaches the Windsurf agent.

## Verify

```bash
toknt status
toknt doctor
```

## Uninstall

```bash
toknt uninstall
```

Removes the Tokn't config directory but preserves the local cache at `~/.toknt/`.
