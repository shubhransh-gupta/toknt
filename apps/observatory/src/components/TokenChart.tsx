import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatTokens, type BenchmarkResult } from '../data/demo';

interface Props {
  results: BenchmarkResult[];
}

const TOOLTIP_STYLE = {
  background: 'rgba(44, 44, 48, 0.98)',
  border: '3px solid #373737',
  borderRadius: 0,
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
};

export function TokenChart({ results }: Props) {
  const data = results.map((r) => ({
    name: r.taskName.split(' ').slice(0, 2).join(' '),
    without: r.originalTokens,
    withToknt: r.optimizedTokens,
  }));

  return (
    <div className="card">
      <h3 className="section-title" style={{ marginBottom: 20 }}>Token ore chart</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={4}>
          <XAxis dataKey="name" tick={{ fill: '#e0e0e8', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#e0e0e8', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatTokens(v)} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: '#ffd700' }}
            formatter={(value: number) => [formatTokens(value), '']}
          />
          <Legend wrapperStyle={{ fontSize: 13, color: '#e0e0e8', fontFamily: 'Inter' }} />
          <Bar dataKey="without" fill="#7f7f7f" name="Raw ore" radius={0} />
          <Bar dataKey="withToknt" fill="#17dd62" name="Refined" radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
