# Benchmarking & session audits

## 2000-case accuracy harness

```bash
npm run audit:2000
```

Output: `benchmarks/results/accuracy-2000.json`

## Live session audit

Simulated batch (default 15 sessions):

```bash
npm run audit:live
npm run audit:live -- --mode balanced --sessions 20
```

### Real session JSON (#18)

Export or author a session file:

```json
{
  "id": "my-session",
  "label": "bug-fix",
  "steps": [
    { "type": "user_request", "content": "Fix the auth bug" },
    { "type": "file_read", "content": "...", "path": "Auth.ts" },
    { "type": "terminal_output", "content": "..." }
  ]
}
```

Run:

```bash
npm run audit:live -- --input benchmarks/samples/sample-session.json
npm run audit:live -- --input-dir benchmarks/samples/
```

Output: `benchmarks/results/live-session-audit.json`

Import that file in the [Observatory](https://shubhransh-gupta.github.io/toknt/) session audit section.

## CLI benchmark

```bash
npx toknt benchmark --mode balanced --export run.json
```
