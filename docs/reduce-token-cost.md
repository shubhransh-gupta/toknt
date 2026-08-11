# Configure Tokn't to Reduce Token Cost

Tokn't sits between your coding agent and the model. It compresses **redundant** context (duplicate files, huge test logs, directory listings) before it reaches the model — so you pay for less input on every turn.

Everything runs **locally** (`~/.toknt/`). Nothing is uploaded.

---

## Step 1 — Install Tokn't

**From source (recommended today):**

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt
npm install && npm run build
```

**After npm publish:**

```bash
npx toknt install
```

---

## Step 2 — Connect your agent

Install hooks for the agent you use:

```bash
# Auto-detect all installed agents
npx toknt install

# Or pick one
npx toknt install cursor
npx toknt install claude
npx toknt install codex
npx toknt install windsurf
```

This writes config under each agent, e.g. `~/.cursor/toknt/toknt.json`, and creates `~/.toknt/config.json`.

**Verify:**

```bash
npx toknt status    # mode, cache, integrations
npx toknt doctor    # health check
```

---

## Step 3 — (Cursor only) Enable the plugin

For full Cursor hook support, copy the bundled plugin:

```bash
cp -r plugins/cursor ~/.cursor/plugins/toknt
# Restart Cursor
```

See [cursor.md](./cursor.md) for details.

---

## Step 4 — Pick an optimization mode

Edit **`~/.toknt/config.json`**:

```json
{
  "mode": "balanced",
  "integrations": {
    "cursor": true,
    "claude": true
  }
}
```

| Mode | What it compresses | When to use | Measured savings* |
|------|-------------------|-------------|-------------------|
| **`safe`** (default) | Duplicate files & identical tool output only | Production work, minimal risk | **~6.5%** on mixed sessions; **~46%** when agent re-reads the same files |
| **`balanced`** | + terminal output summaries, large directory listings | Heavy `npm test`, `pytest`, `find .`, long logs | **~91.5%** on sessions with large terminal/directory output |
| **`aggressive`** | + heuristic stale-context pruning | Experiments only — may affect quality | Higher reduction, not fully benchmarked |

\*Measured locally with tiktoken. Your savings depend on what your agent actually sends. See [benchmarks/results/accuracy-audit.json](../benchmarks/results/accuracy-audit.json).

**Rule of thumb:**

- Agent mostly **re-reads files** → start with `safe`
- Agent dumps **big test output or file trees** → use `balanced`
- Not sure → start `safe`, switch to `balanced` if `toknt stats` shows low savings

---

## Step 5 — Use your agent normally

No workflow change. Open Cursor, Claude Code, or Codex and code as usual.

Tokn't runs on each tool result:

1. **Classify** — file read, terminal output, directory listing, etc.
2. **Safety check** — never compress user requests, git diffs, errors, secrets
3. **Compress** — replace duplicates / summarize huge output
4. **Cache** — store full original at `~/.toknt/` with a recall URI

The model sees shorter context → **lower input token cost**.

---

## Step 6 — Measure your savings

```bash
# After a coding session
npx toknt stats

# JSON for dashboards / Observatory import
npx toknt stats --json

# Before/after on a sample task
npx toknt benchmark --task fix-authentication --mode balanced
npx toknt benchmark --export my-run.json
```

Open the [Observatory](https://shubhransh-gupta.github.io/toknt/) and upload `my-run.json` to visualize savings.

---

## Step 7 — Recall full content when needed

Compressed items are replaced with a short summary + recall link. To restore the original locally:

```bash
npx toknt recall toknt://file/abc123
npx toknt recall toknt://output/def456
```

In Cursor, the `toknt-optimize` skill helps the agent request recall when it needs full detail.

---

## Tips to maximize token savings

| Situation | What Tokn't does | Your action |
|-----------|------------------|-------------|
| Same file read 3–5× in one session | Dedupes to hash + recall URI | Use `balanced` or `safe` — both handle this |
| `npm test` prints thousands of lines | Keeps failures + summary | Set `"mode": "balanced"` |
| `find .` or huge directory listings | Tree summary + local index | Set `"mode": "balanced"` |
| Identical grep/search repeated | Content-hash cache | Works in all modes |
| Worried about losing error context | Safety layer passes errors through | Stay on `safe` or `balanced` |

**Do not use token counts from `toknt stats` for billing** — they are estimates (~27% below tiktoken on average). Use them for **relative** savings and trends.

---

## Example config for cost-focused setup

```json
{
  "mode": "balanced",
  "maxCacheSizeMB": 500,
  "integrations": {
    "cursor": true,
    "claude": false,
    "codex": false
  }
}
```

Restart your agent after changing mode so hooks reload config.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `toknt status` shows agent not active | Run `npx toknt install cursor` (or your agent) again |
| Savings near 0% | Session may have no duplicates/large output — try `balanced` or a longer session |
| Need full file content back | `npx toknt recall <uri>` |
| Reset everything | `npx toknt cache clear` and reinstall |

More: [troubleshooting.md](./troubleshooting.md) · [configuration.md](./configuration.md)

---

## Quick reference

```bash
npx toknt install          # Setup
npx toknt status           # Check mode & integrations
npx toknt stats            # See savings
npx toknt benchmark        # Before/after test
npx toknt recall <uri>     # Restore compressed content
npx toknt doctor           # Diagnose issues
npx toknt explain          # How it works
```
