import { useState } from 'react';
import { formatTokens, type BenchmarkResult } from '../data/demo';

interface Props {
  result: BenchmarkResult;
}

export function ShareCard({ result }: Props) {
  const [copied, setCopied] = useState('');

  const markdown = `# Tokn't Benchmark

**Agent:** ${result.agent}
**Task:** ${result.taskName}

${formatTokens(result.originalTokens)} → ${formatTokens(result.optimizedTokens)}

**${result.reductionPercent.toFixed(1)}% fewer tokens**

Task ${result.taskSuccess ? 'succeeded' : 'failed'}

Same task. Less context.`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="card">
      <h3 className="section-title">Share results</h3>

      <div style={{
        background: 'var(--bg-elevated)',
        padding: 28,
        marginBottom: 20,
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Tokn&apos;t
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>{result.agent}</p>
        <p style={{ fontSize: 16, marginBottom: 20, fontWeight: 500 }}>{result.taskName}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          <span className="mono" style={{ fontSize: 24 }}>{formatTokens(result.originalTokens)}</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span className="mono" style={{ fontSize: 24, color: 'var(--accent)' }}>{formatTokens(result.optimizedTokens)}</span>
        </div>

        <p className="mono" style={{ color: 'var(--accent)', fontSize: 18, marginBottom: 8, fontWeight: 600 }}>
          {result.reductionPercent.toFixed(1)}% fewer tokens
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Task {result.taskSuccess ? 'succeeded' : 'failed'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }} onClick={() => copy(markdown, 'md')}>
          {copied === 'md' ? 'Copied' : 'Copy Markdown'}
        </button>
        <button className="btn btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }} onClick={() => copy(JSON.stringify(result, null, 2), 'json')}>
          {copied === 'json' ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
    </div>
  );
}
