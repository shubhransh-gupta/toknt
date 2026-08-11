import { useState } from 'react';
import { formatTokens, type BenchmarkResult } from '../data/demo';

interface Props {
  result: BenchmarkResult;
}

export function ShareCard({ result }: Props) {
  const [copied, setCopied] = useState('');

  const markdown = `# Tokn't Benchmark ⛏️

**Agent:** ${result.agent}
**Quest:** ${result.taskName}

${formatTokens(result.originalTokens)} → ${formatTokens(result.optimizedTokens)}

**${result.reductionPercent.toFixed(1)}% FEWER TOKENS**

Quest ${result.taskSuccess ? 'COMPLETE ✓' : 'FAILED ✗'}

Same task. Less context. More XP.`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{
        background: 'rgba(0,0,0,0.35)',
        padding: 32,
        marginBottom: 20,
        border: '3px solid var(--inventory-border)',
      }}>
        <p className="pixel-title" style={{ fontSize: 14, marginBottom: 16, color: 'var(--gold)' }}>
          TOKN&apos;T
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 4 }}>{result.agent}</p>
        <p style={{ fontSize: 18, marginBottom: 20 }}>{result.taskName}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          <span className="mono" style={{ fontSize: 28 }}>{formatTokens(result.originalTokens)}</span>
          <span style={{ fontSize: 24 }}>⬇️</span>
          <span className="mono" style={{ fontSize: 28, color: 'var(--emerald)' }}>{formatTokens(result.optimizedTokens)}</span>
        </div>

        <p className="mono" style={{ color: 'var(--gold)', fontSize: 20, marginBottom: 8 }}>
          {result.reductionPercent.toFixed(1)}% FEWER TOKENS
        </p>
        <p style={{ fontSize: 16 }}>
          QUEST {result.taskSuccess ? 'COMPLETE ✓' : 'FAILED ✗'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>Same task. Less context.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ fontSize: 14, padding: '8px 14px' }} onClick={() => copy(markdown, 'md')}>
          {copied === 'md' ? 'Copied!' : '📋 Copy Markdown'}
        </button>
        <button className="btn btn-secondary" style={{ fontSize: 14, padding: '8px 14px' }} onClick={() => copy(JSON.stringify(result, null, 2), 'json')}>
          {copied === 'json' ? 'Copied!' : '📦 Copy JSON'}
        </button>
      </div>
    </div>
  );
}
