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
    <section id="honest-summary" className="section" style={{ paddingBottom: 40 }}>
      <div className="card card-accent">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <h2 className="section-heading" style={{ margin: 0 }}>Measured accuracy</h2>
          <span className="badge badge-success">Verified</span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {ACCURACY_2000.totalCases.toLocaleString()} test cases · tiktoken cl100k_base
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 16,
          marginBottom: 32,
          padding: 20,
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Engine accuracy</p>
            <p className="mono stat-value" style={{ fontSize: 26 }}>{ACCURACY_2000.accuracyPercent}%</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{ACCURACY_2000.passed}/{ACCURACY_2000.totalCases}</p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Recall integrity</p>
            <p className="mono stat-value" style={{ fontSize: 26 }}>{ACCURACY_2000.recallAccuracyPercent}%</p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Reduction Δ vs tiktoken</p>
            <p className="mono" style={{ fontSize: 26, color: 'var(--blue)' }}>{ACCURACY_2000.avgReductionDeltaPp}pp</p>
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Estimator error</p>
            <p className="mono" style={{ fontSize: 26, color: 'var(--warning)' }}>~{ACCURACY_2000.avgEstimatorErrorPct}%</p>
          </div>
        </div>

        <h3 className="section-title">2,000 test case outcomes</h3>
        <div style={{ overflowX: 'auto', marginBottom: 28 }}>
          <table className="data-table">
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
                  <td className="mono" style={{ color: 'var(--accent)' }}>
                    {row.pass}/{row.count}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{row.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 28, lineHeight: 1.65, maxWidth: 680 }}>
          Tokn&apos;t compresses bloated context into compact summaries — every piece recoverable via recall URI.
          Savings depend on mode and session type. CLI counts are estimates, not billing data.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[MEASURED_BY_MODE.safe, MEASURED_BY_MODE.balanced].map((m) => (
            <div key={m.label} style={{
              padding: 20,
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
            }}>
              <p className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                {m.label}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{m.description}</p>
              <p className="mono stat-value" style={{ fontSize: 20 }}>
                {m.tiktokenOriginal.toLocaleString()} → {m.tiktokenOptimized.toLocaleString()}
              </p>
              <p style={{ color: 'var(--accent)', fontSize: 15, marginTop: 6, fontWeight: 500 }}>
                {m.reductionPercent}% reduction
              </p>
            </div>
          ))}
        </div>

        <h3 className="section-title">Strategies (balanced mode)</h3>
        <div style={{ display: 'grid', gap: 6, marginBottom: 28 }}>
          {MEASURED_BY_STRATEGY.map((row) => (
            <div key={row.strategy} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 14,
              padding: '10px 14px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>{row.strategy}</span>
              <span className="mono" style={{ color: row.reductionPercent === 0 ? 'var(--text-muted)' : 'var(--accent)' }}>
                {row.reductionPercent}% {row.recall && row.reductionPercent > 0 ? '· recall ✓' : row.reductionPercent === 0 ? '· protected' : ''}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <div style={{ padding: 16, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Real repo duplicate reads</p>
            <p className="mono" style={{ fontSize: 14 }}>{MEASURED_REAL_REPO.tiktokenOriginal.toLocaleString()} → {MEASURED_REAL_REPO.tiktokenOptimized.toLocaleString()} ({MEASURED_REAL_REPO.reductionPercent}%)</p>
          </div>
          <div style={{ padding: 16, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Token estimator</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{MEASURED_ESTIMATOR.reductionPercentAccuracy}. {MEASURED_ESTIMATOR.absoluteCountNote}</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 24 }}>
          Reproduce: <code>{ACCURACY_2000.runCommand}</code>
        </p>
      </div>
    </section>
  );
}
