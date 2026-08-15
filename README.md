<div align="center">

<p><strong>TOKEN OPTIMIZATION FOR AI AGENTS</strong></p>

# Cut the token waste.<br/>Keep the intelligence.

**Local-first token optimization for Claude Code · Cursor · Codex · Windsurf · VS Code**

<br/>

[![GitHub stars](https://img.shields.io/github/stars/shubhransh-gupta/toknt?style=flat-square&logo=github&color=22c55e)](https://github.com/shubhransh-gupta/toknt/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/shubhransh-gupta/toknt/ci.yml?style=flat-square&logo=githubactions&label=CI)](https://github.com/shubhransh-gupta/toknt/actions)
[![Observatory](https://img.shields.io/badge/Observatory-live-22c55e?style=flat-square)](https://shubhransh-gupta.github.io/toknt/)

<br/>

[Observatory](https://shubhransh-gupta.github.io/toknt/) · [Setup guide](docs/reduce-token-cost.md) · [Getting started](docs/getting-started.md) · [Contributing](CONTRIBUTING.md)

</div>

<br/>

> Measure, compare, and reduce redundant context before it reaches your model.  
> Your code never leaves your machine — no uploads, no cloud.

<br/>

<div align="center">

| Before | | After |
|:------:|:-:|------:|
| **38.2K** tokens | **−91.5%** | **3.2K** tokens |
| *balanced mode · tiktoken cl100k_base* | | *measured* |

*Default `safe` mode: **~6.5%** on mixed sessions · Duplicate file reads: **~46%** · [Full stats ↓](#measured-accuracy)*

</div>

<br/>

---

## Why Tokn't

| Problem | What Tokn't does |
|:--------|:-----------------|
| Agent rereads the same file repeatedly | Hash-based dedup + local recall URI |
| `npm test` dumps thousands of lines into context | Summarize failures; store full output in `~/.toknt/` |
| Directory listings send tens of thousands of paths | Tree summary + searchable local index |
| Identical grep/search results repeated | Content-hash caching |
| Dashboards that only *report* waste | **Actually compresses** what hits the model |

Not another token counter — a performance layer between your agent and the model.

<br/>

---

## Setup guide

Six steps. Local-only. No API keys.

### 1. Install Tokn't

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt && npm install && npm run build
```

### 2. Connect your agent

```bash
npx toknt install cursor   # or claude, codex, windsurf
npx toknt status
npx toknt doctor
```

### 3. Set optimization mode

```bash
npx toknt config set mode balanced
```

### 4. Code normally

Open Cursor, Claude Code, or Codex — Tokn't compresses tool output automatically via hooks.

### 5. Track savings

```bash
npx toknt stats
npx toknt benchmark --mode balanced --export run.json
```

Import `run.json` in the [Observatory](https://shubhransh-gupta.github.io/toknt/) to visualize results.

### 6. Recall when needed

```bash
npx toknt recall toknt://file/abc123
```

Full content stays in `~/.toknt/` — never lost, just not sent to the model every time.

<br/>

### Optimization modes

| Mode | Typical savings | Best for |
|:-----|:----------------|:---------|
| **`safe`** | ~6.5% | Default — duplicate files & tool output only |
| **`balanced`** | ~91% | Heavy test output, directory listings, large logs |
| **`aggressive`** | Higher | Experiments — may affect task quality |

Restart your agent after changing mode. [Full guide →](docs/reduce-token-cost.md)

<br/>

---

## Quick install

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt && npm install && npm run build
npx toknt install
npx toknt config set mode balanced
```

**VS Code / VSCodium:** install the extension from [`apps/vscode-extension`](apps/vscode-extension/README.md) for status bar stats and recall commands.

<br/>

---

## How it works

```
Claude Code ─┐
Cursor      ─┼─→  TOKN'T  ─→  Optimized context  ─→  AI agent
Codex       ─┘       │
Windsurf    ─┘       ├── Deduplicate (hash files & tool output)
                     ├── Compress (terminal output, directories)
                     ├── Cache locally (~/.toknt/)
                     └── Recall (toknt://file/abc123)
```

**Local-first & private** — never compresses secrets, diffs, or errors. Your code stays on your machine.

<br/>

---

## Measured accuracy

*2,000 automated test cases · tiktoken cl100k_base · [`accuracy-2000.json`](benchmarks/results/accuracy-2000.json)*

| Metric | Result |
|:-------|:-------|
| Engine accuracy | **2000/2000 (100%)** |
| Recall integrity | **1055/1055 (100%)** |
| Critical/secret passthrough | **400/400 (100%)** |
| Reduction % vs tiktoken | **~4pp avg delta** |

<details>
<summary><strong>All 2,000 test categories</strong></summary>

| Category | Cases | Result |
|:---------|------:|:-------|
| Duplicate file reads | 350 | 350/350 |
| Terminal output | 350 | 350/350 |
| Directory listings | 350 | 350/350 |
| Duplicate tool output | 200 | 200/200 |
| Critical content | 250 | 250/250 |
| Secret detection | 150 | 150/150 |
| File change invalidation | 200 | 200/200 |
| Token estimator | 150 | 150/150 |

</details>

Reproduce: `npm run audit:2000`

<br/>

---

## Commands

```bash
toknt install [agent]     # claude, cursor, codex, windsurf
toknt config set mode balanced
toknt stats --json
toknt recall toknt://file/<id> --json
toknt benchmark --export run.json
toknt watch .             # invalidate cache on file changes
toknt doctor
```

<details>
<summary><strong>All commands</strong></summary>

| Command | Description |
|:--------|:------------|
| `toknt install [agent]` | Install hooks for detected agents |
| `toknt config show` | View config and cache stats |
| `toknt stats --json` | Token savings breakdown |
| `toknt benchmark` | Before/after comparison |
| `toknt recall <uri>` | Retrieve compressed content |
| `toknt cache clear` | Reset local cache |
| `toknt watch [path]` | Watch files and invalidate duplicate cache |

</details>

<br/>

---

## Contributing

Pick an [open issue](https://github.com/shubhransh-gupta/toknt/issues) or see [CONTRIBUTING.md](CONTRIBUTING.md).

| Area | Good first tasks |
|:-----|:-----------------|
| `packages/optimizer` | Go, Rust, Java test output parsers ([#12](https://github.com/shubhransh-gupta/toknt/issues/12)–[#14](https://github.com/shubhransh-gupta/toknt/issues/14)) |
| `packages/core` | MCP server ([#15](https://github.com/shubhransh-gupta/toknt/issues/15)) |
| `apps/observatory` | Session import ([#17](https://github.com/shubhransh-gupta/toknt/issues/17)) |

`main` is protected — PRs required, CI must pass. See [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md).

<br/>

---

## Documentation

| Doc | Description |
|:----|:------------|
| [Reduce token cost](docs/reduce-token-cost.md) | Setup, modes, daily usage |
| [Getting started](docs/getting-started.md) | Install walkthrough |
| [Architecture](ARCHITECTURE.md) | System design |
| [Benchmarks](BENCHMARKS.md) | Methodology |
| [VS Code extension](apps/vscode-extension/README.md) | Editor integration |
| [Roadmap](ROADMAP.md) | What's next |

<br/>

<div align="center">

**Same agent. Same task. Less context.**

<br/>

If Tokn't saves you tokens, **[star the repo](https://github.com/shubhransh-gupta/toknt/stargazers)** — it helps other builders find it.

<br/>

Created with ❤️ by **[Shubhransh Gupta](https://github.com/shubhransh-gupta)**

<br/>

MIT — [LICENSE](LICENSE)

</div>
