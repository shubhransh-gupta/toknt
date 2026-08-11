import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatTokens, type BenchmarkResult } from '../data/demo';

interface Props {
  results: BenchmarkResult[];
}

export function QualityChart({ results }: Props) {
  const data = results.map((r) => ({
    tokens: r.optimizedTokens,
    success: r.taskSuccess ? 100 : 20,
    name: r.taskName,
  }));

  return (
    <div className="card">
      <h3 style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        Quality vs Tokens
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
        The goal isn&apos;t minimum tokens. The goal is minimum tokens while keeping the task correct.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis
            type="number"
            dataKey="tokens"
            name="Tokens"
            tick={{ fill: '#8888a0', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatTokens(v)}
            label={{ value: 'Tokens', position: 'bottom', fill: '#55556a', fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="success"
            name="Success %"
            domain={[0, 105]}
            tick={{ fill: '#8888a0', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Task Success %', angle: -90, position: 'insideLeft', fill: '#55556a', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 8, fontSize: 12 }}
          />
          <ReferenceLine y={95} stroke="#2a2a3a" strokeDasharray="4 4" />
          <Scatter data={data} fill="#00ff88" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
