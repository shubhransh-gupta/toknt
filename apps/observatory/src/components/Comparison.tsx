import { formatTokens, type BenchmarkResult } from '../data/demo';

interface ComparisonProps {
  result: BenchmarkResult;
  results: BenchmarkResult[];
  onSelect: (r: BenchmarkResult) => void;
}

export function Comparison({ result, results, onSelect }: ComparisonProps) {
  const rows = [
    { label: 'Input tokens', without: formatTokens(result.originalTokens), with: formatTokens(result.optimizedTokens) },
    { label: 'Tool calls', without: String(result.toolCalls), with: String(result.toolCallsOptimized) },
    { label: 'Context size', without: formatTokens(Math.round(result.originalTokens * 0.5)), with: formatTokens(Math.round(result.optimizedTokens * 0.5)) },
    { label: 'Task success', without: result.taskSuccess ? '✓' : '✗', with: result.taskSuccess ? '✓' : '✗' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Before vs After
        </h2>
        <select
          value={result.task}
          onChange={(e) => {
            const r = results.find((x) => x.task === e.target.value);
            if (r) onSelect(r);
          }}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '6px 12px',
            color: 'var(--text-primary)',
            fontSize: 13,
          }}
        >
          {results.map((r) => (
            <option key={r.task} value={r.task}>{r.taskName}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 120px',
          gap: 16,
          padding: '8px 0',
          borderBottom: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span />
          <span style={{ textAlign: 'right' }}>Without</span>
          <span style={{ textAlign: 'right', color: 'var(--accent)' }}>Tokn&apos;t</span>
        </div>

        {rows.map((row) => (
          <div key={row.label} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 120px',
            gap: 16,
            padding: '16px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
            <span className="mono" style={{ textAlign: 'right' }}>{row.without}</span>
            <span className="mono" style={{ textAlign: 'right', color: 'var(--accent)' }}>{row.with}</span>
          </div>
        ))}

        <div style={{ paddingTop: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-success">{result.reductionPercent.toFixed(1)}% reduction</span>
          {result.tokenMethod && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{result.tokenMethod}</span>
          )}
        </div>
      </div>
    </div>
  );
}
