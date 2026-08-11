---
name: toknt-optimize
description: Tokn't token optimization — recall compressed content and view stats
---

# Tokn't Optimization

When you see compressed content with a `toknt://` reference, you can recall the full content.

## Recall compressed content

If output contains `Reference: toknt://file/abc123`, run:

```bash
toknt recall toknt://file/abc123
```

## View savings

```bash
toknt stats
toknt stats --json
```

## Check status

```bash
toknt status
toknt doctor
```
