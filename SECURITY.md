# Security Policy

## Threat Model

Tokn't operates locally on the developer's machine. The primary threats are:

1. **Secret leakage** — API keys or credentials in cached content
2. **Cache poisoning** — Malicious content stored in local cache
3. **Agent manipulation** — Compressed content causing agent errors

## Mitigations

### Secret Detection

Tokn't detects and redacts:
- API keys (`sk-`, `ghp_`, `AKIA`, etc.)
- Bearer tokens
- Private keys (PEM format)
- Passwords and secrets in config files
- Cloud credentials

Content containing detected secrets is **never compressed**.

### Local Storage

- All data stored at `~/.toknt/` on the local filesystem
- No network requests to Tokn't servers
- No source code uploads
- Cache can be cleared with `toknt cache clear`

### Safety Classification

Critical context (user requests, git diffs, errors) is never compressed. When uncertain, original content passes through.

## Data Flow

```
Agent Tool Output → Tokn't (local) → Classifier → Safety Check → Cache (local) → Agent
```

No data leaves the machine at any point.

## Responsible Disclosure

If you discover a security vulnerability, please report it by opening a GitHub issue with the `security` label, or email security@toknt.dev.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to respond within 48 hours.

## Local Storage Policy

| Data | Stored | Encrypted | Uploaded |
|---|---|---|---|
| File content | ~/.toknt/cache/ | No | Never |
| Terminal output | ~/.toknt/outputs/ | No | Never |
| Directory indexes | ~/.toknt/indexes/ | No | Never |
| Configuration | ~/.toknt/config.json | No | Never |
| Benchmark results | ~/.toknt/benchmarks/ | No | Never |

Users can delete all stored data with `toknt cache clear`.
