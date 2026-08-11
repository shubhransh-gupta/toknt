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

**WITHOUT TOKN'T** *(balanced mode, measured)*

```
Mixed agent session
38,216 tokens (tiktoken)
```

</td>
<td width="50%">

**WITH TOKN'T** *(balanced mode, measured)*

```
Same session, compressed
3,236 tokens (tiktoken)
```

**↓ 91.5% fewer tokens** · *[MEASURED — local audit](benchmarks/results/accuracy-audit.json)*

</td>
</tr>
</table>

> **Default `safe` mode** on the same session: **~6.5%** reduction (duplicates only).  
> **Real repo** duplicate file reads: **~46%** reduction.  
> See [Honest summary](#honest-summary-for-users) below.

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

## Honest summary for users

We measured Tokn't across **2,000 automated test cases** and validated token counts with **tiktoken (cl100k_base)**. Reports: [`accuracy-2000.json`](benchmarks/results/accuracy-2000.json) · [`accuracy-audit.json`](benchmarks/results/accuracy-audit.json). Reproduce: `npm run audit:2000`.

### Engine accuracy (2,000 cases)

| Metric | Result |
|--------|--------|
| **Overall pass rate** | **2000/2000 (100%)** |
| **Recall integrity** | **1055/1055 (100%)** |
| **Critical/secret passthrough** | **400/400 (100%)** |
| **Token reduction % vs tiktoken** | **~4pp avg delta** |
| **Absolute token counts** | **~27.5% avg underestimate** (not for billing) |

### Outcomes by category (2,000 cases)

| Category | Cases | Result | What was tested |
|----------|------:|--------|-----------------|
| Duplicate file reads | 350 | 350/350 ✓ | Same path read 2–3× → compressed with recall |
| Terminal output | 350 | 350/350 ✓ | Jest/Vitest/pytest/generic — compressed when mode thresholds met |
| Directory listings | 350 | 350/350 ✓ | Large listings compressed in balanced/aggressive, not safe |
| Duplicate tool output | 200 | 200/200 ✓ | Identical grep/JSON results deduped with recall |
| Critical content | 250 | 250/250 ✓ | User requests, diffs, errors, patches — never compressed |
| Secret detection | 150 | 150/150 ✓ | API keys, tokens, passwords — never compressed |
| File change invalidation | 200 | 200/200 ✓ | Same file twice OK; changed content not treated as duplicate |
| Token estimator | 150 | 150/150 ✓ | Heuristic counts within 50% of tiktoken on sample texts |

### How much do you actually save?

| Mode | What it does | Measured reduction (tiktoken) |
|------|----------------|----------------------------------|
| **`safe`** (default) | Duplicate files & tool output only | **~6.5%** on a mixed session |
| **`balanced`** | + terminal & directory compression | **~91.5%** on the same session |
| Real repo duplicate reads | Reading the same files twice | **~46%** |

Your savings depend on what your agent sends. Heavy `npm test` output or `find .` listings → big wins in balanced mode. Agents that mostly re-read files → modest wins even in safe mode.

### Per-optimization (balanced mode, measured)

| Optimization | Reduction | Recall |
|--------------|-----------|--------|
| Duplicate file reads | ~64% | ✓ |
| Terminal output (1,200+ lines) | ~98% | ✓ |
| Directory listing (3,200 files) | ~99% | ✓ |
| Duplicate tool output | ~49% | ✓ |
| Errors, diffs, user requests | 0% (never compressed) | — |

### Are the token numbers exact?

**No.** `toknt stats` uses a heuristic estimator — on average **~27.5% lower** than tiktoken on absolute counts (only **~31%** of samples within 20%). Reduction **percentages** track tiktoken within **~4 percentage points**. These are **not** provider billing numbers.

### What we haven't validated yet

- Live Cursor, Claude Code, or Codex sessions (hooks install config; end-to-end agent integration varies)
- Published npm install (`npx toknt`) — workflow ready, requires `NPM_TOKEN`

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
| [Benchmarks](BENCHMARKS.md) | Methodology & measured results |
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
