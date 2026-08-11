# Claude Code Integration

## Install

```bash
toknt install claude
```

## How It Works

Tokn't installs a PostToolUse hook at `~/.claude/toknt/` that intercepts tool output after each Claude Code tool invocation.

## Hook

The hook at `~/.claude/toknt/hooks/post-tool-use.js`:

1. Receives tool name and output
2. Runs through Tokn't optimization engine
3. Returns compressed output to Claude Code

## Verify

```bash
toknt status
toknt doctor
```

## Uninstall

```bash
toknt uninstall
```

Removes `~/.claude/toknt/` but preserves cache.
