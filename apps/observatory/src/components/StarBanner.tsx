import { GITHUB_REPO } from '../config';

export function StarBanner() {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 10, 15, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        Tokn&apos;t is open source — star it if redundant agent context annoys you too
      </span>
      <a
        href={GITHUB_REPO}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{ padding: '6px 16px', fontSize: 13, textDecoration: 'none' }}
      >
        ★ Star on GitHub
      </a>
      <a
        href={`${GITHUB_REPO}/fork`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary"
        style={{ padding: '6px 16px', fontSize: 13, textDecoration: 'none' }}
      >
        Fork & Contribute
      </a>
    </div>
  );
}
