# Contributing to Tokn't

Thanks for your interest in contributing!

## Getting Started

```bash
git clone https://github.com/toknt/toknt.git
cd toknt
npm install
npm test
npm run build
```

## Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run typecheck: `npm run typecheck`
6. Commit with a clear message
7. Open a pull request

## Project Structure

- `packages/core` — Optimization engine (start here)
- `packages/cache` — Local cache
- `packages/optimizer` — Compression strategies
- `packages/tokenizer` — Token estimation
- `packages/benchmark` — Benchmark engine
- `packages/adapters` — Agent adapter interface
- `apps/cli` — CLI application
- `apps/observatory` — Visualization portal
- `integrations/` — Agent-specific adapters

## Code Style

- TypeScript strict mode
- ES modules
- Minimal dependencies
- Tests for all core functionality
- No placeholder/TODO implementations

## Testing

```bash
npm test              # All tests
npm test -- --watch   # Watch mode
```

Write tests for:
- Duplicate detection
- Cache invalidation
- Terminal compression
- Directory compression
- Safety validation
- Secret detection

## Pull Request Guidelines

- Keep PRs focused and small
- Include tests for new functionality
- Update documentation if needed
- Ensure CI passes

## Code of Conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
