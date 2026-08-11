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

| Difficulty | Task | Issue |
|------------|------|-------|
| 🟢 Easy | Add Go test output parser | [#12](https://github.com/shubhransh-gupta/toknt/issues/12) |
| 🟢 Easy | Add Rust cargo test parser | [#13](https://github.com/shubhransh-gupta/toknt/issues/13) |
| 🟢 Easy | Add Java/Maven test parser | [#14](https://github.com/shubhransh-gupta/toknt/issues/14) |
| 🟡 Medium | MCP server (recall + stats) | [#15](https://github.com/shubhransh-gupta/toknt/issues/15) |
| 🟡 Medium | VS Code extension | [#16](https://github.com/shubhransh-gupta/toknt/issues/16) |
| 🟡 Medium | Observatory session import | [#17](https://github.com/shubhransh-gupta/toknt/issues/17) |
| 🔴 Hard | Real agent session benchmarks | [#18](https://github.com/shubhransh-gupta/toknt/issues/18) |

Full list: [ROADMAP.md](./ROADMAP.md) · [open issues](https://github.com/shubhransh-gupta/toknt/issues)

## Development workflow

1. Fork → branch → change → test
2. `npm test && npm run build` must pass
3. Open PR into `main` (template auto-fills) — **direct pushes to `main` are blocked**
4. CI must pass: `build-and-test (20)` and `build-and-test (22)`
5. We review quickly — this project is early, your PR matters

Branch protection details: [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md)

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

## npm publish

Add `NPM_TOKEN` to GitHub repo secrets, then create a release or run the **Release to npm** workflow.

```bash
npm login
bash scripts/publish.sh
```

Install globally after publish: `npx toknt install`


- [Discussions](https://github.com/shubhransh-gupta/toknt/discussions) — questions & ideas
- [LAUNCH.md](./LAUNCH.md) — help spread the word
- [Code of Conduct](./CODE_OF_CONDUCT.md)
