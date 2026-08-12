import { useState, useCallback, useRef } from 'react';
import { BENCHMARK_RESULTS, aggregateStats, type BenchmarkResult } from './data/demo';
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
import { SetupGuide } from './components/SetupGuide';

export default function App() {
  const [results, setResults] = useState<BenchmarkResult[]>(BENCHMARK_RESULTS);
  const [selectedResult, setSelectedResult] = useState<BenchmarkResult>(BENCHMARK_RESULTS[0]);
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
        onExplore={() => scrollTo('setup')}
      />

      <SetupGuide />
      <PrivacyBanner />
      <HonestSummary />

      <section id="demo" className="section section-spaced">
        <DemoSection />
      </section>

      <section id="dashboard" className="section section-spaced">
        <Dashboard stats={stats} />
      </section>

      <section id="comparison" className="section section-spaced">
        <Comparison
          result={selectedResult}
          results={filtered}
          onSelect={setSelectedResult}
        />
      </section>

      <section className="section section-spaced">
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'cursor', 'claude', 'codex'].map((agent) => (
            <button
              key={agent}
              className={`btn ${agentFilter === agent ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setAgentFilter(agent)}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              {agent === 'all' ? 'All agents' : agent.charAt(0).toUpperCase() + agent.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <SavingsBreakdown result={selectedResult} />
          <TokenChart results={filtered} />
        </div>
      </section>

      <section className="section section-spaced">
        <QualityChart results={filtered} />
      </section>

      <section className="section section-spaced">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <CostEstimator result={selectedResult} />
          <ShareCard result={selectedResult} />
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 80, textAlign: 'center' }}>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} />
        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          Import benchmark JSON
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>
          Export with <code>toknt benchmark --export result.json</code>
        </p>
      </section>

      <footer className="site-footer" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Tokn&apos;t
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Local-first token optimization for AI coding agents · MIT License
        </p>
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
          Created with ❤️ by{' '}
          <a href="https://github.com/shubhransh-gupta" target="_blank" rel="noopener noreferrer">
            Shubhransh Gupta
          </a>
        </p>
      </footer>
    </div>
  );
}
