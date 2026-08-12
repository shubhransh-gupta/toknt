import { formatTokens } from '../data/demo';

interface DashboardProps {
  stats: ReturnType<typeof import('../data/demo').aggregateStats>;
}

export function Dashboard({ stats }: DashboardProps) {
  const items = [
    { label: 'Token savings', value: `${stats.avgReduction.toFixed(1)}%`, bar: stats.avgReduction },
    { label: 'Tokens saved', value: formatTokens(stats.totalSaved), bar: null },
    { label: 'Task success', value: `${stats.successRate.toFixed(1)}%`, bar: stats.successRate },
    { label: 'Benchmark runs', value: String(stats.runCount), bar: null },
  ];

  return (
    <div>
      <h2 className="section-heading">Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Aggregate stats across benchmark runs</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {items.map((item) => (
          <div key={item.label} className="card animate-in">
            <p style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.04em', marginBottom: 10, textTransform: 'uppercase', fontWeight: 500 }}>
              {item.label}
            </p>
            <p className="mono stat-value" style={{ fontSize: 28, marginBottom: item.bar !== null ? 14 : 0 }}>
              {item.value}
            </p>
            {item.bar !== null && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(item.bar, 100)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
