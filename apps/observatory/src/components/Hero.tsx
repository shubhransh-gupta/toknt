import { formatTokens } from '../data/demo';
import { MEASURED_BY_MODE } from '../data/measured';

interface HeroProps {
  onRunBenchmark: () => void;
  onExplore: () => void;
}

export function Hero({ onRunBenchmark, onExplore }: HeroProps) {
  const balanced = MEASURED_BY_MODE.balanced;

  return (
    <section style={{
      padding: '72px 24px 56px',
      textAlign: 'center',
      maxWidth: 800,
      margin: '0 auto',
    }}>
      <p style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--accent)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        Token optimization for AI agents
      </p>

      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: '-0.03em',
        marginBottom: 16,
        color: 'var(--text-primary)',
      }}>
        Cut the token waste.<br />Keep the intelligence.
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: 18,
        marginBottom: 40,
        maxWidth: 520,
        margin: '0 auto 40px',
        lineHeight: 1.6,
      }}>
        Measure, compare, and reduce redundant context before it reaches your model.
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 56, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onRunBenchmark}>View measured results</button>
        <button className="btn btn-secondary" onClick={onExplore}>Setup guide</button>
      </div>

      <div className="card card-accent animate-in" style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 32,
        alignItems: 'center',
        maxWidth: 600,
        margin: '0 auto',
        padding: '28px 32px',
      }}>
        <div>
          <p className="section-title" style={{ marginBottom: 8, fontSize: 11 }}>Before</p>
          <p className="mono stat-value" style={{ fontSize: 32 }}>
            {formatTokens(balanced.tiktokenOriginal)}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>tokens (tiktoken)</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p className="mono" style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 600 }}>
            −{balanced.reductionPercent}%
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>balanced mode</p>
        </div>

        <div>
          <p className="section-title" style={{ marginBottom: 8, fontSize: 11 }}>After</p>
          <p className="mono stat-value" style={{ fontSize: 32 }}>
            {formatTokens(balanced.tiktokenOptimized)}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>tokens (tiktoken)</p>
        </div>
      </div>

      <p style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="badge badge-success">Measured</span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          tiktoken cl100k_base · safe mode ~{MEASURED_BY_MODE.safe.reductionPercent}% on mixed sessions
        </span>
      </p>
    </section>
  );
}
