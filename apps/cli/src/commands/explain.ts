import { printBanner } from '../utils.js';

export async function explainCommand(): Promise<void> {
  printBanner();
  console.log(`How Tokn't Works

Tokn't sits between your AI coding agent and the model,
optimizing redundant context before it reaches the model.

Core Loop:
  OBSERVE → DETECT REDUNDANCY → COMPRESS SAFELY → CACHE ORIGINAL
  → PROVIDE RECALL → MEASURE SAVINGS → VERIFY CORRECTNESS

Optimizations:
  • Duplicate file reads — hash-based deduplication
  • Terminal output compression — summarize test results
  • Directory listing compression — tree summaries
  • Duplicate tool output — content-hash caching

Safety:
  Never compresses user requests, git diffs, compiler errors,
  failing test details, or anything when uncertain.

Recall:
  Compressed content stored locally at ~/.toknt/
  Retrieve with: toknt recall toknt://file/abc123

Modes:
  safe       — duplicate detection only (default)
  balanced   — + terminal/directory compression
  aggressive — + heuristic pruning (may affect quality)

Privacy:
  🔒 Local-first. Your code never leaves your machine.
`);
}
