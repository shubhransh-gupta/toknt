import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatTokens, type BenchmarkResult } from '../data/demo';

interface Props {
  results: BenchmarkResult[];
}

export function TokenChart({ results }: Props) {
  const data = results.map((r) => ({
    name: r.taskName.split(' ').slice(0, 2).join(' '),
    without: r.originalTokens,
    withToknt: r.optimizedTokens,
  }));

  return (
    <div className="card">
      <h3 style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
        Token Comparison
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={4}>
          <XAxis dataKey="name" tick={{ fill: '#8888a0', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8888a0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatTokens(v)} />
          <Tooltip
            contentStyle={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e8e8ed' }}
            formatter={(value: number) => [formatTokens(value), '']}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#8888a0' }} />
          <Bar dataKey="without" fill="#3a3a5a" name="Without" radius={[4, 4, 0, 0]} />
          <Bar dataKey="withToknt" fill="#00ff88" name="Tokn't" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
