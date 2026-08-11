export function PrivacyBanner() {
  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto 40px',
      padding: '0 24px',
    }}>
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 24px',
        borderColor: 'rgba(0, 255, 136, 0.2)',
        background: 'rgba(0, 255, 136, 0.03)',
      }}>
        <span style={{ fontSize: 24 }}>🔒</span>
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>LOCAL FIRST</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Your code never leaves your machine. No source uploads. No prompts uploaded. No API keys uploaded.
          </p>
        </div>
      </div>
    </div>
  );
}
