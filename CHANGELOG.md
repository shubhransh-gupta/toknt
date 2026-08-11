# Changelog

All notable changes to Tokn't will be documented in this file.

## [1.0.0] - 2026-01-15

### Added

- Core optimization engine with classifier, safety validator, and metrics
- Local content-addressed cache at `~/.toknt/`
- Duplicate file read detection with hash-based invalidation
- Terminal output compression with test result summarization
- Directory listing compression with tree summaries
- Duplicate tool output detection
- Recall system with `toknt://` URIs
- Three optimization modes: safe, balanced, aggressive
- Token estimation engine (heuristic, labeled as estimates)
- CLI with install, status, stats, benchmark, cache, doctor, recall commands
- Agent adapters for Claude Code, Cursor, and Codex
- Cursor plugin with hooks, skills, and rules
- Benchmark engine with 6 deterministic tasks
- Efficiency score (correctness-weighted)
- Tokn't Observatory portal with charts, cost estimator, share cards
- Benchmark JSON import/export
- Secret detection and redaction
- GitHub Actions CI/CD
- Comprehensive documentation

### Security

- Secret detection prevents compression of sensitive content
- Local-first architecture — no data leaves the machine
