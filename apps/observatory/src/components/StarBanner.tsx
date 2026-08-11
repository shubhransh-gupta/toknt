import { useEffect, useState } from 'react';
import { GITHUB_REPO } from '../config';

export function StarBanner() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://api.github.com/repos/shubhransh-gupta/toknt', {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stargazers_count != null) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Graceful fallback — rate limit or offline
      });

    return () => controller.abort();
  }, []);

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
        {stars != null && (
          <span className="mono" style={{ marginLeft: 8, color: 'var(--accent)' }}>
            ★ {stars.toLocaleString()}
          </span>
        )}
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
