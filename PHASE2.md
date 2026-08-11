# Phase 2 — Production-ready & proven in the wild

Phase 1 shipped the engine, honest benchmarks, docs, and Observatory.  
Phase 2 makes Tokn't **usable every day** in real agent sessions.

## Milestone A — "It installs" ✅ in progress

| Item | Status |
|------|--------|
| `toknt config set mode balanced` | ✅ Shipped |
| `toknt config get/show/path` | ✅ Shipped |
| Sync mode to agent hook configs | ✅ Shipped |
| LRU cache eviction (`maxCacheSizeMB`) | ✅ Shipped |
| npm publish (`npx toknt`) | 🔲 Needs `NPM_TOKEN` |
| Live session audit harness | 🔲 Started (`scripts/live-session-audit.mjs`) |

### New commands

```bash
toknt config                          # show config + cache stats
toknt config set mode balanced        # max savings on large logs
toknt config set maxCacheSizeMB 1024  # cache size cap
toknt config get mode
toknt config path
```

## Milestone B — "It works in Cursor"

| Item | Status |
|------|--------|
| End-to-end Cursor hook test | 🔲 |
| Live session audit (10–20 real sessions) | 🔲 |
| File watcher cache invalidation | 🔲 |
| Token estimator alignment (~27% error → <15%) | 🔲 |

Run live audit:

```bash
npm run audit:live
```

## Milestone C — "It spreads"

| Item | Status |
|------|--------|
| MCP server (recall + stats) | 🔲 |
| VS Code extension | 🔲 |
| Observatory session import | 🔲 |
| More terminal parsers (Go, Rust, Java) | 🔲 |

---

See [ROADMAP.md](./ROADMAP.md) for the full checklist.
