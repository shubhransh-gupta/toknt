# Codex Integration

## Install

```bash
toknt install codex
```

## How It Works

Tokn't installs a plugin at `~/.codex/toknt/` with an `onToolResult` hook that intercepts Codex tool results.

## Architecture

Codex is treated as a first-class adapter. The adapter interface abstracts differences from Cursor and Claude Code:

- Different hook event names
- Different config directory
- Same core optimization engine

## Verify

```bash
toknt status
toknt doctor
```

## Benchmark

```bash
toknt benchmark --agent codex
```
