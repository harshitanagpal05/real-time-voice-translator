import { useState } from 'react';
import { motion } from 'framer-motion';
import './admin.css';

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          background: checked ? 'var(--accent-purple)' : 'var(--bg-elevated)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '23px' : '3px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
        }} />
      </button>
    </label>
  );
}

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            Admin Settings
          </motion.h1>
          <p>Configure platform-wide settings and preferences</p>
        </div>
        {saved && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}
          >
            Saved ✓
          </motion.span>
        )}
      </header>

      <div className="admin-system-grid">
        <motion.div
          className="admin-system-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3>Platform</h3>
          <Toggle
            label="Maintenance Mode"
            checked={maintenanceMode}
            onChange={(v) => { setMaintenanceMode(v); flashSaved(); }}
          />
          <Toggle
            label="Open Registration"
            checked={registrationOpen}
            onChange={(v) => { setRegistrationOpen(v); flashSaved(); }}
          />
          <Toggle
            label="Email Notifications"
            checked={emailNotifications}
            onChange={(v) => { setEmailNotifications(v); flashSaved(); }}
          />
        </motion.div>

        <motion.div
          className="admin-system-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Translation</h3>
          <div className="admin-system-row">
            <span className="admin-system-label">Max History</span>
            <span className="admin-system-value">50 per user</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Supported Languages</span>
            <span className="admin-system-value">12</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">API Timeout</span>
            <span className="admin-system-value">15s</span>
          </div>
        </motion.div>

        <motion.div
          className="admin-system-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3>Security</h3>
          <div className="admin-system-row">
            <span className="admin-system-label">Authentication</span>
            <span className="admin-system-value">JWT Bearer</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Session Storage</span>
            <span className="admin-system-value">localStorage</span>
          </div>
          <div className="admin-system-row">
            <span className="admin-system-label">Password Policy</span>
            <span className="admin-system-value">6+ chars, alphanumeric</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
