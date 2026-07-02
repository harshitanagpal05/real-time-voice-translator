import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { updateUserProfile } from '../api/userApi';
import { getToken } from '../utils/session';
import { LANGUAGES } from '../constants/languages';
import './SettingsPage.css';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="settings-toggle">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle-track ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-thumb" />
      </button>
    </label>
  );
}

function SettingsCard({ icon, title, children, delay = 0 }) {
  return (
    <motion.section
      className="settings-card glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="settings-card-header">
        <span className="settings-card-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="settings-card-body">{children}</div>
    </motion.section>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { settings, updateSettings, resetSettings } = useSettings();
  const navigate = useNavigate();

  const [editingProfile, setEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState(settings.username);
  
  const [passwordDraft, setPasswordDraft] = useState({ current: '', new: '', confirm: '' });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveProfile = async () => {
    try {
      if (getToken()) {
        await updateUserProfile({ name: draftName.trim() });
      }
      updateSettings({ username: draftName.trim() });
      setEditingProfile(false);
      flashSaved();
    } catch {
      flashSaved();
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordDraft.current || !passwordDraft.new || !passwordDraft.confirm) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (passwordDraft.new !== passwordDraft.confirm) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (passwordDraft.new.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    // Success Mockup
    setPasswordSuccess(true);
    setPasswordDraft({ current: '', new: '', confirm: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleNotificationToggle = async (enabled) => {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      updateSettings({ notificationsEnabled: permission === 'granted' });
    } else {
      updateSettings({ notificationsEnabled: false });
    }
    flashSaved();
  };

  const handleDeleteAccount = () => {
    // Perform deletion client-side cleanout & logout
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile, translation preferences, and account security</p>
        </div>
        {saved && <motion.span className="settings-saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Saved ✓</motion.span>}
      </header>

      <div className="settings-grid">
        {/* Profile Settings */}
        <SettingsCard icon="👤" title="Profile Settings" delay={0.05}>
          {!editingProfile ? (
            <>
              <div className="settings-field">
                <label>Username</label>
                <p className="settings-value">{settings.username || '—'}</p>
              </div>
              <div className="settings-field">
                <label>Email Address</label>
                <p className="settings-value">{settings.email || user?.email || '—'}</p>
              </div>
              <button type="button" className="btn-ghost" onClick={() => { setDraftName(settings.username); setEditingProfile(true); }}>
                Edit Profile
              </button>
            </>
          ) : (
            <div className="settings-form">
              <div className="settings-field">
                <label htmlFor="edit-name">Username</label>
                <input id="edit-name" className="settings-input" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
              </div>
              <div className="settings-row-btns">
                <button type="button" className="btn-primary" onClick={saveProfile}>Save Changes</button>
                <button type="button" className="btn-ghost" onClick={() => setEditingProfile(false)}>Cancel</button>
              </div>
            </div>
          )}
        </SettingsCard>

        {/* Security / Password */}
        <SettingsCard icon="🔒" title="Security & Password" delay={0.1}>
          <form className="settings-form" onSubmit={handlePasswordChange}>
            {passwordSuccess && <div className="settings-message success">Password changed successfully.</div>}
            {passwordError && <div className="settings-message error">{passwordError}</div>}
            
            <div className="settings-field">
              <label htmlFor="curr-pwd">Current Password</label>
              <input
                id="curr-pwd"
                type="password"
                className="settings-input"
                value={passwordDraft.current}
                onChange={(e) => setPasswordDraft({ ...passwordDraft, current: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="new-pwd">New Password</label>
              <input
                id="new-pwd"
                type="password"
                className="settings-input"
                value={passwordDraft.new}
                onChange={(e) => setPasswordDraft({ ...passwordDraft, new: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="conf-pwd">Confirm New Password</label>
              <input
                id="conf-pwd"
                type="password"
                className="settings-input"
                value={passwordDraft.confirm}
                onChange={(e) => setPasswordDraft({ ...passwordDraft, confirm: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-ghost">Update Password</button>
          </form>
        </SettingsCard>

        {/* Translation & Voice Output */}
        <SettingsCard icon="🔊" title="Voice & Translation" delay={0.15}>
          <div className="settings-field">
            <label htmlFor="default-source">Default Input Language</label>
            <select
              id="default-source"
              className="settings-select"
              value={settings.defaultSourceLang}
              onChange={(e) => { updateSettings({ defaultSourceLang: e.target.value }); flashSaved(); }}
            >
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
          <div className="settings-field">
            <label htmlFor="default-target">Default Output Language</label>
            <select
              id="default-target"
              className="settings-select"
              value={settings.defaultTargetLang}
              onChange={(e) => { updateSettings({ defaultTargetLang: e.target.value }); flashSaved(); }}
            >
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
          <div className="settings-field">
            <label htmlFor="voice-speed">Voice Playback Speed: {settings.voiceSpeed.toFixed(1)}x</label>
            <input
              id="voice-speed"
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={settings.voiceSpeed}
              className="settings-range"
              onChange={(e) => { updateSettings({ voiceSpeed: parseFloat(e.target.value) }); flashSaved(); }}
            />
          </div>
          <Toggle
            label="Auto voice output play"
            checked={settings.aiVoiceEnabled}
            onChange={(v) => { updateSettings({ aiVoiceEnabled: v }); flashSaved(); }}
          />
          <Toggle
            label="Save translation history logs"
            checked={settings.saveHistory}
            onChange={(v) => { updateSettings({ saveHistory: v }); flashSaved(); }}
          />
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard icon="🔔" title="Notifications" delay={0.2}>
          <Toggle
            label="Enable browser push notifications"
            checked={settings.notificationsEnabled}
            onChange={handleNotificationToggle}
          />
          <p className="settings-hint">
            Alert me when background translation tasks are finished.
          </p>
        </SettingsCard>

        {/* Danger Zone Account Options */}
        <SettingsCard icon="⚠️" title="Danger Zone" delay={0.25}>
          <p className="settings-hint danger">
            Once you delete your account, all history logs, analytics, and preference settings will be permanently wiped.
          </p>
          <div className="settings-danger-actions">
            <button
              type="button"
              className="btn-ghost danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { resetSettings(); flashSaved(); }}
            >
              Reset Settings
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="settings-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <motion.div
              className="settings-modal-content glass-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
            >
              <h2>Confirm Account Deletion</h2>
              <p>Are you absolutely sure you want to delete your account? This action is immediate and cannot be undone.</p>
              <div className="settings-modal-buttons">
                <button type="button" className="btn-primary danger" onClick={handleDeleteAccount}>
                  Yes, Delete My Account
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
