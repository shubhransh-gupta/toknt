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
      <h2 style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 32 }}>
        Interactive Demo
      </h2>

      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'left' }}>RAW AGENT CONTEXT</p>
        <div style={{
          height: 24,
          background: 'var(--bg-secondary)',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 24,
          transition: 'all 1s ease-out',
        }}>
          <div style={{
            height: '100%',
            width: `${rawWidth}%`,
            background: '#ff4466',
            opacity: 0.7,
            borderRadius: 4,
            transition: 'width 1.2s ease-out',
          }} />
        </div>

        {phase >= 1 && (
          <>
            <p style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 8, textAlign: 'left' }}>TOKN&apos;T</p>
            <div style={{
              height: 24,
              background: 'var(--bg-secondary)',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 24,
            }}>
              <div style={{
                height: '100%',
                width: `${optWidth}%`,
                background: 'var(--accent)',
                borderRadius: 4,
                transition: 'width 1.2s ease-out',
              }} />
            </div>
          </>
        )}

        {phase >= 2 && (
          <p className="mono animate-in" style={{ fontSize: 20, color: 'var(--accent)', fontWeight: 600 }}>
            Saved: {saved.toLocaleString()} tokens
          </p>
        )}
      </div>

      <p style={{ marginTop: 16 }}>
        <span className="badge badge-success">MEASURED DATA</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
          Illustrative animation — run <code className="mono">npm run audit</code> for real numbers
        </span>
      </p>
    </div>
  );
}
