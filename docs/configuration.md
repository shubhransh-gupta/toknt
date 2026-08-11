# Configuration

## Config File

Location: `~/.toknt/config.json`

```json
{
  "mode": "safe",
  "cacheDir": "~/.toknt",
  "maxCacheSizeMB": 500,
  "integrations": {
    "claude": true,
    "cursor": true,
    "codex": false
  }
}
```

## Optimization Modes

### safe (default)

Only deterministic optimizations:
- Duplicate file detection
- Duplicate tool output
- Content hashing
- Exact caching

### balanced

Adds:
- Terminal output summaries
- Directory summaries
- Safe stale-context handling

### aggressive

Adds:
- Heuristic context pruning
- More aggressive summarization

⚠️ Aggressive optimization may affect task quality.

## Cache

```bash
toknt cache           # View cache info
toknt cache clear     # Clear all cached data
```

Cache location: `~/.toknt/`

## Environment Variables

No environment variables required. Tokn't works entirely from local config.
