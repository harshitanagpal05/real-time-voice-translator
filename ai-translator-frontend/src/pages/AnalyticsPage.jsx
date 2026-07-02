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
      className="analytics-stat-card glass-card"
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
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'monthly'

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
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  // Render / Update Charts
  useEffect(() => {
    if (loading || error || !analytics || !analytics.totalTranslations) return;

    const style = getComputedStyle(document.documentElement);
    const purple = style.getPropertyValue('--accent-purple').trim() || '#7c3aed';
    const orange = style.getPropertyValue('--accent-orange').trim() || '#f97316';
    const magenta = style.getPropertyValue('--accent-magenta').trim() || '#c084fc';
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
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: textSecondary, font: { family: 'Sora, sans-serif', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: textSecondary, font: { family: 'Sora, sans-serif', size: 10 } }
        }
      }
    };

    // 1. Daily/Monthly Translations (Bar Chart)
    if (dailyChartRef.current) {
      if (dailyChartInst.current) dailyChartInst.current.destroy();

      let labels = [];
      let counts = [];

      if (timeframe === 'weekly') {
        const dailyData = (analytics.dailyCounts || []).map((d) => ({
          label: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
          count: d.count,
        }));
        labels = dailyData.map((d) => d.label);
        counts = dailyData.map((d) => d.count);
      } else {
        const monthlyData = (analytics.monthlyCounts || []).map((m) => {
          const [year, month] = m.month.split('-');
          const d = new Date(year, parseInt(month) - 1);
          return {
            label: d.toLocaleDateString('en', { month: 'short' }),
            count: m.count,
          };
        });
        labels = monthlyData.map((m) => m.label);
        counts = monthlyData.map((m) => m.count);
      }

      dailyChartInst.current = new Chart(dailyChartRef.current, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Translations',
            data: counts,
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
            borderColor: 'rgba(255, 255, 255, 0.08)',
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
          cutout: '65%'
        }
      });
    }

    // 3. Top Language Pairs (Horizontal Bar Chart)
    if (pairsChartRef.current) {
      if (pairsChartInst.current) pairsChartInst.current.destroy();

      const pairData = (analytics.langPairs || []).slice(0, 5).map((p) => ({
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
  }, [loading, error, analytics, timeframe]);

  if (loading) {
    return (
      <div className="analytics-page">
        <header className="analytics-pg-header">
          <h1>Translation Analytics</h1>
          <p>Loading your insights...</p>
        </header>
        <div className="analytics-stats-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="analytics-stat-card skeleton-card glass-card">
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
          <span>{error}</span>
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
        <motion.div className="analytics-empty glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="analytics-empty-icon">📊</div>
          <h3>No analytics yet</h3>
          <p>Start translating to see insights about your usage patterns, language preferences, and activity timeline.</p>
        </motion.div>
      </div>
    );
  }

  // Compute Today's translations count
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCount = (a.dailyCounts || []).find((d) => d.date === todayKey)?.count || 0;

  // Compute Favorite Target Language
  const favTargetLang = LANGUAGE_MAP[a.topTargetLang] || a.topTargetLang || '—';

  return (
    <div className="analytics-page">
      <header className="analytics-pg-header">
        <div>
          <h1>Translation Analytics</h1>
          <p>Insights from {a.totalTranslations} translation{a.totalTranslations !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <div className="analytics-stats-grid">
        <StatCard icon="📊" label="Total Translations" value={a.totalTranslations} delay={0.05} />
        <StatCard icon="📅" label="Today's Usage" value={todayCount} delay={0.1} />
        <StatCard icon="⭐" label="Favorite Language" value={favTargetLang} delay={0.15} />
        <StatCard icon="🎙️" label="Voice Translations" value={a.voiceCount} delay={0.2} />
        <StatCard icon="📝" label="Text Translations" value={a.textCount} delay={0.25} />
        <StatCard icon="✅" label="Success Rate" value="100%" delay={0.3} />
      </div>

      <div className="analytics-charts-grid">
        <div className="analytics-chart-card glass-card">
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">Usage Volume</h3>
            <div className="analytics-timeframe-selector">
              <button
                type="button"
                className={`timeframe-btn ${timeframe === 'weekly' ? 'active' : ''}`}
                onClick={() => setTimeframe('weekly')}
              >
                Weekly
              </button>
              <button
                type="button"
                className={`timeframe-btn ${timeframe === 'monthly' ? 'active' : ''}`}
                onClick={() => setTimeframe('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="chart-canvas-wrapper">
            <canvas ref={dailyChartRef} />
          </div>
        </div>

        <div className="analytics-chart-card glass-card">
          <h3 className="analytics-chart-title">Voice vs Text Breakdown</h3>
          <div className="chart-canvas-wrapper donut-wrapper">
            <canvas ref={donutChartRef} />
          </div>
        </div>

        <div className="analytics-chart-card horizontal-bar-chart-card glass-card" style={{ gridColumn: '1 / -1' }}>
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
                className="analytics-timeline-item glass-card"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <span className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-pair">
                    {LANGUAGE_MAP[item.inputLanguage] || item.inputLanguage} → {LANGUAGE_MAP[item.outputLanguage] || item.outputLanguage}
                  </span>
                  <span className="timeline-text">{item.originalText?.slice(0, 70)}{item.originalText?.length > 70 ? '...' : ''}</span>
                  <span className="timeline-time">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className={`timeline-type ${item.translationType || 'text'}`}>
                  {item.translationType === 'voice' ? '🎙️' : '📝'}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
