import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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

export function QualityChart({ results }: Props) {
  const data = results.map((r) => ({
    tokens: r.optimizedTokens,
    success: r.taskSuccess ? 100 : 20,
    name: r.taskName,
  }));

  return (
    <div className="card">
      <h3 className="section-title" style={{ marginBottom: 8 }}>Quality vs tokens — XP scatter</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 20 }}>
        Min tokens while keeping the quest complete — like efficiency III on your pickaxe.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis
            type="number"
            dataKey="tokens"
            name="Tokens"
            tick={{ fill: '#e0e0e8', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatTokens(v)}
            label={{ value: 'Tokens', position: 'bottom', fill: '#9a9a9a', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="success"
            name="Success %"
            domain={[0, 105]}
            tick={{ fill: '#e0e0e8', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Quest Success %', angle: -90, position: 'insideLeft', fill: '#9a9a9a', fontSize: 12 }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <ReferenceLine y={95} stroke="#555" strokeDasharray="4 4" />
          <Scatter data={data} fill="#4ee4ef" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
