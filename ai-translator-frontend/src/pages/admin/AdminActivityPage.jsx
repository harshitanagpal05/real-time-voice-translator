import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAdminUsers } from '../../api/authApi';
import { getAllUsersLocalTranslations } from '../../api/translationHistoryApi';
import { LANGUAGE_MAP } from '../../constants/languages';
import './admin.css';

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

export default function AdminActivityPage() {
  const [users, setUsers] = useState([]);
  const [translations] = useState(() => getAllUsersLocalTranslations());
  const [loading, setLoading] = useState(true);

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

  // Generate activities from actual user registration data + actual translations history
  const activities = [
    ...users.map((u, i) => ({
      id: `reg-${u.email}-${i}`,
      text: `${u.fullName} registered on VoxAI`,
      email: u.email,
      time: u.date,
      type: 'registration',
    })),
    ...translations.map((t, i) => {
      const srcLabel = LANGUAGE_MAP[t.source] || t.source || 'Unknown';
      const tgtLabel = LANGUAGE_MAP[t.target] || t.target || 'Unknown';
      return {
        id: `trans-${t.id || i}`,
        text: `Translation request (${srcLabel} → ${tgtLabel}): "${t.original?.slice(0, 40)}${t.original?.length > 40 ? '...' : ''}"`,
        email: t.userEmail,
        time: t.createdAt,
        type: t.translationType || 'text',
      };
    })
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Recent Activity
        </motion.h1>
        <p>Platform-wide activity feed and event log</p>
      </header>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3>Activity Feed</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {activities.length} events
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '24px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div className="skeleton-line" style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-line w80" style={{ marginBottom: '6px' }} />
                  <div className="skeleton-line w40" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="admin-empty-state">
            <div className="empty-icon">📋</div>
            <h3>No activity yet</h3>
            <p>Platform events will appear here as users interact with VoxAI</p>
          </div>
        ) : (
          <div className="admin-timeline">
            {activities.map((item, i) => (
              <motion.div
                key={item.id}
                className="admin-timeline-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
              >
                <span className="admin-timeline-dot" />
                <div className="admin-timeline-content">
                  <div className="admin-timeline-text">
                    <strong>{item.text}</strong>
                    {item.email && (
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px', fontSize: '0.82rem' }}>
                        ({item.email})
                      </span>
                    )}
                  </div>
                  <div className="admin-timeline-time">
                    {new Date(item.time).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
