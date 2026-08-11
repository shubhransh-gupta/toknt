export const ACCURACY_2000 = {
  totalCases: 2000,
  passed: 2000,
  accuracyPercent: 100,
  recallAccuracyPercent: 100,
  avgReductionDeltaPp: 3.99,
  avgEstimatorErrorPct: 27.5,
  estimatorWithin20Pct: 30.7,
  runCommand: 'node scripts/accuracy-2000.mjs',
  reportPath: 'benchmarks/results/accuracy-2000.json',
  byCategory: {
    duplicate_file: 100,
    terminal_output: 100,
    directory_listing: 100,
    duplicate_tool_output: 100,
    critical_passthrough: 100,
    secret_passthrough: 100,
    file_invalidation: 100,
    token_estimator: 100,
  },
};

export const ACCURACY_2000_CATEGORIES = [
  {
    id: 'duplicate_file',
    count: 350,
    pass: 350,
    label: 'Duplicate file reads',
    outcome: '2–3 reads of same path → compressed with recall',
  },
  {
    id: 'terminal_output',
    count: 350,
    pass: 350,
    label: 'Terminal output',
    outcome: 'Jest/Vitest/pytest/generic — compressed when mode thresholds met',
  },
  {
    id: 'directory_listing',
    count: 350,
    pass: 350,
    label: 'Directory listings',
    outcome: 'Large listings compressed in balanced/aggressive, not in safe',
  },
  {
    id: 'duplicate_tool_output',
    count: 200,
    pass: 200,
    label: 'Duplicate tool output',
    outcome: 'Identical grep/JSON results deduped with recall',
  },
  {
    id: 'critical_passthrough',
    count: 250,
    pass: 250,
    label: 'Critical content',
    outcome: 'User requests, diffs, errors, patches — never compressed',
  },
  {
    id: 'secret_passthrough',
    count: 150,
    pass: 150,
    label: 'Secret detection',
    outcome: 'API keys, tokens, passwords — never compressed',
  },
  {
    id: 'file_invalidation',
    count: 200,
    pass: 200,
    label: 'File change invalidation',
    outcome: 'Same file twice OK; changed content not treated as duplicate',
  },
  {
    id: 'token_estimator',
    count: 150,
    pass: 150,
    label: 'Token estimator',
    outcome: 'Heuristic counts within 50% of tiktoken on sample texts',
  },
] as const;

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
  reductionPercentAccuracy: 'Within ~4 percentage points of tiktoken (2000-case avg)',
  absoluteCountNote: 'Heuristic counts avg ~27.5% lower than tiktoken — fine for relative savings, not billing',
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
