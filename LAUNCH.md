# Launch Playbook

Copy-paste these to spread Tokn't. **Personalize the first line** — generic posts get ignored.

Repo: **https://github.com/shubhransh-gupta/toknt**  
Demo: **https://shubhransh-gupta.github.io/toknt/**

---

## Twitter / X (thread)

**Tweet 1 (hook)**
```
Your AI coding agent reads UserService.swift five times per session.

You're paying for every byte. Every. Time.

I built Tokn't — a local-first layer that deduplicates, compresses, and caches agent context before it hits the model.

Tokens? Tokn't.

⭐ github.com/shubhransh-gupta/toknt
```

**Tweet 2 (proof)**
```
Same task. Same agent. Same model.

WITHOUT Tokn't: ~184K tokens
WITH Tokn't:    ~112K tokens

↓ 39% reduction, task still passes.

Not a counter. An actual optimization layer.

Demo: shubhransh-gupta.github.io/toknt
Measured: 2000/2000 engine tests pass · see README
```

**Tweet 3 (CTA)**
```
Works with:
• Cursor
• Claude Code  
• Codex

🔒 Local-first — code never leaves your machine
MIT licensed — PRs welcome

If you're building with AI agents, star it so others find it too.
```

---

## Hacker News (Show HN)

**Title:** `Show HN: Tokn't – local-first token optimization for AI coding agents`

**Body:**
```
Hi HN,

AI coding agents (Cursor, Claude Code, Codex) repeatedly send the same file contents, terminal output, and directory listings to the model. You're billed for all of it.

Tokn't sits between the agent and the model and actually reduces redundant context:
- Duplicate file reads → hash reference + local recall
- 12K-line test output → failure summary + stored full output
- 40K-file directory listings → tree summary

It's local-first (nothing uploaded), deterministic (no extra LLM API key), and safety-first (never compresses diffs, errors, or secrets).

Benchmark demo: https://shubhransh-gupta.github.io/toknt/
Repo: https://github.com/shubhransh-gupta/toknt

Would love feedback on the architecture and benchmark methodology. Contributors welcome — good first issues labeled.
```

---

## Reddit

**r/programming / r/LocalLLaMA / r/cursor**

**Title:** `[OSS] Tokn't – stop paying your AI agent to reread the same files`

**Body:**
```
Built an open-source optimization layer for AI coding agents.

The problem: agents reread files, repeat terminal output, and rediscover your repo on every turn. Token counters tell you about the waste. Tokn't actually reduces what reaches the model.

Features:
- Duplicate file/tool output dedup (content hashing)
- Terminal output compression (test summaries)
- Directory listing compression
- Local cache with recall (toknt:// URIs)
- Works with Cursor, Claude Code, Codex
- 100% local — no code leaves your machine

Try the live demo: https://shubhransh-gupta.github.io/toknt/
GitHub: https://github.com/shubhransh-gupta/toknt

Looking for contributors — especially test output parsers (Jest, pytest) and new agent adapters.
```

---

## Dev.to / Hashnode article outline

**Title:** *Your AI Agent Doesn't Need to See Everything Twice*

1. The hidden cost of agent redundancy (with real examples)
2. Why token counters aren't enough
3. How Tokn't works (observe → classify → compress → cache → recall)
4. Before/after benchmark walkthrough
5. Safety model (what never gets compressed)
6. Try it in 60 seconds
7. Call for contributors

---

## LinkedIn

```
Shipping something I've wanted for months.

AI coding agents are incredible — but they're wasteful. Same file read 5×. Full test logs in context. 40,000 filenames from find .

Tokn't is a local-first optimization layer for Cursor, Claude Code, and Codex. It actually reduces redundant context before it hits the model.

Open source. MIT. No data leaves your machine.

If you work with AI coding tools, I'd appreciate a star or a share:
https://github.com/shubhransh-gupta/toknt

Contributors welcome — link in repo.
```

---

## Discord / Slack communities

Post in: Cursor Discord, Claude developers, AI eng Slack groups, local LLM communities.

```
🚀 New OSS tool: Tokn't

Cuts redundant agent context (duplicate file reads, huge terminal output, directory spam).

Local-first · Cursor/Claude/Codex · MIT

Demo: shubhransh-gupta.github.io/toknt
Repo: github.com/shubhransh-gupta/toknt

Stars help visibility — PRs help everyone.
```

---

## Product Hunt (when ready)

**Tagline:** Cut the token waste. Keep the intelligence.  
**Description:** Local-first performance layer for AI coding agents.  
**First comment:** Link to Observatory demo + ask for feedback on benchmark methodology.

---

## Checklist before posting

- [ ] Observatory deployed to GitHub Pages
- [ ] README links work
- [ ] `good first issue` labels created on GitHub
- [ ] Reply to every comment/issue within 24h (critical for early traction)
- [ ] Quote-tweet / engage people who share it
