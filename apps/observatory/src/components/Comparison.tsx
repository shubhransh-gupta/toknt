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
    { label: 'Quest success', without: result.taskSuccess ? '✓' : '✗', with: result.taskSuccess ? '✓' : '✗' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Before vs after — pick a quest</h2>
        <select
          value={result.task}
          onChange={(e) => {
            const r = results.find((x) => x.task === e.target.value);
            if (r) onSelect(r);
          }}
          style={{ width: 'auto', minWidth: 220 }}
        >
          {results.map((r) => (
            <option key={r.task} value={r.task}>{r.taskName}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <table className="mc-table">
          <thead>
            <tr>
              <th>Stat</th>
              <th style={{ textAlign: 'right' }}>Without</th>
              <th style={{ textAlign: 'right', color: 'var(--emerald)' }}>Tokn&apos;t</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td style={{ color: 'var(--text-secondary)' }}>{row.label}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{row.without}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--emerald)' }}>{row.with}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ paddingTop: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-success">{result.reductionPercent.toFixed(1)}% smelted</span>
          {result.tokenMethod && (
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{result.tokenMethod}</span>
          )}
        </div>
      </div>
    </div>
  );
}
