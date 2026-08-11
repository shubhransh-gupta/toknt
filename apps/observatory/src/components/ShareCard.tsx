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

**${result.reductionPercent.toFixed(1)}% FEWER TOKENS**

Task ${result.taskSuccess ? 'PASSED ✓' : 'FAILED ✗'}

Same task. Less context.
${result.isDemo ? '\n> DEMO DATA' : ''}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        padding: 32,
        marginBottom: 20,
        border: '1px solid var(--border)',
      }}>
        <p className="mono" style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          TOKN&apos;T
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>{result.agent}</p>
        <p style={{ fontSize: 15, marginBottom: 20 }}>{result.taskName}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          <span className="mono" style={{ fontSize: 24 }}>{formatTokens(result.originalTokens)}</span>
          <span style={{ color: 'var(--accent)', fontSize: 20 }}>↓</span>
          <span className="mono" style={{ fontSize: 24, color: 'var(--accent)' }}>{formatTokens(result.optimizedTokens)}</span>
        </div>

        <p className="mono" style={{ color: 'var(--accent)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          {result.reductionPercent.toFixed(1)}% FEWER TOKENS
        </p>
        <p style={{ fontSize: 13 }}>
          TASK {result.taskSuccess ? 'PASSED ✓' : 'FAILED ✗'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>Same task. Less context.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => copy(markdown, 'md')}>
          {copied === 'md' ? 'Copied!' : 'Copy Markdown'}
        </button>
        <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => copy(JSON.stringify(result, null, 2), 'json')}>
          {copied === 'json' ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
    </div>
  );
}
