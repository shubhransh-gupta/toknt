# Benchmarks

## Methodology

Tokn't benchmarks compare the **same task** with and without optimization:

```
WITHOUT TOKN'T  vs  WITH TOKN'T
(same agent, model, repository, task, configuration)
```

## Tasks

| ID | Task | Expected Behavior |
|---|---|---|
| `fix-authentication` | Find and fix auth bug | Auth tests pass |
| `add-api-endpoint` | Add API endpoint + tests | Endpoint works, tests pass |
| `fix-failing-tests` | Fix failing tests | All tests pass, behavior unchanged |
| `refactor-networking` | Refactor networking module | Tests pass, API unchanged |
| `offline-caching` | Implement offline caching | Cache works offline |
| `fix-production-crash` | Fix simulated crash | Crash resolved |

## Measured results

### 2,000-case accuracy harness

```bash
npm run audit:2000
# → benchmarks/results/accuracy-2000.json
```

| Metric | Result |
|--------|--------|
| Engine behavior | **2000/2000 (100%)** |
| Recall integrity | **100%** |
| Reduction % vs tiktoken | **~4pp avg delta** |
| Absolute token estimate error | **~27.5% avg** |

```bash
npm run audit
# → benchmarks/results/accuracy-audit.json
```

| Scenario | Mode | Tiktoken reduction |
|----------|------|-------------------|
| Mixed agent session | safe (default) | **6.5%** |
| Same session | balanced | **91.5%** |
| Real repo duplicate reads | safe | **46.4%** |

## Running Benchmarks

```bash
# All tasks
toknt benchmark

# Specific task
toknt benchmark --task fix-authentication

# Specific agent
toknt benchmark --agent cursor

# Export results
toknt benchmark --export results.json
```

## Metrics

| Metric | Description |
|---|---|
| Input tokens | Estimated original context tokens |
| Optimized tokens | Estimated after Tokn't |
| Tool calls | Number of tool invocations |
| Task success | Whether the task completed correctly |
| Efficiency score | Composite score (correctness-weighted) |

## Efficiency Score

```
Score = token_reduction × 0.4
      + correctness    × 0.3
      + tool_reduction × 0.15
      + time_ratio     × 0.1
      + safety         × 0.05
```

A 70% token reduction with a broken task scores terribly.

## Token Measurement

Token counts are **estimates** using heuristic character-based estimation (~3.5-4 chars per token). These are NOT exact provider billing data.

## Limitations

- Simulated benchmarks use heuristic token counts (not provider billing)
- Real agent benchmarks require installed agents
- Token estimates may differ from provider counts by 10-20%
- Aggressive mode may affect task quality

## Reproducibility

Each benchmark task has:
- Deterministic starting state
- Known expected behavior
- Automated pass/fail criteria

Results can be exported as JSON and imported into the Observatory portal.
