import { formatTokens } from '../data/demo';

interface DashboardProps {
  stats: ReturnType<typeof import('../data/demo').aggregateStats>;
}

export function Dashboard({ stats }: DashboardProps) {
  const items = [
    { label: 'TOKEN SAVINGS', value: `${stats.avgReduction.toFixed(1)}%`, bar: stats.avgReduction },
    { label: 'TOKENS SAVED', value: formatTokens(stats.totalSaved), bar: null },
    { label: 'TASK SUCCESS', value: `${stats.successRate.toFixed(1)}%`, bar: stats.successRate },
    { label: 'BENCHMARK RUNS', value: String(stats.runCount), bar: null },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
        Live Dashboard
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {items.map((item) => (
          <div key={item.label} className="card animate-in">
            <p style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: '0.08em', marginBottom: 8 }}>
              {item.label}
            </p>
            <p className="mono stat-value" style={{ fontSize: 28, fontWeight: 600, marginBottom: item.bar !== null ? 12 : 0 }}>
              {item.value}
            </p>
            {item.bar !== null && (
              <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(item.bar, 100)}%`,
                  background: 'var(--accent)',
                  borderRadius: 2,
                  transition: 'width 0.8s ease-out',
                }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
