<div align="center">

```
 ████████╗ ██████╗ ██╗  ██╗███╗   ██╗' ████████╗
 ╚══██╔══╝██╔═══██╗██║ ██╔╝████╗  ██║    ██╔══╝
    ██║   ██║   ██║█████╔╝ ██╔██╗ ██║    ██║
    ██║   ██║   ██║██╔═██╗ ██║╚██╗██║    ██║
    ██║   ╚██████╔╝██║  ██╗██║ ╚████║    ██║
    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═╝
```

# Tokens? Tokn't.

**Cut the token waste. Keep the intelligence.**

[![GitHub stars](https://img.shields.io/github/stars/shubhransh-gupta/toknt?style=for-the-badge&logo=github&color=00ff88&labelColor=0a0a0f)](https://github.com/shubhransh-gupta/toknt/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-00ff88?style=for-the-badge&labelColor=0a0a0f)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/shubhransh-gupta/toknt/ci.yml?style=for-the-badge&logo=githubactions&label=CI&labelColor=0a0a0f)](https://github.com/shubhransh-gupta/toknt/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-00ff88?style=for-the-badge&labelColor=0a0a0f)](CONTRIBUTING.md)

**Local-first token optimization for Claude Code · Cursor · Codex**

[⭐ Star on GitHub](https://github.com/shubhransh-gupta/toknt) · [🔭 Live Demo](https://shubhransh-gupta.github.io/toknt/) · [📖 Docs](docs/getting-started.md) · [🤝 Contribute](CONTRIBUTING.md)

</div>

---

> **Your AI coding agent doesn't need to see everything twice.**

<table>
<tr>
<td width="50%">

**WITHOUT TOKN'T**

```
READ UserService.swift     4,200 tokens
READ UserService.swift     4,200 tokens  ← again
READ UserService.swift     4,200 tokens  ← again
npm test output           48,000 tokens
find . -type f            32,000 tokens
─────────────────────────────────────
Total                    ~184K tokens
```

</td>
<td width="50%">

**WITH TOKN'T**

```
READ UserService.swift     4,200 tokens
[UNCHANGED FILE]              42 tokens  ✓
[UNCHANGED FILE]              42 tokens  ✓
TEST RESULT summary          380 tokens  ✓
PROJECT STRUCTURE            210 tokens  ✓
─────────────────────────────────────
Total                    ~112K tokens
```

**↓ 39% fewer tokens** · *example benchmark [DEMO DATA]*

</td>
</tr>
</table>

---

## Why devs are starring this

| Problem | Tokn't fix |
|---------|------------|
| Agent rereads the same file 5× | Hash-based dedup + recall |
| `npm test` dumps 12K lines into context | Summarize failures, store full output locally |
| `find .` sends 40K filenames to the model | Tree summary + searchable local index |
| Identical grep results repeated | Content-hash caching |
| Token counters that *tell* you waste | **Actually reduces** what hits the model |

**Not another dashboard. Not another token counter. A performance layer.**

Like Cloudflare makes sites faster — **Tokn't makes AI agents leaner.**

---

## 60-second install

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt && npm install && npm run build
npx toknt install    # detects Cursor, Claude Code, Codex
npx toknt status     # verify
```

Or one-liner (after npm publish):

```bash
npx toknt install
```

---

## See it work

```bash
# Run a before/after benchmark
npx toknt benchmark --task fix-authentication

# Watch your savings
npx toknt stats

# Open the Observatory (visual dashboard)
npm run dev -w @toknt/observatory
```

**[→ Live Observatory Demo](https://shubhransh-gupta.github.io/toknt/)** — upload your own `benchmark --export` JSON

---

## How it works

```
Claude Code ─┐
Cursor      ─┼─→  TOKN'T  ─→  Optimized Context  ─→  AI Agent
Codex       ─┘       │
                       ├── Deduplicate (hash files & tool output)
                       ├── Compress (terminal, directories)
                       ├── Cache locally (~/.toknt/)
                       └── Recall (toknt://file/abc123)
```

**Safety first:** Never compresses user requests, git diffs, compiler errors, or secrets.  
When uncertain → **pass through original**.

🔒 **Local-first** — your code never leaves your machine.

---

## CLI

```bash
toknt install              # Install integrations
toknt stats --json         # Token savings (estimated)
toknt benchmark --export result.json
toknt recall toknt://file/abc123
toknt doctor               # Health check
toknt explain              # Full overview
```

<details>
<summary><strong>All commands</strong></summary>

| Command | Description |
|---------|-------------|
| `toknt install [agent]` | Install for claude, cursor, codex, or all |
| `toknt uninstall` | Remove integrations |
| `toknt status` | Show mode, cache, integrations |
| `toknt stats` | Token savings breakdown |
| `toknt benchmark` | Before/after comparison |
| `toknt cache` / `cache clear` | Manage local cache |
| `toknt recall <uri>` | Retrieve compressed content |

</details>

---

## Contribute — we need you

Tokn't is **early and open source**. This is the best time to shape it.

**[Good first issues →](https://github.com/shubhransh-gupta/toknt/labels/good%20first%20issue)**

| Area | Starter task |
|------|--------------|
| `packages/core` | Add new safety classification rules |
| `packages/optimizer` | Better test output parsers (Jest, pytest, Go) |
| `integrations/` | Improve Cursor / Claude / Codex hooks |
| `apps/observatory` | UI polish, new chart types |
| `benchmarks/` | New deterministic benchmark tasks |

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt && npm install && npm test && npm run build
# pick an issue, open a PR — we respond fast
```

See [CONTRIBUTING.md](CONTRIBUTING.md) · [ROADMAP.md](ROADMAP.md) · [LAUNCH.md](LAUNCH.md) (share with your network)

---

## Share it

If Tokn't saved you tokens, help others find it:

[![Star on GitHub](https://img.shields.io/static/v1?label=Star&message=Tokn't&color=0a0a0f&logo=github&style=for-the-badge)](https://github.com/shubhransh-gupta/toknt)

**Copy-paste for Twitter/X:**
```
Your AI agent reads the same file 5 times and you're paying for every byte.

Tokn't fixes that — local-first, open source, works with Cursor/Claude/Codex.

Tokens? Tokn't.

⭐ github.com/shubhransh-gupta/toknt
```

---

## Docs

| Doc | Description |
|-----|-------------|
| [Architecture](ARCHITECTURE.md) | System design |
| [Benchmarks](BENCHMARKS.md) | Methodology |
| [Security](SECURITY.md) | Threat model |
| [Privacy](PRIVACY.md) | Local-first policy |
| [Getting Started](docs/getting-started.md) | Install guide |
| [Cursor](docs/cursor.md) · [Claude](docs/claude.md) · [Codex](docs/codex.md) | Integrations |

---

## License

MIT — [LICENSE](LICENSE)

<div align="center">

**Same agent. Same task. Less context. Fewer tokens.**

*Tokens? Tokn't.*

</div>
