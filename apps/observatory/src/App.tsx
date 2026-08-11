import { useState, useCallback, useRef } from 'react';
import { DEMO_RESULTS, aggregateStats, type BenchmarkResult } from './data/demo';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { Comparison } from './components/Comparison';
import { SavingsBreakdown } from './components/SavingsBreakdown';
import { TokenChart } from './components/TokenChart';
import { QualityChart } from './components/QualityChart';
import { CostEstimator } from './components/CostEstimator';
import { ShareCard } from './components/ShareCard';
import { PrivacyBanner } from './components/PrivacyBanner';
import { HonestSummary } from './components/HonestSummary';
import { DemoSection } from './components/DemoSection';
import { StarBanner } from './components/StarBanner';

export default function App() {
  const [results, setResults] = useState<BenchmarkResult[]>(DEMO_RESULTS);
  const [selectedResult, setSelectedResult] = useState<BenchmarkResult>(DEMO_RESULTS[0]);
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = agentFilter === 'all'
    ? results
    : results.filter((r) => r.agent === agentFilter);

  const stats = aggregateStats(filtered);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const imported: BenchmarkResult[] = Array.isArray(data) ? data : [data];
        setResults((prev) => [...imported, ...prev]);
        setSelectedResult(imported[0]);
      } catch {
        alert('Invalid benchmark JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <StarBanner />
      <Hero
        onRunBenchmark={() => scrollTo('honest-summary')}
        onExplore={() => scrollTo('dashboard')}
      />

      <PrivacyBanner />

      <HonestSummary />

      <section id="demo" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <DemoSection />
      </section>

      <section id="dashboard" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <Dashboard stats={stats} />
      </section>

      <section id="comparison" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <Comparison
          result={selectedResult}
          results={filtered}
          onSelect={setSelectedResult}
        />
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'cursor', 'claude', 'codex'].map((agent) => (
            <button
              key={agent}
              className={`btn ${agentFilter === agent ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setAgentFilter(agent)}
              style={{ padding: '6px 16px', fontSize: 13 }}
            >
              {agent === 'all' ? 'All Agents' : agent.charAt(0).toUpperCase() + agent.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <SavingsBreakdown result={selectedResult} />
          <TokenChart results={filtered} />
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <QualityChart results={filtered} />
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <CostEstimator result={selectedResult} />
          <ShareCard result={selectedResult} />
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px', textAlign: 'center' }}>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} />
        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          Upload Benchmark JSON
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>
          Import results from <code className="mono">toknt benchmark --export result.json</code>
        </p>
      </section>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>
          TOKN<span style={{ color: 'var(--accent)' }}>'</span>T
        </p>
        <p>Tokens? Tokn&apos;t. — Local-first. Open source. MIT License.</p>
      </footer>
    </div>
  );
}
