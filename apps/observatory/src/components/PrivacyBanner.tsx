export function PrivacyBanner() {
  return (
    <div className="section" style={{ marginBottom: 40 }}>
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 24px',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.06) 0%, var(--bg-card) 100%)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--blue-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
            Local-first & private
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Your code never leaves your machine. No uploads. No cloud.
          </p>
        </div>
      </div>
    </div>
  );
}
