import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatTokens, type BenchmarkResult } from '../data/demo';

interface Props {
  results: BenchmarkResult[];
}

const TOOLTIP_STYLE = {
  background: '#18181b',
  border: '1px solid #27272a',
  borderRadius: 8,
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  color: '#fafafa',
};

export function TokenChart({ results }: Props) {
  const data = results.map((r) => ({
    name: r.taskName.split(' ').slice(0, 2).join(' '),
    without: r.originalTokens,
    withToknt: r.optimizedTokens,
  }));

  return (
    <div className="card">
      <h3 className="section-title">Token usage by task</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={4}>
          <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatTokens(v)} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: '#a1a1aa' }}
            formatter={(value: number) => [formatTokens(value), '']}
          />
          <Legend wrapperStyle={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'Inter' }} />
          <Bar dataKey="without" fill="#52525b" name="Without" radius={[4, 4, 0, 0]} />
          <Bar dataKey="withToknt" fill="#22c55e" name="With Tokn't" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
