# Phase 2 — Production-ready & proven in the wild

Phase 1 shipped the engine, honest benchmarks, docs, and Observatory.  
Phase 2 makes Tokn't **usable every day** in real agent sessions.

## Milestone A — "It installs" ✅

| Item | Status |
|------|--------|
| `toknt config set mode balanced` | ✅ Shipped |
| `toknt config get/show/path` | ✅ Shipped |
| Sync mode to agent hook configs | ✅ Shipped |
| LRU cache eviction (`maxCacheSizeMB`) | ✅ Shipped |
| Live session audit harness | ✅ Shipped |
| npm publish (`npx toknt`) | 🔲 Needs `NPM_TOKEN` |

### New commands

```bash
toknt config                          # show config + cache stats
toknt config set mode balanced        # max savings on large logs
toknt config set maxCacheSizeMB 1024  # cache size cap
toknt config get mode
toknt config path
```

## Milestone B — "It works in Cursor" ✅ in progress

| Item | Status |
|------|--------|
| End-to-end Cursor hook test | ✅ Shipped |
| Live session audit (15 simulated sessions) | ✅ Shipped |
| File watcher cache invalidation | ✅ Shipped (`toknt watch`) |
| Token estimator alignment (~27% error → <15%) | ✅ Shipped (js-tiktoken) |
| Cursor install copies hook scripts | ✅ Shipped |

Run live audit:

```bash
npm run audit:live
npm run audit:live -- --sessions 20 --mode balanced
```

Watch for file changes:

```bash
toknt watch .
```

## Milestone C — "It spreads"

| Item | Status |
|------|--------|
| MCP server (recall + stats) | ✅ Shipped (`toknt mcp`) |
| VS Code extension | ✅ Shipped (`apps/vscode-extension`) |
| Observatory session import | ✅ Shipped |
| More terminal parsers (Go, Rust, Java) | ✅ Shipped |

---

See [ROADMAP.md](./ROADMAP.md) for the full checklist.
