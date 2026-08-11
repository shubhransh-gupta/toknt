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
      padding: '80px 24px 60px',
      textAlign: 'center',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      <p className="mono" style={{ color: 'var(--accent)', fontSize: 13, letterSpacing: '0.15em', marginBottom: 16 }}>
        TOKN&apos;T OBSERVATORY
      </p>

      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 700,
        lineHeight: 1.15,
        marginBottom: 16,
        letterSpacing: '-0.02em',
      }}>
        Your AI agent doesn&apos;t need<br />to see everything twice.
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
        Measure. Compare. Optimize.
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 60, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onRunBenchmark}>See measured results</button>
        <button className="btn btn-secondary" onClick={onExplore}>Explore dashboard</button>
      </div>

      <div className="card animate-in" style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 32,
        alignItems: 'center',
        maxWidth: 640,
        margin: '0 auto',
        padding: '32px 40px',
      }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Without Tokn&apos;t
          </p>
          <p className="mono stat-value" style={{ fontSize: 32, fontWeight: 600 }}>
            {formatTokens(balanced.tiktokenOriginal)}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>tokens (tiktoken)</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 28, color: 'var(--accent)' }}>↓</p>
          <p className="mono" style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 600 }}>
            {balanced.reductionPercent}% LESS
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>balanced mode</p>
        </div>

        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            With Tokn&apos;t
          </p>
          <p className="mono stat-value" style={{ fontSize: 32, fontWeight: 600, color: 'var(--accent)' }}>
            {formatTokens(balanced.tiktokenOptimized)}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>tokens (tiktoken)</p>
        </div>
      </div>

      <p style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span className="badge badge-success">MEASURED</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
          tiktoken cl100k_base · default safe mode ~{MEASURED_BY_MODE.safe.reductionPercent}% on same session
        </span>
      </p>
    </section>
  );
}
