import { useState } from 'react';
import type { BenchmarkResult } from '../data/demo';

const DEFAULT_BREAKDOWN: Record<string, number> = {
  duplicate_file: 41,
  terminal_output: 27,
  directory_listing: 14,
  duplicate_tool_output: 11,
  stale_context: 7,
};

const LABELS: Record<string, string> = {
  duplicate_file: '📜 Repeated files',
  terminal_output: '🔥 Terminal output',
  directory_listing: '🗺️ Directory listings',
  duplicate_tool_output: '🔁 Duplicate output',
  stale_context: '🕸️ Stale context',
};

const EXAMPLES: Record<string, string> = {
  duplicate_file: 'UserService.swift read 5 times → compressed to hash reference',
  terminal_output: '12,842 line test output → 7 failures + summary',
  directory_listing: '47,281 files → tree with top-level counts',
  duplicate_tool_output: 'Identical grep results → hash reference',
  stale_context: 'Old exploration context → pruned in aggressive mode',
};

interface Props {
  result: BenchmarkResult;
}

export function SavingsBreakdown({ result }: Props) {
  const breakdown = result.savingsBreakdown ?? DEFAULT_BREAKDOWN;
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="card">
      <h3 className="section-title" style={{ marginBottom: 20 }}>Loot breakdown</h3>

      {Object.entries(breakdown).map(([key, pct]) => (
        <div
          key={key}
          style={{ marginBottom: 12, cursor: 'pointer' }}
          onClick={() => setActive(active === key ? null : key)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 16 }}>
            <span style={{ color: active === key ? 'var(--emerald)' : 'var(--text-secondary)' }}>
              {LABELS[key] ?? key}
            </span>
            <span className="mono">{pct}%</span>
          </div>
          <div className="mc-progress" style={{ height: 10 }}>
            <div className="mc-progress-fill" style={{
              width: `${pct}%`,
              background: active === key
                ? 'repeating-linear-gradient(90deg, var(--gold) 0, var(--gold) 8px, #c9a800 8px, #c9a800 16px)'
                : undefined,
            }} />
          </div>
          {active === key && (
            <p style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              marginTop: 6,
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.35)',
              border: '2px solid var(--inventory-border)',
            }}>
              {EXAMPLES[key]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
