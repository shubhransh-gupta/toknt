export function PrivacyBanner() {
  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto 40px',
      padding: '0 24px',
    }}>
      <div className="card card-emerald" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 24px',
      }}>
        <span style={{ fontSize: 32 }}>🛡️</span>
        <div>
          <p className="pixel-title" style={{ fontSize: 9, marginBottom: 6, color: 'var(--emerald)' }}>
            LOCAL SURVIVAL MODE
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>
            Your code never leaves your machine. No uploads. No cloud. Your world, your rules.
          </p>
        </div>
      </div>
    </div>
  );
}
