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
    code: `# Edit ~/.toknt/config.json
{
  "mode": "balanced",
  "integrations": { "cursor": true }
}`,
    note: 'safe ≈ 6.5% on mixed sessions · balanced ≈ 91.5% when logs/listings are huge',
  },
  {
    n: 4,
    title: 'Code normally',
    code: `# Open Cursor / Claude Code / Codex
# Tokn't compresses tool output automatically`,
    note: 'Duplicates, test logs, and directory listings are smelted before hitting the model.',
  },
  {
    n: 5,
    title: 'Track savings',
    code: `npx toknt stats
npx toknt benchmark --mode balanced --export run.json`,
    note: 'Upload run.json here via Import loot below.',
  },
  {
    n: 6,
    title: 'Recall when needed',
    code: `npx toknt recall toknt://file/abc123`,
    note: 'Full content stays in ~/.toknt/ — never lost, just not sent to the model every time.',
  },
];

const MODES = [
  { name: 'safe', savings: '~6.5%', best: 'Default — duplicate files & tool output only' },
  { name: 'balanced', savings: '~91.5%', best: 'Heavy npm test / find . / large logs' },
  { name: 'aggressive', savings: 'Higher', best: 'Experiments — may affect task quality' },
];

export function SetupGuide() {
  return (
    <section id="setup" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>
      <div className="card card-emerald">
        <h2 className="pixel-title" style={{ fontSize: 16, color: 'var(--gold)', marginBottom: 8 }}>
          How to configure & reduce token cost
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 28, maxWidth: 720 }}>
          Six steps. Local-only. No API keys. Tokn&apos;t compresses redundant context before your agent sends it to the model.
        </p>

        <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="card"
              style={{ padding: 20, boxShadow: 'none', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'start' }}
            >
              <div
                className="mc-slot"
                style={{ width: 40, height: 40, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}
              >
                {step.n}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{step.title}</h3>
                <pre style={{
                  background: 'rgba(0,0,0,0.45)',
                  border: '2px solid var(--inventory-border)',
                  padding: '12px 14px',
                  overflow: 'auto',
                  fontSize: 13,
                  lineHeight: 1.5,
                  marginBottom: 8,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {step.code}
                </pre>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{step.note}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="section-title" style={{ marginBottom: 12 }}>Pick your enchantment (mode)</h3>
        <table className="mc-table" style={{ marginBottom: 20 }}>
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
                <td className="mono" style={{ color: 'var(--emerald)' }}>{m.name}</td>
                <td className="mono">{m.savings}</td>
                <td>{m.best}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Full guide:{' '}
          <a
            href="https://github.com/shubhransh-gupta/toknt/blob/main/docs/reduce-token-cost.md"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--diamond)' }}
          >
            docs/reduce-token-cost.md
          </a>
          {' '}· Savings are measured estimates, not provider billing.
        </p>
      </div>
    </section>
  );
}
