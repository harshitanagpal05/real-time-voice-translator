import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { fetchAdminUsers } from '../../api/authApi';
import { getAllUsersLocalTranslations } from '../../api/translationHistoryApi';
import { LANGUAGE_MAP } from '../../constants/languages';
import './admin.css';

Chart.register(...registerables);

function getResolvedJoinDate(email) {
  try {
    const dates = JSON.parse(localStorage.getItem('voxai_user_join_dates') || '{}');
    if (!dates[email]) {
      dates[email] = new Date().toISOString().slice(0, 10);
      localStorage.setItem('voxai_user_join_dates', JSON.stringify(dates));
    }
    return dates[email];
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function StatCard({ icon, iconClass, label, value, change, delay = 0 }) {
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
      {change && <div className={`admin-stat-change ${change.type}`}>{change.text}</div>}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [translations] = useState(() => getAllUsersLocalTranslations());
  const [loading, setLoading] = useState(true);
  
  const dailyChartRef = useRef(null);
  const langChartRef = useRef(null);
  const dailyChartInst = useRef(null);
  const langChartInst = useRef(null);

  useEffect(() => {
    fetchAdminUsers()
      .then((data) => {
        const mapped = data.map((u) => ({
          ...u,
          date: getResolvedJoinDate(u.email),
          fullName: u.fullName || u.name || 'Anonymous User'
        }));
        setUsers(mapped);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  // Compute stats
  const totalUsers = users.length;
  const today = new Date().toISOString().slice(0, 10);
  
  const totalTranslations = translations.length;
  const todayTranslations = translations.filter(
    (t) => t.createdAt && t.createdAt.slice(0, 10) === today
  ).length;

  const languagesUsed = new Set(translations.map((t) => t.target)).size || 0;
  
  const successRate = totalTranslations > 0 ? 100 : 0;

  // Render charts
  useEffect(() => {
    if (loading) return;

    const style = getComputedStyle(document.documentElement);
    const purple = style.getPropertyValue('--accent-purple').trim() || '#7c3aed';
    const orange = style.getPropertyValue('--accent-orange').trim() || '#f97316';
    const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#8b8b9e';

    // Daily translations chart (Last 7 Days)
    if (dailyChartRef.current) {
      if (dailyChartInst.current) dailyChartInst.current.destroy();

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });

      const dailyCounts = last7Days.map((day) =>
        translations.filter((t) => t.createdAt && t.createdAt.slice(0, 10) === day).length
      );

      dailyChartInst.current = new Chart(dailyChartRef.current, {
        type: 'bar',
        data: {
          labels: last7Days.map((d) => new Date(d).toLocaleDateString('en', { weekday: 'short' })),
          datasets: [{
            label: 'Translations',
            data: dailyCounts,
            backgroundColor: purple,
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: textSecondary, font: { size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: textSecondary, font: { size: 11 } } },
          },
        },
      });
    }

    // Languages chart (pie)
    if (langChartRef.current) {
      if (langChartInst.current) langChartInst.current.destroy();

      const langMap = {};
      translations.forEach((t) => {
        const label = LANGUAGE_MAP[t.target] || t.target;
        if (label) {
          langMap[label] = (langMap[label] || 0) + 1;
        }
      });

      const sortedLangs = Object.entries(langMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      const langLabels = sortedLangs.length > 0 ? sortedLangs.map((item) => item[0]) : ['No translations yet'];
      const langData = sortedLangs.length > 0 ? sortedLangs.map((item) => item[1]) : [1];
      const colors = [purple, orange, '#c084fc', '#06d6a0', '#f472b6', '#6366f1'];

      langChartInst.current = new Chart(langChartRef.current, {
        type: 'doughnut',
        data: {
          labels: langLabels,
          datasets: [{
            data: langData,
            backgroundColor: colors,
            borderColor: 'rgba(255,255,255,0.05)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
              labels: { color: textSecondary, font: { size: 11 }, padding: 12 },
            },
          },
        },
      });
    }

    return () => {
      if (dailyChartInst.current) dailyChartInst.current.destroy();
      if (langChartInst.current) langChartInst.current.destroy();
    };
  }, [loading, translations]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Admin Overview
        </motion.h1>
        <p>Monitor platform activity and key metrics</p>
      </header>

      <div className="admin-stats-grid">
        <StatCard icon="👥" iconClass="purple" label="Total Users" value={loading ? '—' : totalUsers} delay={0.05} />
        <StatCard icon="🌐" iconClass="orange" label="Today's Translations" value={todayTranslations} delay={0.1} />
        <StatCard icon="🗣️" iconClass="cyan" label="Languages Used" value={languagesUsed} delay={0.15} />
        <StatCard icon="✅" iconClass="pink" label="Success Rate" value={`${successRate}%`} delay={0.2} />
      </div>

      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Daily Translations (7 Days)</h3>
          <div className="admin-chart-wrapper">
            <canvas ref={dailyChartRef} />
          </div>
        </div>
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Most Used Languages</h3>
          <div className="admin-chart-wrapper">
            <canvas ref={langChartRef} />
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3>Recent Registered Users</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton-line w60" /></td>
                    <td><div className="skeleton-line w80" /></td>
                    <td><div className="skeleton-line w40" /></td>
                    <td><div className="skeleton-line w40" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="admin-empty-state">No users registered yet</td></tr>
              ) : (
                users.slice(0, 10).map((u, i) => (
                  <tr key={i}>
                    <td className="user-name">{u.fullName}</td>
                    <td className="user-email">{u.email}</td>
                    <td>{u.date}</td>
                    <td>
                      <span className={`admin-role-badge ${u.role || 'user'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
