# Getting Started

## Install

```bash
npm install -g toknt
# or
npx toknt install
```

## First Run

```bash
toknt install        # Detect and configure agents
toknt status         # Verify installation
toknt doctor         # Health check
```

## Usage

Tokn't works silently once installed. Your agent continues working normally, but redundant context is optimized automatically.

To see savings:

```bash
toknt stats
```

To recall compressed content:

```bash
toknt recall toknt://file/abc123
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
