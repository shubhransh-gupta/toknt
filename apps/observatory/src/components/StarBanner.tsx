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
    <div className="mc-banner" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 18, color: 'var(--text-secondary)' }}>
        ⭐ Mine a star if redundant agent context grinds your gears
        {stars != null && (
          <span className="mono" style={{ marginLeft: 8, color: 'var(--gold)' }}>
            ★ {stars.toLocaleString()} XP
          </span>
        )}
      </span>
      <a
        href={GITHUB_REPO}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{ padding: '8px 16px', fontSize: 14 }}
      >
        ★ Star on GitHub
      </a>
      <a
        href={`${GITHUB_REPO}/fork`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary"
        style={{ padding: '8px 16px', fontSize: 14 }}
      >
        🔨 Fork & Build
      </a>
    </div>
  );
}
