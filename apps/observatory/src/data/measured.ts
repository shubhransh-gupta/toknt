export const MEASURED_AUDIT = {
  source: 'Local accuracy audit (Aug 2026)',
  method: 'tiktoken cl100k_base vs Tokn\'t engine',
  reportPath: 'benchmarks/results/accuracy-audit.json',
  runCommand: 'node scripts/accuracy-audit.mjs',
};

/** Verified with tiktoken (GPT-4 class tokenizer) */
export const MEASURED_BY_MODE = {
  safe: {
    label: 'safe (default)',
    description: 'Duplicate files & tool output only',
    tiktokenOriginal: 38216,
    tiktokenOptimized: 35741,
    reductionPercent: 6.5,
    recallIntegrity: true,
  },
  balanced: {
    label: 'balanced',
    description: 'Includes terminal & directory compression',
    tiktokenOriginal: 38216,
    tiktokenOptimized: 3236,
    reductionPercent: 91.5,
    recallIntegrity: true,
  },
};

/** Per-strategy, balanced mode, tiktoken-verified */
export const MEASURED_BY_STRATEGY = [
  { strategy: 'Duplicate file reads', reductionPercent: 64.3, recall: true },
  { strategy: 'Terminal output (1,200+ lines)', reductionPercent: 98.3, recall: true },
  { strategy: 'Directory listing (3,200 files)', reductionPercent: 99.8, recall: true },
  { strategy: 'Duplicate tool output', reductionPercent: 48.5, recall: true },
  { strategy: 'Critical content (errors, diffs)', reductionPercent: 0, recall: true },
];

export const MEASURED_ESTIMATOR = {
  reductionPercentAccuracy: 'Within ~2 percentage points of tiktoken',
  absoluteCountNote: 'Heuristic counts typically 20–28% lower than tiktoken — fine for relative savings, not billing',
  codeError: 25,
  terminalError: 28,
  directoryError: 20,
};

export const MEASURED_REAL_REPO = {
  description: 'Duplicate reads of real repo files (engine.ts, README, package.json ×2)',
  tiktokenOriginal: 8640,
  tiktokenOptimized: 4632,
  reductionPercent: 46.4,
};
