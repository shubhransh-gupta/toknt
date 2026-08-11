# Tokn't

### Tokens? Tokn't.

A local-first token optimization layer for AI coding agents.

**Claude Code · Cursor · Codex**

---

```
WITHOUT                    WITH TOKN'T
184K tokens                112K tokens
                           ↓ 39%
```

*Example benchmark — [DEMO DATA]*

---

## Why Tokn't?

AI coding agents repeatedly:

- reread files
- repeat terminal output
- rediscover repositories
- receive duplicate tool results
- carry stale context

Tokn't eliminates that redundancy — silently, locally, safely.

## Quick Start

```bash
git clone https://github.com/toknt/toknt.git
cd toknt
npm install
npm run build
npx toknt install
```

## How It Works

```
Claude Code ─┐
Cursor      ─┼─→ TOKN'T ─→ Optimized Context ─→ AI Agent
Codex       ─┘
```

Tokn't sits between your agent and the model, optimizing redundant context:

| Optimization | What it does |
|---|---|
| Duplicate file reads | Hash-based deduplication with recall |
| Terminal output | Summarize test results, store full output locally |
| Directory listings | Tree summaries instead of 40K filenames |
| Duplicate tool output | Content-hash caching |

## Install

```bash
npx toknt install          # Interactive — detects agents
npx toknt install cursor   # Specific agent
npx toknt install claude
npx toknt install codex
```

## CLI Commands

```bash
toknt install              # Install integrations
toknt uninstall            # Remove integrations
toknt status               # Show status
toknt stats                # Token savings (estimated)
toknt stats --json         # JSON output
toknt explain              # How Tokn't works
toknt benchmark            # Run benchmarks
toknt benchmark --export result.json
toknt cache                # Cache info
toknt cache clear          # Clear cache
toknt recall toknt://file/abc123
toknt doctor               # Health check
```

## Optimization Modes

| Mode | Behavior |
|---|---|
| `safe` (default) | Duplicate detection only |
| `balanced` | + terminal/directory compression |
| `aggressive` | + heuristic pruning (may affect quality) |

## Safety

Tokn't **never** compresses:

- Current user request
- Git diffs
- Compiler errors
- Failing test details
- Tool arguments

When uncertain: **pass through original**.

## Privacy

🔒 **Local-first.** Your code never leaves your machine.

- No source uploads
- No prompts uploaded
- No API keys stored
- Cache at `~/.toknt/`

## Observatory

Visualize benchmark results at the Tokn't Observatory:

```bash
npm run dev -w @toknt/observatory
```

Import benchmark JSON from `toknt benchmark --export`.

## Benchmarks

```bash
toknt benchmark --task fix-authentication
toknt benchmark --agent cursor --export results.json
```

See [BENCHMARKS.md](./BENCHMARKS.md) for methodology.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design.

## Development

```bash
npm install
npm test
npm run lint
npm run build
npm run dev          # Observatory dev server
npm run benchmark    # Run benchmarks
```

## Cursor Plugin

Install the Cursor plugin from `plugins/cursor/`:

1. Copy `plugins/cursor/` to your Cursor plugins directory
2. Or run `toknt install cursor`

The plugin hooks into tool lifecycle events to optimize output.

## License

MIT — see [LICENSE](./LICENSE)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)
