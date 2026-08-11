<div align="center">

```
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
🟩  ⛏️  T O K N ' T  ⛏️  💎  🟩
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
```

# Tokens? Tokn't.

**Smelt the token waste. Keep the intelligence.**

[![GitHub stars](https://img.shields.io/github/stars/shubhransh-gupta/toknt?style=for-the-badge&logo=github&color=17DD62&labelColor=2a2a2a)](https://github.com/shubhransh-gupta/toknt/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFD700?style=for-the-badge&labelColor=2a2a2a)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/shubhransh-gupta/toknt/ci.yml?style=for-the-badge&logo=githubactions&label=CI&labelColor=2a2a2a&color=17DD62)](https://github.com/shubhransh-gupta/toknt/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-4EE4EF?style=for-the-badge&labelColor=2a2a2a)](CONTRIBUTING.md)

**Local-first token optimization for Claude Code · Cursor · Codex**

[⭐ Star on GitHub](https://github.com/shubhransh-gupta/toknt) · [💎 Reduce token cost](docs/reduce-token-cost.md) · [🔭 Live Observatory](https://shubhransh-gupta.github.io/toknt/#setup) · [📖 Docs](docs/getting-started.md) · [🤝 Contribute](CONTRIBUTING.md)

</div>

---

> **Your AI agent keeps mining the same block. Stop paying for duplicate ore.**

<table>
<tr>
<td width="50%">

**🪨 RAW ORE** *(balanced mode, measured)*

```
Mixed agent session
38,216 tokens (tiktoken)
```

</td>
<td width="50%">

**💎 REFINED INGOT** *(balanced mode, measured)*

```
Same session, smelted
3,236 tokens (tiktoken)
```

**↓ 91.5% fewer tokens** · *[MEASURED — local audit](benchmarks/results/accuracy-audit.json)*

</td>
</tr>
</table>

> **Default `safe` mode** on the same session: **~6.5%** reduction (duplicates only).  
> **Real repo** duplicate file reads: **~46%** reduction.  
> See [Achievement log](#achievement-log-honest-stats) below.

> **New here?** Follow the **[6-step setup guide](#-how-to-configure--reduce-token-cost)** to install, configure mode, and cut token cost · [Full guide](docs/reduce-token-cost.md) · [Live walkthrough on Observatory](https://shubhransh-gupta.github.io/toknt/#setup)

---

## ⛏️ Why crafters are starring this

| Mob problem | Tokn't enchantment |
|-------------|-------------------|
| Agent rereads the same file 5× | Hash-based dedup + recall |
| `npm test` dumps 12K lines into context | Summarize failures, store full output locally |
| `find .` sends 40K filenames to the model | Tree summary + searchable local index |
| Identical grep results repeated | Content-hash caching |
| Token counters that *tell* you waste | **Actually smelts** what hits the model |

**Not another scoreboard. Not another token counter. A performance layer.**

Like Efficiency III on your pickaxe — **Tokn't makes AI agents leaner.**

---

## 🛠️ Crafting table — 60-second install

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt && npm install && npm run build
npx toknt install    # detects Cursor, Claude Code, Codex
npx toknt status     # verify your world is ready
```

Or one-liner (after npm publish):

```bash
npx toknt install
```

---

## 💎 How to configure & reduce token cost

**Full guide → [docs/reduce-token-cost.md](docs/reduce-token-cost.md)**

### Quick setup (6 steps)

| Step | Command / action |
|------|------------------|
| **1. Install** | `git clone … && npm install && npm run build` |
| **2. Connect agent** | `npx toknt install cursor` (or `claude`, `codex`) |
| **3. Set mode** | Edit `~/.toknt/config.json` → `"mode": "balanced"` for max savings on large logs |
| **4. Use agent** | Code normally — Tokn't compresses tool output automatically |
| **5. Track savings** | `npx toknt stats` |
| **6. Recall full content** | `npx toknt recall toknt://file/abc123` |

### Which mode saves the most?

| Mode | Best for | Measured reduction* |
|------|----------|---------------------|
| **`safe`** (default) | Duplicate file reads, identical tool output | **~6.5%** mixed session · **~46%** duplicate reads |
| **`balanced`** | + huge `npm test` output, `find .`, directory listings | **~91.5%** on log-heavy sessions |
| **`aggressive`** | Experiments only — may hurt task quality | Higher, not fully measured |

\*tiktoken-measured locally. Use `toknt stats` for your own trends — not for exact billing.

**Example config** (`~/.toknt/config.json`):

```json
{
  "mode": "balanced",
  "integrations": { "cursor": true }
}
```

Restart your agent after changing mode.

---

## 🔥 Smelting demo — see it work

```bash
# Run a before/after benchmark
npx toknt benchmark --task fix-authentication

# Check your XP (token savings)
npx toknt stats

# Open the Observatory (blocky visual dashboard)
npm run dev -w @toknt/observatory
```

**[→ Live Observatory](https://shubhransh-gupta.github.io/toknt/)** — Minecraft-themed dashboard · upload your own `benchmark --export` JSON

---

## 🗺️ How the redstone works

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

🛡️ **Local survival mode** — your code never leaves your machine.

---

## 📜 Achievement log (honest stats)

We measured Tokn't across **2,000 automated quests** and validated token counts with **tiktoken (cl100k_base)**. Reports: [`accuracy-2000.json`](benchmarks/results/accuracy-2000.json) · [`accuracy-audit.json`](benchmarks/results/accuracy-audit.json). Reproduce: `npm run audit:2000`.

### Engine accuracy (2,000 quests)

| Metric | Result |
|--------|--------|
| **Overall pass rate** | **2000/2000 (100%)** ✓ |
| **Recall integrity** | **1055/1055 (100%)** ✓ |
| **Critical/secret passthrough** | **400/400 (100%)** ✓ |
| **Token reduction % vs tiktoken** | **~4pp avg delta** |
| **Absolute token counts** | **~27.5% avg underestimate** (not for billing) |

### Quest outcomes by category

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

### How much ore do you actually smelt?

| Mode | Enchantment | Measured reduction (tiktoken) |
|------|-------------|----------------------------------|
| **`safe`** (default) | Duplicate files & tool output only | **~6.5%** on a mixed session |
| **`balanced`** | + terminal & directory compression | **~91.5%** on the same session |
| Real repo duplicate reads | Reading the same files twice | **~46%** |

Your savings depend on what your agent mines. Heavy `npm test` output or `find .` listings → big XP in balanced mode. Agents that mostly re-read files → modest gains even in safe mode.

### Per-enchantment (balanced mode, measured)

| Optimization | Reduction | Recall |
|--------------|-----------|--------|
| Duplicate file reads | ~64% | ✓ |
| Terminal output (1,200+ lines) | ~98% | ✓ |
| Directory listing (3,200 files) | ~99% | ✓ |
| Duplicate tool output | ~49% | ✓ |
| Errors, diffs, user requests | 0% (never compressed) | — |

### Are the token numbers exact?

**No.** `toknt stats` uses a heuristic estimator — on average **~27.5% lower** than tiktoken on absolute counts (only **~31%** of samples within 20%). Reduction **percentages** track tiktoken within **~4 percentage points**. These are **not** provider billing numbers.

### What we haven't explored yet

- Live Cursor, Claude Code, or Codex sessions (hooks install config; end-to-end agent integration varies)
- Published npm install (`npx toknt`) — workflow ready, requires `NPM_TOKEN`

---

## 📦 Command chest (CLI)

```bash
toknt install              # Install integrations
toknt stats --json         # Token savings (estimated)
toknt benchmark --export result.json
toknt recall toknt://file/abc123
toknt doctor               # Health check
toknt explain              # Full overview
```

<details>
<summary><strong>⛏️ All commands</strong></summary>

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

## 🤝 Multiplayer — we need builders

Tokn't is **early and open source**. Best time to shape the world.

**[Good first issues →](https://github.com/shubhransh-gupta/toknt/labels/good%20first%20issue)**

| Biome | Starter quest |
|-------|---------------|
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

## 📢 Share the loot

If Tokn't saved you tokens, help other players find it:

[![Star on GitHub](https://img.shields.io/static/v1?label=Star&message=Tokn't&color=17DD62&logo=github&style=for-the-badge&labelColor=2a2a2a)](https://github.com/shubhransh-gupta/toknt)

**Copy-paste for Twitter/X:**
```
Your AI agent reads the same file 5 times and you're paying for every byte.

Tokn't smelts that — local-first, open source, works with Cursor/Claude/Codex.

Tokens? Tokn't. ⛏️

⭐ github.com/shubhransh-gupta/toknt
```

---

## 📚 Map & scrolls (docs)

| Scroll | Description |
|--------|-------------|
| **[Reduce token cost](docs/reduce-token-cost.md)** | **Setup, modes, daily usage** |
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

**Same agent. Same quest. Less context. More XP.**

*Tokens? Tokn't.* ⛏️💎🟩

</div>
