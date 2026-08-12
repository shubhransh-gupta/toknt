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
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <nav className="nav-bar">
      <div style={{
        maxWidth: 1120,
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Tokn&apos;t
          </span>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>|</span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Observatory</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {stars != null && (
            <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 4 }}>
              {stars.toLocaleString()} stars
            </span>
          )}
          <a href="#setup" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
            Setup
          </a>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            GitHub
          </a>
          <a
            href={`${GITHUB_REPO}/fork`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            Star on GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
