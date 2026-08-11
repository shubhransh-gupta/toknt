# Privacy Policy

## Summary

Tokn't is **local-first**. Your code, prompts, and tool output never leave your machine.

## What Tokn't Stores Locally

- Cached file content (for deduplication and recall)
- Compressed terminal output (for recall)
- Directory indexes (for search)
- Configuration preferences
- Benchmark results (if you run benchmarks)

All stored at `~/.toknt/` on your local filesystem.

## What Tokn't Does NOT Do

- Upload source code
- Upload prompts or conversations
- Upload tool output
- Store API keys or credentials
- Send telemetry or analytics
- Connect to Tokn't servers
- Use remote databases

## Secret Handling

Tokn't detects potential secrets (API keys, tokens, passwords) and:
1. Never compresses content containing secrets
2. Redacts secrets if they appear in cached content

## Data Deletion

```bash
toknt cache clear    # Clear all cached data
toknt uninstall      # Remove integrations (cache preserved)
```

To fully remove all Tokn't data, delete `~/.toknt/`.

## Observatory Portal

The Tokn't Observatory runs entirely in your browser:
- Demo data is bundled locally
- Benchmark JSON import is processed client-side
- No server-side processing
- Deployable to GitHub Pages with no backend

## Third-Party Agents

Tokn't integrates with Claude Code, Cursor, and Codex. Each agent's own privacy policy applies to data those agents send to their respective model providers. Tokn't only optimizes the context before it reaches the agent's normal flow.

## Changes

This policy may be updated. Changes will be noted in CHANGELOG.md.
