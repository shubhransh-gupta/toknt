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
  duplicate_file: 'Repeated files',
  terminal_output: 'Terminal output',
  directory_listing: 'Directory listings',
  duplicate_tool_output: 'Duplicate output',
  stale_context: 'Stale context',
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
      <h3 className="section-title">Savings breakdown</h3>

      {Object.entries(breakdown).map(([key, pct]) => (
        <div
          key={key}
          style={{ marginBottom: 14, cursor: 'pointer' }}
          onClick={() => setActive(active === key ? null : key)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
            <span style={{ color: active === key ? 'var(--accent)' : 'var(--text-secondary)' }}>
              {LABELS[key] ?? key}
            </span>
            <span className="mono" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{
              width: `${pct}%`,
              background: active === key ? 'var(--blue)' : undefined,
            }} />
          </div>
          {active === key && (
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              marginTop: 8,
              padding: '8px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              {EXAMPLES[key]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
