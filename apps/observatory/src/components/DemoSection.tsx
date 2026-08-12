import { useState, useEffect } from 'react';

export function DemoSection() {
  const [phase, setPhase] = useState(0);
  const [saved, setSaved] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => {
        if (p >= 2) {
          clearInterval(timer);
          return 2;
        }
        return p + 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (phase >= 2) {
      let current = 0;
      const target = 42812;
      const step = setInterval(() => {
        current += Math.round(target / 30);
        if (current >= target) {
          current = target;
          clearInterval(step);
        }
        setSaved(current);
      }, 40);
      return () => clearInterval(step);
    }
  }, [phase]);

  const rawWidth = phase >= 1 ? 35 : 100;
  const optWidth = phase >= 1 ? 14 : 100;

  return (
    <div className="card animate-in">
      <h2 className="section-heading">Live compression demo</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
        Watch context shrink as Tokn&apos;t optimizes redundant tool output
      </p>

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Original context</p>
            <p className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{rawWidth}%</p>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div style={{
              height: '100%',
              width: `${rawWidth}%`,
              background: '#52525b',
              borderRadius: 999,
              transition: 'width 1s ease-out',
            }} />
          </div>
        </div>

        {phase >= 1 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--accent)' }}>Optimized context</p>
              <p className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>{optWidth}%</p>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${optWidth}%`, transition: 'width 1s ease-out' }} />
            </div>
          </div>
        )}

        {phase >= 2 && (
          <p className="mono animate-in" style={{ fontSize: 20, color: 'var(--accent)', fontWeight: 600, textAlign: 'center' }}>
            +{saved.toLocaleString()} tokens saved
          </p>
        )}
      </div>

      <p style={{ marginTop: 24, textAlign: 'center' }}>
        <span className="badge badge-success">Measured</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
          Run <code>npm run audit:2000</code> to reproduce
        </span>
      </p>
    </div>
  );
}
