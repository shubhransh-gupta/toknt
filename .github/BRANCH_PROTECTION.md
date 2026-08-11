# Branch protection — `main`

The `main` branch is protected by a GitHub ruleset. Direct pushes are blocked; changes must go through a pull request with passing CI.

## Rules

| Rule | Setting |
|------|---------|
| **Target** | `main` (default branch) |
| **Direct pushes** | Blocked — use pull requests |
| **Force push** | Blocked |
| **Branch deletion** | Blocked |
| **Required CI checks** | `build-and-test (20)`, `build-and-test (22)` |
| **Strict status checks** | Branch must be up to date with `main` before merge |
| **Stale review dismissal** | Reviews dismissed when new commits are pushed |
| **Approving reviews** | 0 required (open-source friendly; CI is the gate) |
| **Conversation resolution** | Required before merge |

## For contributors

1. Fork the repo and create a feature branch from `main`
2. Open a pull request into `main`
3. Wait for CI (`build-and-test` on Node 20 and 22) to pass
4. Resolve any review threads, then merge (or wait for maintainer merge)

See [CONTRIBUTING.md](../CONTRIBUTING.md).

## For maintainers

Ruleset name: **Protect main**

To view or edit: **GitHub → Settings → Rules → Rulesets**

Repository admins can bypass rules when necessary (e.g. hotfixes). Prefer PRs for all normal changes.

## Apply / recreate ruleset

If the ruleset is missing, apply from repo root (requires `gh` auth):

```bash
gh api --method POST repos/shubhransh-gupta/toknt/rulesets --input .github/rulesets/protect-main.json
```

Config file: [.github/rulesets/protect-main.json](./rulesets/protect-main.json)
