import { useState, useMemo } from 'react';
import type { BenchmarkResult } from '../data/demo';

interface Props {
  result: BenchmarkResult;
}

export function CostEstimator({ result }: Props) {
  const [inputPrice, setInputPrice] = useState(3.0);
  const [cachedPrice, setCachedPrice] = useState(0.3);
  const [outputPrice, setOutputPrice] = useState(15.0);

  const costs = useMemo(() => {
    const withoutCost = (result.originalTokens / 1_000_000) * inputPrice;
    const withCost = (result.optimizedTokens / 1_000_000) * inputPrice;
    return { without: withoutCost, with: withCost, saved: withoutCost - withCost };
  }, [result, inputPrice]);

  return (
    <div className="card">
      <h3 style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
        Cost Estimator
      </h3>

      <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Input price / 1M tokens
          <input type="number" step="0.1" value={inputPrice} onChange={(e) => setInputPrice(+e.target.value)} style={{ marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Cached input price / 1M
          <input type="number" step="0.1" value={cachedPrice} onChange={(e) => setCachedPrice(+e.target.value)} style={{ marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Output price / 1M
          <input type="number" step="0.1" value={outputPrice} onChange={(e) => setOutputPrice(+e.target.value)} style={{ marginTop: 4 }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>WITHOUT TOKN&apos;T</p>
          <p className="mono" style={{ fontSize: 20 }}>${costs.without.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>WITH TOKN&apos;T</p>
          <p className="mono" style={{ fontSize: 20, color: 'var(--accent)' }}>${costs.with.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>ESTIMATED SAVINGS</p>
          <p className="mono" style={{ fontSize: 20, color: 'var(--accent)' }}>${costs.saved.toFixed(2)}</p>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
        ESTIMATED COST — not actual provider billing
      </p>
    </div>
  );
}
