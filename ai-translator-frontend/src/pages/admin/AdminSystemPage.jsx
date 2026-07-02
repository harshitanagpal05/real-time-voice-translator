import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { checkBackendHealth } from '../../api/authApi';
import './admin.css';

export default function AdminSystemPage() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [checkTime, setCheckTime] = useState(null);

  useEffect(() => {
    checkBackendHealth()
      .then((ok) => {
        setBackendStatus(ok ? 'online' : 'offline');
        setCheckTime(new Date().toLocaleString());
      })
      .catch(() => {
        setBackendStatus('offline');
        setCheckTime(new Date().toLocaleString());
      });
  }, []);

  const handleRecheck = () => {
    setBackendStatus('checking');
    checkBackendHealth()
      .then((ok) => {
        setBackendStatus(ok ? 'online' : 'offline');
        setCheckTime(new Date().toLocaleString());
      })
      .catch(() => {
        setBackendStatus('offline');
        setCheckTime(new Date().toLocaleString());
      });
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          System Status
        </motion.h1>
        <p>Monitor backend health and platform infrastructure</p>
      </header>

      <div className="admin-system-grid">
        <motion.div
          className="admin-system-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3>Backend API</h3>
          <div className="admin-system-row">
            <span className="admin-system-label">Status</span>
            <span className="admin-system-value">
              <span className={`status-dot ${backendStatus}`} />
              {backendStatus === 'checking' ? 'Checking...' : backendStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Provider</span>
            <span className="admin-system-value">Render (FastAPI)</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Last Check</span>
            <span className="admin-system-value">{checkTime || '—'}</span>
          </div>
          <button
            type="button"
            className="admin-action-btn"
            onClick={handleRecheck}
            style={{ marginTop: '12px' }}
          >
            Recheck Status
          </button>
        </motion.div>

        <motion.div
          className="admin-system-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Frontend</h3>
          <div className="admin-system-row">
            <span className="admin-system-label">Framework</span>
            <span className="admin-system-value">React 19 + Vite 7</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Build</span>
            <span className="admin-system-value">Production</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Status</span>
            <span className="admin-system-value">
              <span className="status-dot online" />
              Running
            </span>
          </div>
        </motion.div>

        <motion.div
          className="admin-system-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3>Translation Services</h3>
          <div className="admin-system-row">
            <span className="admin-system-label">Primary</span>
            <span className="admin-system-value">FastAPI Backend</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Fallback</span>
            <span className="admin-system-value">MyMemory API</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Speech</span>
            <span className="admin-system-value">Web Speech API</span>
          </div>
        </motion.div>

        <motion.div
          className="admin-system-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Platform Info</h3>
          <div className="admin-system-row">
            <span className="admin-system-label">Version</span>
            <span className="admin-system-value">2.0.0</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Languages</span>
            <span className="admin-system-value">12</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Storage</span>
            <span className="admin-system-value">localStorage</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
