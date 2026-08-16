import { useRef, useState } from 'react';

export interface LiveSessionReport {
  timestamp: string;
  mode: string;
  sessionCount?: number;
  sessions: Array<{
    id: string;
    label?: string;
    original: number;
    optimized: number;
    reductionPercent: number;
    steps?: Array<{ step: number; type: string; optimized: boolean; strategy: string | null }>;
  }>;
  aggregate?: {
    original: number;
    optimized: number;
    reductionPercent: number;
    avgReductionPercent?: number;
  };
}

interface SessionImportProps {
  onImport: (report: LiveSessionReport) => void;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function SessionImport({ onImport }: SessionImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<LiveSessionReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as LiveSessionReport;
        if (!data.sessions || !Array.isArray(data.sessions)) {
          throw new Error('Missing sessions array');
        }
        setReport(data);
        onImport(data);
      } catch {
        setError('Invalid live-session-audit.json format');
        setReport(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <section id="session-import" className="section section-spaced">
      <div className="card card-accent">
        <h2 className="section-heading">Session audit import</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Import output from <code>npm run audit:live</code> or a custom session JSON file.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        <button className="btn btn-secondary" onClick={() => inputRef.current?.click()}>
          Import session audit JSON
        </button>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: 12 }}>{error}</p>
        )}

        {report && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 20,
              padding: 16,
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Mode</p>
                <p className="mono">{report.mode}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Sessions</p>
                <p className="mono">{report.sessions.length}</p>
              </div>
              {report.aggregate && (
                <>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total tokens</p>
                    <p className="mono">{formatTokens(report.aggregate.original)} → {formatTokens(report.aggregate.optimized)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Reduction</p>
                    <p className="mono" style={{ color: 'var(--accent)' }}>{report.aggregate.reductionPercent}%</p>
                  </div>
                </>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Label</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sessions.map((s) => (
                    <tr key={s.id}>
                      <td className="mono">{s.id}</td>
                      <td>{s.label ?? '—'}</td>
                      <td className="mono">{formatTokens(s.original)}</td>
                      <td className="mono">{formatTokens(s.optimized)}</td>
                      <td className="mono" style={{ color: 'var(--accent)' }}>{s.reductionPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
