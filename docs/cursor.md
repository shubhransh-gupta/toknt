# Cursor Integration

## Install

```bash
toknt install cursor
```

## Plugin

The Cursor plugin is at `plugins/cursor/` and includes:

- **Hooks** — `after-tool-call.js` intercepts tool output
- **Skills** — `toknt-optimize` for recall commands
- **Rules** — `toknt-recall` for compressed content handling

## Manual Plugin Install

1. Copy `plugins/cursor/` to your Cursor plugins directory
2. Restart Cursor

## How It Works

Cursor hooks fire after each tool call. Tokn't:

1. Receives the tool output
2. Classifies and validates safety
3. Compresses if safe (duplicates, large output)
4. Returns optimized content to the agent
5. Stores original locally for recall

## Verify

```bash
toknt status
toknt doctor
```

Look for "Cursor integration: Active"
