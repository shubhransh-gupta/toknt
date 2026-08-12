const STEPS = [
  {
    n: 1,
    title: 'Install Tokn\'t',
    code: `git clone https://github.com/shubhransh-gupta/toknt.git
cd toknt && npm install && npm run build`,
    note: 'Or `npx toknt install` after npm publish.',
  },
  {
    n: 2,
    title: 'Connect your agent',
    code: `npx toknt install cursor   # or claude, codex, windsurf
npx toknt status
npx toknt doctor`,
    note: 'Hooks write to ~/.cursor/toknt/ (or ~/.claude/toknt/, etc.)',
  },
  {
    n: 3,
    title: 'Set optimization mode',
    code: `npx toknt config set mode balanced`,
    note: 'safe ≈ 6.5% on mixed sessions · balanced ≈ 91% when logs and listings are large',
  },
  {
    n: 4,
    title: 'Code normally',
    code: `# Open Cursor / Claude Code / Codex
# Tokn't compresses tool output automatically`,
    note: 'Duplicates, test logs, and directory listings are compressed before hitting the model.',
  },
  {
    n: 5,
    title: 'Track savings',
    code: `npx toknt stats
npx toknt benchmark --mode balanced --export run.json`,
    note: 'Import run.json below to visualize results here.',
  },
  {
    n: 6,
    title: 'Recall when needed',
    code: `npx toknt recall toknt://file/abc123`,
    note: 'Full content stays in ~/.toknt/ — never lost, just not sent every time.',
  },
];

const MODES = [
  { name: 'safe', savings: '~6.5%', best: 'Default — duplicate files and tool output only' },
  { name: 'balanced', savings: '~91%', best: 'Heavy test output, directory listings, large logs' },
  { name: 'aggressive', savings: 'Higher', best: 'Experiments — may affect task quality' },
];

export function SetupGuide() {
  return (
    <section id="setup" className="section" style={{ paddingBottom: 48 }}>
      <div className="card card-accent">
        <h2 className="section-heading">Setup guide</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 28, maxWidth: 640 }}>
          Six steps. Local-only. No API keys. Tokn&apos;t compresses redundant context before your agent sends it to the model.
        </p>

        <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
          {STEPS.map((step) => (
            <div
              key={step.n}
              style={{
                padding: 20,
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 16,
                alignItems: 'start',
                background: 'var(--bg-elevated)',
              }}
            >
              <div className="step-number">{step.n}</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{step.title}</h3>
                <pre style={{ marginBottom: 8 }}>{step.code}</pre>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{step.note}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="section-title">Optimization modes</h3>
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Typical savings</th>
                <th>Best for</th>
              </tr>
            </thead>
            <tbody>
              {MODES.map((m) => (
                <tr key={m.name}>
                  <td className="mono" style={{ color: 'var(--accent)' }}>{m.name}</td>
                  <td className="mono">{m.savings}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Full guide:{' '}
          <a
            href="https://github.com/shubhransh-gupta/toknt/blob/main/docs/reduce-token-cost.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/reduce-token-cost.md
          </a>
          {' '}· Savings are measured estimates, not provider billing.
        </p>
      </div>
    </section>
  );
}
