import {
  MEASURED_BY_MODE,
  MEASURED_BY_STRATEGY,
  MEASURED_ESTIMATOR,
  MEASURED_REAL_REPO,
  MEASURED_AUDIT,
} from '../data/measured';

export function HonestSummary() {
  return (
    <section id="honest-summary" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
      <div className="card" style={{ borderColor: 'rgba(0, 255, 136, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Honest summary</h2>
          <span className="badge badge-success">MEASURED DATA</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {MEASURED_AUDIT.source} · tiktoken cl100k_base
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
          Tokn&apos;t <strong>does</strong> compress context and every compressed item is recoverable via recall.
          Savings depend heavily on your optimization mode and what your agent actually sends.
          Token counts in the CLI are <em>estimates</em> — not exact provider billing.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[MEASURED_BY_MODE.safe, MEASURED_BY_MODE.balanced].map((m) => (
            <div key={m.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 20, border: '1px solid var(--border)' }}>
              <p className="mono" style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {m.label}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{m.description}</p>
              <p className="mono" style={{ fontSize: 22, fontWeight: 600 }}>
                {m.tiktokenOriginal.toLocaleString()} → {m.tiktokenOptimized.toLocaleString()}
              </p>
              <p style={{ color: 'var(--accent)', fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                {m.reductionPercent}% reduction
              </p>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          By optimization (balanced mode)
        </h3>
        <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
          {MEASURED_BY_STRATEGY.map((row) => (
            <div key={row.strategy} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{row.strategy}</span>
              <span className="mono" style={{ color: row.reductionPercent === 0 ? 'var(--text-primary)' : 'var(--accent)' }}>
                {row.reductionPercent}% {row.recall && row.reductionPercent > 0 ? '· recall ✓' : row.reductionPercent === 0 ? '· never compressed ✓' : ''}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, fontSize: 13 }}>
          <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Real repo duplicate reads</p>
            <p className="mono">{MEASURED_REAL_REPO.tiktokenOriginal.toLocaleString()} → {MEASURED_REAL_REPO.tiktokenOptimized.toLocaleString()} ({MEASURED_REAL_REPO.reductionPercent}%)</p>
          </div>
          <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Token estimator accuracy</p>
            <p>{MEASURED_ESTIMATOR.reductionPercentAccuracy}. {MEASURED_ESTIMATOR.absoluteCountNote}</p>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          Reproduce: <code className="mono">{MEASURED_AUDIT.runCommand}</code> · Not yet validated against live Cursor/Claude/Codex sessions.
        </p>
      </div>
    </section>
  );
}
