# Getting Started

## Install

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt && npm install && npm run build
npx toknt install
```

Or after npm publish:

```bash
npx toknt install
```

## First Run

```bash
npx toknt install        # Detect and configure agents
npx toknt status         # Verify installation
npx toknt doctor         # Health check
```

## Reduce token cost (full guide)

**→ [Configure & use Tokn't to cut token cost](./reduce-token-cost.md)** — step-by-step setup, mode selection, and daily usage.

Quick version:

1. `npx toknt install cursor` (or `claude`, `codex`)
2. Set `"mode": "balanced"` in `~/.toknt/config.json` for max savings on large logs
3. Code normally — check savings with `npx toknt stats`

## Usage

Tokn't works silently once installed. Your agent continues working normally, but redundant context is optimized automatically.

To see savings:

```bash
npx toknt stats
npx toknt stats --json
```

To recall compressed content:

```bash
npx toknt recall toknt://file/abc123
```

## Configuration

Config stored at `~/.toknt/config.json`:

```json
{
  "mode": "safe",
  "integrations": {
    "cursor": true,
    "claude": true
  }
}
```

Modes: `safe` (default), `balanced`, `aggressive`

See [configuration.md](./configuration.md) and [reduce-token-cost.md](./reduce-token-cost.md).
