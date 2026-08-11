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
    <div className="card animate-in" style={{ padding: 40, textAlign: 'center' }}>
      <h2 className="section-title">Smelting demo — watch ore shrink</h2>

      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <p style={{ fontSize: 16, color: 'var(--lava)', marginBottom: 8, textAlign: 'left' }}>🪨 RAW AGENT CONTEXT</p>
        <div className="mc-progress" style={{ height: 24, marginBottom: 24 }}>
          <div style={{
            height: '100%',
            width: `${rawWidth}%`,
            background: 'repeating-linear-gradient(90deg, var(--redstone) 0, var(--redstone) 8px, var(--lava) 8px, var(--lava) 16px)',
            transition: 'width 1.2s steps(10)',
          }} />
        </div>

        {phase >= 1 && (
          <>
            <p style={{ fontSize: 16, color: 'var(--emerald)', marginBottom: 8, textAlign: 'left' }}>⚡ TOKN&apos;T FURNACE</p>
            <div className="mc-progress" style={{ height: 24, marginBottom: 24 }}>
              <div className="mc-progress-fill" style={{ width: `${optWidth}%`, transition: 'width 1.2s steps(10)' }} />
            </div>
          </>
        )}

        {phase >= 2 && (
          <p className="mono animate-in" style={{ fontSize: 24, color: 'var(--gold)', fontWeight: 600, textShadow: '2px 2px 0 #000' }}>
            +{saved.toLocaleString()} XP tokens saved!
          </p>
        )}
      </div>

      <p style={{ marginTop: 16 }}>
        <span className="badge badge-success">✓ MEASURED</span>
        <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 8 }}>
          Run <code className="mono">npm run audit:2000</code> to reproduce
        </span>
      </p>
    </div>
  );
}
