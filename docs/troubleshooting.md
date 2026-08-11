# Troubleshooting

## Common Issues

### Agent not detected

```bash
toknt doctor
```

Ensure the agent is installed and its config directory exists:
- Claude: `~/.claude/`
- Cursor: `~/.cursor/`
- Codex: `~/.codex/`

### Tokn't not optimizing

1. Check mode: `toknt status` — safe mode only deduplicates
2. Switch to balanced: edit `~/.toknt/config.json`, set `"mode": "balanced"`
3. Reinstall: `toknt uninstall && toknt install`

### Cache issues

```bash
toknt cache clear
toknt doctor
```

### Recall not working

Verify URI format: `toknt://file/abc123`

List cache: `toknt cache`

### Node.js version

Tokn't requires Node.js >= 20:

```bash
node --version
```

## Getting Help

- Run `toknt explain` for overview
- Run `toknt doctor` for diagnostics
- Open an issue on GitHub
