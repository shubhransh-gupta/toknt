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
      <div className="mc-hotbar" style={{ margin: '0 auto 24px' }}>
        <div className="mc-slot">⛏️</div>
        <div className="mc-slot">💎</div>
        <div className="mc-slot">🟩</div>
        <div className="mc-slot">📦</div>
        <div className="mc-slot">⚡</div>
      </div>

      <p className="pixel-title" style={{ color: 'var(--gold)', fontSize: 11, marginBottom: 20 }}>
        TOKN&apos;T OBSERVATORY
      </p>

      <h1 className="pixel-title" style={{
        fontSize: 'clamp(14px, 3.5vw, 22px)',
        marginBottom: 20,
      }}>
        Your agent doesn&apos;t need<br />to mine the same block twice.
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: 22, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
        Measure. Compare. Craft leaner context.
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 60, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onRunBenchmark}>⛏ View stats</button>
        <button className="btn btn-secondary" onClick={onExplore}>📦 Open chest</button>
      </div>

      <div className="card card-emerald animate-in" style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 32,
        alignItems: 'center',
        maxWidth: 640,
        margin: '0 auto',
        padding: '32px 40px',
      }}>
        <div>
          <p className="section-title" style={{ marginBottom: 8, fontSize: 8 }}>
            Raw ore
          </p>
          <p className="mono stat-value" style={{ fontSize: 36, fontWeight: 600 }}>
            {formatTokens(balanced.tiktokenOriginal)}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>tokens (tiktoken)</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 28 }}>⬇️</p>
          <p className="mono" style={{ color: 'var(--emerald)', fontSize: 22, fontWeight: 600, textShadow: '2px 2px 0 #000' }}>
            {balanced.reductionPercent}% SMELTED
          </p>
          <p style={{ fontSize: 14, color: 'var(--gold)', marginTop: 4 }}>balanced mode</p>
        </div>

        <div>
          <p className="section-title" style={{ marginBottom: 8, fontSize: 8 }}>
            Refined ingot
          </p>
          <p className="mono stat-value" style={{ fontSize: 36, fontWeight: 600 }}>
            {formatTokens(balanced.tiktokenOptimized)}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>tokens (tiktoken)</p>
        </div>
      </div>

      <p style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span className="badge badge-success">✓ MEASURED</span>
        <span style={{ fontSize: 16, color: 'var(--text-muted)', alignSelf: 'center' }}>
          tiktoken cl100k_base · safe mode ~{MEASURED_BY_MODE.safe.reductionPercent}% on same session
        </span>
      </p>
    </section>
  );
}
