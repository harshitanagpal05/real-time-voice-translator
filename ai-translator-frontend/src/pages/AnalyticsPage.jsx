import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { fetchAnalytics } from '../api/translationHistoryApi';
import { LANGUAGE_MAP } from '../constants/languages';
import './AnalyticsPage.css';

Chart.register(...registerables);

function StatCard({ icon, label, value, sub, delay = 0 }) {
  return (
    <motion.div
      className="analytics-stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <span className="analytics-stat-icon">{icon}</span>
      <div className="analytics-stat-value">{value}</div>
      <div className="analytics-stat-label">{label}</div>
      {sub && <div className="analytics-stat-sub">{sub}</div>}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dailyChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const pairsChartRef = useRef(null);

  const dailyChartInst = useRef(null);
  const donutChartInst = useRef(null);
  const pairsChartInst = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Render / Update Charts
  useEffect(() => {
    if (loading || error || !analytics || !analytics.totalTranslations) return;

    const style = getComputedStyle(document.documentElement);
    const purple = style.getPropertyValue('--accent-purple').trim() || '#6A0DAD';
    const orange = style.getPropertyValue('--accent-orange').trim() || '#FF8C00';
    const magenta = style.getPropertyValue('--accent-magenta').trim() || '#E040FB';
    const textPrimary = style.getPropertyValue('--text-primary').trim() || '#ffffff';
    const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#a0a0a0';

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textPrimary,
            font: { family: 'Sora, sans-serif', size: 11 }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: textSecondary, font: { family: 'Sora, sans-serif', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: textSecondary, font: { family: 'Sora, sans-serif', size: 10 } }
        }
      }
    };

    // 1. Daily Translations (Bar Chart)
    if (dailyChartRef.current) {
      if (dailyChartInst.current) dailyChartInst.current.destroy();

      const dailyData = (analytics.dailyCounts || []).map((d) => ({
        label: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        count: d.count,
      }));

      dailyChartInst.current = new Chart(dailyChartRef.current, {
        type: 'bar',
        data: {
          labels: dailyData.map((d) => d.label),
          datasets: [{
            label: 'Translations',
            data: dailyData.map((d) => d.count),
            backgroundColor: purple,
            borderColor: magenta,
            borderWidth: 1,
            borderRadius: 6,
          }]
        },
        options: {
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            legend: { display: false }
          }
        }
      });
    }

    // 2. Voice vs Text (Donut Chart)
    if (donutChartRef.current) {
      if (donutChartInst.current) donutChartInst.current.destroy();

      donutChartInst.current = new Chart(donutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Voice', 'Text'],
          datasets: [{
            data: [analytics.voiceCount || 0, analytics.textCount || 0],
            backgroundColor: [orange, purple],
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: textPrimary,
                font: { family: 'Sora, sans-serif', size: 12 }
              }
            }
          },
          cutout: '60%'
        }
      });
    }

    // 3. Top Language Pairs (Horizontal Bar Chart)
    if (pairsChartRef.current) {
      if (pairsChartInst.current) pairsChartInst.current.destroy();

      const pairData = (analytics.langPairs || []).map((p) => ({
        label: `${(LANGUAGE_MAP[p.source] || p.source).slice(0, 5)} → ${(LANGUAGE_MAP[p.target] || p.target).slice(0, 5)}`,
        count: p.count,
      }));

      pairsChartInst.current = new Chart(pairsChartRef.current, {
        type: 'bar',
        data: {
          labels: pairData.map((p) => p.label),
          datasets: [{
            label: 'Translations',
            data: pairData.map((p) => p.count),
            backgroundColor: magenta,
            borderColor: orange,
            borderWidth: 1,
            borderRadius: 6,
          }]
        },
        options: {
          ...commonOptions,
          indexAxis: 'y',
          plugins: {
            ...commonOptions.plugins,
            legend: { display: false }
          }
        }
      });
    }

    return () => {
      if (dailyChartInst.current) dailyChartInst.current.destroy();
      if (donutChartInst.current) donutChartInst.current.destroy();
      if (pairsChartInst.current) pairsChartInst.current.destroy();
    };
  }, [loading, error, analytics]);

  if (loading) {
    return (
      <div className="analytics-page">
        <header className="analytics-pg-header">
          <h1>Translation Analytics</h1>
          <p>Loading your insights...</p>
        </header>
        <div className="analytics-stats-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="analytics-stat-card skeleton-card">
              <div className="skeleton-line w40" />
              <div className="skeleton-line w60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <header className="analytics-pg-header">
          <h1>Translation Analytics</h1>
        </header>
        <div className="history-error">
          {error}
          <button type="button" onClick={load} className="history-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  const a = analytics || {};
  const isEmpty = !a.totalTranslations;

  if (isEmpty) {
    return (
      <div className="analytics-page">
        <header className="analytics-pg-header">
          <h1>Translation Analytics</h1>
          <p>Insights from your translations</p>
        </header>
        <motion.div className="analytics-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="analytics-empty-icon">📊</div>
          <h3>No analytics yet</h3>
          <p>Start translating to see insights about your usage patterns, language preferences, and activity timeline.</p>
        </motion.div>
      </div>
    );
  }

  // Success rate is 100% since we only record successful translations
  const successRate = 100;

  return (
    <div className="analytics-page">
      <header className="analytics-pg-header">
        <h1>Translation Analytics</h1>
        <p>Insights from {a.totalTranslations} translation{a.totalTranslations !== 1 ? 's' : ''}</p>
      </header>

      <div className="analytics-stats-grid">
        <StatCard icon="📊" label="Total Translations" value={a.totalTranslations} delay={0.05} />
        <StatCard icon="🎤" label="Voice Translations" value={a.voiceCount} delay={0.1} />
        <StatCard icon="📝" label="Text Translations" value={a.textCount} delay={0.15} />
        <StatCard
          icon="🌍"
          label="Top Source Language"
          value={LANGUAGE_MAP[a.topSourceLang] || a.topSourceLang || '—'}
          delay={0.2}
        />
        <StatCard
          icon="🎯"
          label="Top Target Language"
          value={LANGUAGE_MAP[a.topTargetLang] || a.topTargetLang || '—'}
          delay={0.25}
        />
        <StatCard
          icon="✅"
          label="Translation Success Rate"
          value={`${successRate}%`}
          delay={0.3}
        />
      </div>

      <div className="analytics-charts-grid">
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Daily Translations (Last 7 Days)</h3>
          <div className="chart-canvas-wrapper">
            <canvas ref={dailyChartRef} />
          </div>
        </div>

        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Voice vs Text Breakdown</h3>
          <div className="chart-canvas-wrapper donut-wrapper">
            <canvas ref={donutChartRef} />
          </div>
        </div>

        <div className="analytics-chart-card horizontal-bar-chart-card">
          <h3 className="analytics-chart-title">Top Language Pairs</h3>
          <div className="chart-canvas-wrapper">
            <canvas ref={pairsChartRef} />
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      {a.recentActivity?.length > 0 && (
        <section className="analytics-timeline">
          <h3 className="analytics-timeline-title">Recent Activity</h3>
          <div className="analytics-timeline-list">
            {a.recentActivity.slice(0, 10).map((item, i) => (
              <motion.div
                key={item._id || i}
                className="analytics-timeline-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <span className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-pair">
                    {LANGUAGE_MAP[item.inputLanguage] || item.inputLanguage} → {LANGUAGE_MAP[item.outputLanguage] || item.outputLanguage}
                  </span>
                  <span className="timeline-text">{item.originalText?.slice(0, 50)}{item.originalText?.length > 50 ? '...' : ''}</span>
                  <span className="timeline-time">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className={`timeline-type ${item.translationType || 'text'}`}>
                  {item.translationType === 'voice' ? '🎤' : '📝'}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
