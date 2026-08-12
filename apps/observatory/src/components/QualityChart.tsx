import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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

export function QualityChart({ results }: Props) {
  const data = results.map((r) => ({
    tokens: r.optimizedTokens,
    success: r.taskSuccess ? 100 : 20,
    name: r.taskName,
  }));

  return (
    <div className="card">
      <h3 className="section-heading">Quality vs tokens</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Token count vs task success rate across benchmark runs
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis
            type="number"
            dataKey="tokens"
            name="Tokens"
            tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatTokens(v)}
            label={{ value: 'Tokens', position: 'bottom', fill: '#71717a', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="success"
            name="Success %"
            domain={[0, 105]}
            tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Success %', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 12 }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <ReferenceLine y={95} stroke="#3f3f46" strokeDasharray="4 4" />
          <Scatter data={data} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
