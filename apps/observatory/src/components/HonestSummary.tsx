import {
  ACCURACY_2000,
  ACCURACY_2000_CATEGORIES,
  MEASURED_BY_MODE,
  MEASURED_BY_STRATEGY,
  MEASURED_ESTIMATOR,
  MEASURED_REAL_REPO,
} from '../data/measured';

export function HonestSummary() {
  return (
    <section id="honest-summary" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
      <div className="card card-emerald">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <h2 className="pixel-title" style={{ fontSize: 16, margin: 0, color: 'var(--gold)' }}>Achievement log</h2>
          <span className="badge badge-success">✓ MEASURED</span>
          <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>
            {ACCURACY_2000.totalCases.toLocaleString()} quests · tiktoken cl100k_base
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 24,
          padding: 16,
          background: 'rgba(0,0,0,0.35)',
          border: '3px solid var(--inventory-border)',
        }}>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Engine accuracy</p>
            <p className="mono stat-value" style={{ fontSize: 28 }}>{ACCURACY_2000.accuracyPercent}%</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{ACCURACY_2000.passed}/{ACCURACY_2000.totalCases}</p>
          </div>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Recall integrity</p>
            <p className="mono stat-value" style={{ fontSize: 28 }}>{ACCURACY_2000.recallAccuracyPercent}%</p>
          </div>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Est. Δ vs tiktoken</p>
            <p className="mono" style={{ fontSize: 28, color: 'var(--diamond)' }}>{ACCURACY_2000.avgReductionDeltaPp}pp</p>
          </div>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Est. count error</p>
            <p className="mono" style={{ fontSize: 28, color: 'var(--gold)' }}>~{ACCURACY_2000.avgEstimatorErrorPct}%</p>
          </div>
        </div>

        <h3 className="section-title" style={{ marginBottom: 12 }}>2,000 quest outcomes</h3>
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table className="mc-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Cases</th>
                <th>Result</th>
                <th>What passed</th>
              </tr>
            </thead>
            <tbody>
              {ACCURACY_2000_CATEGORIES.map((row) => (
                <tr key={row.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.label}</td>
                  <td className="mono">{row.count}</td>
                  <td className="mono" style={{ color: 'var(--emerald)' }}>
                    {row.pass}/{row.count} ✓
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{row.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 24, lineHeight: 1.6 }}>
          Tokn&apos;t smelts bloated context into compact ingots — every piece recoverable via recall.
          Savings depend on mode and what your agent mines. CLI counts are estimates, not billing.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[MEASURED_BY_MODE.safe, MEASURED_BY_MODE.balanced].map((m) => (
            <div key={m.label} className="card" style={{ padding: 20, margin: 0, boxShadow: 'none' }}>
              <p className="mono" style={{ fontSize: 14, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                {m.label}
              </p>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 12 }}>{m.description}</p>
              <p className="mono stat-value" style={{ fontSize: 24 }}>
                {m.tiktokenOriginal.toLocaleString()} → {m.tiktokenOptimized.toLocaleString()}
              </p>
              <p style={{ color: 'var(--emerald)', fontSize: 18, marginTop: 4 }}>
                {m.reductionPercent}% smelted
              </p>
            </div>
          ))}
        </div>

        <h3 className="section-title" style={{ marginBottom: 12 }}>Enchantments (balanced mode)</h3>
        <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
          {MEASURED_BY_STRATEGY.map((row) => (
            <div key={row.strategy} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 16,
              padding: '10px 12px',
              border: '2px solid var(--inventory-border)',
              background: 'rgba(0,0,0,0.25)',
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>{row.strategy}</span>
              <span className="mono" style={{ color: row.reductionPercent === 0 ? 'var(--text-primary)' : 'var(--emerald)' }}>
                {row.reductionPercent}% {row.recall && row.reductionPercent > 0 ? '· recall ✓' : row.reductionPercent === 0 ? '· protected ✓' : ''}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, fontSize: 16 }}>
          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <p style={{ color: 'var(--gold)', marginBottom: 6 }}>🗺️ Real repo duplicate reads</p>
            <p className="mono">{MEASURED_REAL_REPO.tiktokenOriginal.toLocaleString()} → {MEASURED_REAL_REPO.tiktokenOptimized.toLocaleString()} ({MEASURED_REAL_REPO.reductionPercent}%)</p>
          </div>
          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <p style={{ color: 'var(--gold)', marginBottom: 6 }}>📏 Token estimator</p>
            <p>{MEASURED_ESTIMATOR.reductionPercentAccuracy}. {MEASURED_ESTIMATOR.absoluteCountNote}</p>
          </div>
        </div>

        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 20 }}>
          Reproduce: <code className="mono">{ACCURACY_2000.runCommand}</code> · Not yet validated in live agent worlds.
        </p>
      </div>
    </section>
  );
}
