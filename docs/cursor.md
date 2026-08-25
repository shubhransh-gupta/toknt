# Cursor Integration

## Install

```bash
npm install && npm run build
npm link -w toknt   # optional: puts toknt on your PATH
toknt install cursor
toknt config set mode balanced
```

Restart Cursor after install.

## What Tokn't can do in Cursor

Cursor’s hooks API only lets us **rewrite** some outputs:

| Path | Tracks live? | Saves tokens for the model? |
|------|--------------|-------------------------------|
| Shell (Agent) | Yes | **Yes** in `balanced`/`aggressive` via wrap |
| MCP tools | Yes | **Yes** when compressible |
| Read / Grep / etc. | Yes | **No** (Cursor cannot strip these yet) — counted as *opportunity* |

## Live savings

```bash
toknt stats          # snapshot
toknt stats --watch  # real-time dashboard
toknt status         # includes tool-call counters
```

VS Code / Cursor status bar (extension) also polls saved tokens.

## Hooks installed

| Hook | Behavior |
|------|----------|
| `preToolUse` (Shell) | Wraps known test runners (`npm test`, `pytest`, …) so large stdout can be compressed before the model sees it |
| `postToolUse` | Tracks **every** tool call; delivers rewrites for MCP; records opportunity on Read/etc. |

Files:

- `~/.cursor/hooks.json`
- `~/.cursor/hooks/toknt-*.mjs`
- `~/.toknt/stats.json`, `live.json`, `activity.jsonl`

## Uninstall

```bash
toknt uninstall
```
