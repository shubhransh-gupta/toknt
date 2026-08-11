# Contributing to Tokn't

Thanks for helping make AI coding agents less wasteful. **Small PRs welcome. No need to ask permission on [good first issues](https://github.com/shubhransh-gupta/toknt/labels/good%20first%20issue).**

## Quick start

```bash
git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt
npm install
npm test
npm run build
```

## Pick something to work on

| Difficulty | Task | Package |
|------------|------|---------|
| 🟢 Easy | Add Jest test output parser | `packages/optimizer` |
| 🟢 Easy | Add pytest output parser | `packages/optimizer` |
| 🟢 Easy | Improve README / docs | `docs/` |
| 🟡 Medium | File watcher cache invalidation | `packages/core` |
| 🟡 Medium | Observatory dark mode polish | `apps/observatory` |
| 🟡 Medium | Windsurf / Cline adapter | `integrations/` |
| 🔴 Hard | Real Cursor hook integration test | `integrations/cursor` |

Full list: [ROADMAP.md](./ROADMAP.md) · [open issues](https://github.com/shubhransh-gupta/toknt/issues)

## Development workflow

1. Fork → branch → change → test
2. `npm test && npm run build` must pass
3. Open PR (template auto-fills)
4. We review quickly — this project is early, your PR matters

## Project structure

- `packages/core` — Optimization engine **← start here**
- `packages/cache` — Local cache
- `packages/optimizer` — Compression strategies
- `packages/tokenizer` — Token estimation
- `packages/benchmark` — Benchmark engine
- `packages/adapters` — Agent adapter interface
- `apps/cli` — CLI application
- `apps/observatory` — Visualization portal
- `integrations/` — Agent-specific adapters

## Code style

- TypeScript strict mode
- ES modules
- Minimal dependencies
- Tests for all core behavior
- No placeholder/TODO implementations

## Testing

```bash
npm test              # All tests
npm test -- --watch   # Watch mode
```

## PR guidelines

- One concern per PR
- Include tests for behavior changes
- Update docs when user-facing behavior changes
- CI must pass

## Community

- [Discussions](https://github.com/shubhransh-gupta/toknt/discussions) — questions & ideas
- [LAUNCH.md](./LAUNCH.md) — help spread the word
- [Code of Conduct](./CODE_OF_CONDUCT.md)
