import { formatTokens } from '../data/demo';

interface DashboardProps {
  stats: ReturnType<typeof import('../data/demo').aggregateStats>;
}

export function Dashboard({ stats }: DashboardProps) {
  const items = [
    { label: 'Token savings', icon: '💎', value: `${stats.avgReduction.toFixed(1)}%`, bar: stats.avgReduction },
    { label: 'Tokens saved', icon: '⛏️', value: formatTokens(stats.totalSaved), bar: null },
    { label: 'Quest success', icon: '✓', value: `${stats.successRate.toFixed(1)}%`, bar: stats.successRate },
    { label: 'Benchmark runs', icon: '📊', value: String(stats.runCount), bar: null },
  ];

  return (
    <div>
      <h2 className="section-title">Survival stats dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {items.map((item) => (
          <div key={item.label} className="card animate-in">
            <p style={{ color: 'var(--gold)', fontSize: 20, marginBottom: 4 }}>{item.icon}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>
              {item.label}
            </p>
            <p className="mono stat-value" style={{ fontSize: 32, fontWeight: 600, marginBottom: item.bar !== null ? 12 : 0 }}>
              {item.value}
            </p>
            {item.bar !== null && (
              <div className="mc-progress">
                <div className="mc-progress-fill" style={{ width: `${Math.min(item.bar, 100)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
