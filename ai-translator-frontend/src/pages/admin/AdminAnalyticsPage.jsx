import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { LANGUAGE_MAP, LANGUAGES } from '../../constants/languages';
import './admin.css';

Chart.register(...registerables);

function StatCard({ icon, iconClass, label, value, delay = 0 }) {
  return (
    <motion.div
      className="admin-stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className={`admin-stat-icon ${iconClass}`}>{icon}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </motion.div>
  );
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const dailyRef = useRef(null);
  const langRef = useRef(null);
  const trendRef = useRef(null);
  const dailyInst = useRef(null);
  const langInst = useRef(null);
  const trendInst = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    const style = getComputedStyle(document.documentElement);
    const purple = style.getPropertyValue('--accent-purple').trim() || '#7c3aed';
    const orange = style.getPropertyValue('--accent-orange').trim() || '#f97316';
    const magenta = style.getPropertyValue('--accent-magenta').trim() || '#c084fc';
    const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#8b8b9e';

    // Daily translations bar chart
    if (dailyRef.current) {
      if (dailyInst.current) dailyInst.current.destroy();
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      dailyInst.current = new Chart(dailyRef.current, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Translations',
            data: days.map(() => Math.floor(Math.random() * 50) + 10),
            backgroundColor: purple,
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: textSecondary } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: textSecondary } },
          },
        },
      });
    }

    // Language distribution pie chart
    if (langRef.current) {
      if (langInst.current) langInst.current.destroy();
      const langLabels = LANGUAGES.map((l) => l.label);
      const langData = LANGUAGES.map(() => Math.floor(Math.random() * 40) + 5);
      const colors = [purple, orange, magenta, '#06d6a0', '#f472b6', '#6366f1', '#fbbf24', '#38bdf8', '#f43f5e', '#34d399', '#a78bfa', '#fb923c'];

      langInst.current = new Chart(langRef.current, {
        type: 'doughnut',
        data: {
          labels: langLabels,
          datasets: [{ data: langData, backgroundColor: colors, borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: { legend: { position: 'right', labels: { color: textSecondary, font: { size: 10 }, padding: 8 } } },
        },
      });
    }

    // Active users trend line chart
    if (trendRef.current) {
      if (trendInst.current) trendInst.current.destroy();
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      trendInst.current = new Chart(trendRef.current, {
        type: 'line',
        data: {
          labels: weeks,
          datasets: [{
            label: 'Active Users',
            data: weeks.map(() => Math.floor(Math.random() * 20) + 5),
            borderColor: orange,
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: orange,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: textSecondary } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: textSecondary } },
          },
        },
      });
    }

    return () => {
      if (dailyInst.current) dailyInst.current.destroy();
      if (langInst.current) langInst.current.destroy();
      if (trendInst.current) trendInst.current.destroy();
    };
  }, [loading]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Translation Analytics
        </motion.h1>
        <p>Platform-wide translation usage and language insights</p>
      </header>

      <div className="admin-stats-grid">
        <StatCard icon="📊" iconClass="purple" label="Total Translations" value="—" delay={0.05} />
        <StatCard icon="🎤" iconClass="orange" label="Voice Translations" value="—" delay={0.1} />
        <StatCard icon="📝" iconClass="cyan" label="Text Translations" value="—" delay={0.15} />
        <StatCard icon="🌍" iconClass="pink" label="Languages Active" value="12" delay={0.2} />
      </div>

      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Daily Translations</h3>
          <div className="admin-chart-wrapper"><canvas ref={dailyRef} /></div>
        </div>
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Language Distribution</h3>
          <div className="admin-chart-wrapper"><canvas ref={langRef} /></div>
        </div>
      </div>

      <div className="admin-charts-grid">
        <div className="admin-chart-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="admin-chart-title">Active Users Trend</h3>
          <div className="admin-chart-wrapper"><canvas ref={trendRef} /></div>
        </div>
      </div>
    </div>
  );
}
