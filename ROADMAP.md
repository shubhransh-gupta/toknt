# Roadmap

Help us build Tokn't. Pick any unchecked item and [open a PR](CONTRIBUTING.md).

## v1.0 — Shipped ✓

- [x] Core optimization engine (classifier, safety, metrics)
- [x] Local content-addressed cache + recall URIs
- [x] Duplicate file read detection
- [x] Terminal output compression
- [x] Directory listing compression
- [x] Duplicate tool output detection
- [x] CLI (`toknt install`, `stats`, `benchmark`, `doctor`, …)
- [x] Adapters: Claude Code, Cursor, Codex
- [x] Cursor plugin (hooks, skills, rules)
- [x] Benchmark engine + 6 tasks
- [x] Tokn't Observatory portal
- [x] Secret detection + redaction
- [x] CI/CD + docs

## v1.1 — Community (help wanted)

- [ ] **npm publish** — `npx toknt` one-liner install
- [x] **Jest / Vitest / pytest output parsers** — terminal summarization
- [ ] **Real agent benchmarks** — run against live Cursor/Claude sessions
- [x] **GitHub Pages live demo** — deploy Observatory
- [ ] **VS Code extension** — beyond Cursor plugin
- [x] **Windsurf adapter** — expand agent support
- [x] **Cache size limits + LRU eviction** — Phase 2A
- [x] **`toknt config` CLI** — set mode without editing JSON
- [ ] **Watch mode** — auto-invalidate on file system changes

See [PHASE2.md](./PHASE2.md) for the full Phase 2 plan.

## v1.2 — Power features

- [ ] **Semantic stale-context pruning** (optional, off by default)
- [ ] **Session replay** — debug what was compressed and why
- [ ] **Team config sharing** — export/import rules (no code, config only)
- [ ] **MCP server** — expose recall + stats to any MCP client
- [ ] **TUI dashboard** — terminal UI for stats (`toknt tui`)

## v2.0 — Ecosystem

- [ ] **Plugin marketplace** — community optimizers
- [ ] **Language-specific compressors** — Swift, Rust, Python AST-aware summaries
- [ ] **Benchmark leaderboard** — opt-in anonymous stats (local export only)
- [ ] **IDE inline indicators** — "Tokn't saved 4.2K tokens this session"

---

## How to claim work

1. Comment on the issue: *"I'd like to work on this"*
2. No issue yet? Open one describing your plan
3. Small PRs merge fast — don't wait for permission on `good first issue` items

Labels: [`good first issue`](https://github.com/shubhransh-gupta/toknt/labels/good%20first%20issue) · [`help wanted`](https://github.com/shubhransh-gupta/toknt/labels/help%20wanted) · [`bounty`](https://github.com/shubhransh-gupta/toknt/labels/bounty)
