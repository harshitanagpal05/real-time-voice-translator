import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
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
      className="settings-card"
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
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  const { openPro } = useOutletContext() || {};
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState(settings.username);
  const [saved, setSaved] = useState(false);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveProfile = () => {
    updateSettings({ username: draftName });
    setEditingProfile(false);
    flashSaved();
  };

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <div>
          <button type="button" className="settings-back" onClick={() => navigate('/dashboard')}>← Back</button>
          <h1>Settings</h1>
          <p>Manage your profile, translation preferences, and appearance</p>
        </div>
        {saved && <motion.span className="settings-saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Saved ✓</motion.span>}
      </header>

      <div className="settings-grid">
        <SettingsCard icon="👤" title="Profile Settings" delay={0.05}>
          {!editingProfile ? (
            <>
              <div className="settings-field">
                <label>Username</label>
                <p className="settings-value">{settings.username || '—'}</p>
              </div>
              <div className="settings-field">
                <label>Email</label>
                <p className="settings-value">{settings.email || user?.email || '—'}</p>
              </div>
              <button type="button" className="settings-action-btn" onClick={() => { setDraftName(settings.username); setEditingProfile(true); }}>
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="settings-field">
                <label htmlFor="edit-name">Username</label>
                <input id="edit-name" className="settings-input" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
              </div>
              <div className="settings-row-btns">
                <button type="button" className="settings-action-btn" onClick={saveProfile}>Save</button>
                <button type="button" className="settings-action-btn ghost" onClick={() => setEditingProfile(false)}>Cancel</button>
              </div>
            </>
          )}
        </SettingsCard>

        <SettingsCard icon="🌐" title="Translation Preferences" delay={0.1}>
          <div className="settings-field">
            <label htmlFor="default-source">Default Input Language</label>
            <select
              id="default-source"
              className="settings-select"
              value={settings.defaultSourceLang}
              onChange={(e) => { updateSettings({ defaultSourceLang: e.target.value }); flashSaved(); }}
            >
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
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
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <Toggle
            label="Auto-detect language"
            checked={settings.autoDetectLanguage}
            onChange={(v) => { updateSettings({ autoDetectLanguage: v }); flashSaved(); }}
          />
          <Toggle
            label="Save translation history"
            checked={settings.saveHistory}
            onChange={(v) => { updateSettings({ saveHistory: v }); flashSaved(); }}
          />
        </SettingsCard>

        <SettingsCard icon="🔊" title="Voice Settings" delay={0.15}>
          <div className="settings-field">
            <label htmlFor="voice-speed">Voice Speed: {settings.voiceSpeed.toFixed(1)}x</label>
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
          <div className="settings-field">
            <label htmlFor="voice-type">Voice Type</label>
            <select
              id="voice-type"
              className="settings-select"
              value={settings.voiceType}
              onChange={(e) => { updateSettings({ voiceType: e.target.value }); flashSaved(); }}
            >
              <option value="default">Default</option>
              <option value="natural">Natural AI</option>
              <option value="premium">Premium (Pro)</option>
            </select>
          </div>
          <Toggle
            label="AI voice output enabled"
            checked={settings.aiVoiceEnabled}
            onChange={(v) => { updateSettings({ aiVoiceEnabled: v }); flashSaved(); }}
          />
        </SettingsCard>

        <SettingsCard icon="🎨" title="Appearance" delay={0.2}>
          <Toggle
            label="Dark mode"
            checked={settings.theme === 'dark'}
            onChange={(v) => { updateSettings({ theme: v ? 'dark' : 'light' }); flashSaved(); }}
          />
          <div className="settings-field">
            <label htmlFor="accent-theme">Theme Customization</label>
            <select
              id="accent-theme"
              className="settings-select"
              value={settings.accentTheme}
              onChange={(e) => { updateSettings({ accentTheme: e.target.value }); flashSaved(); }}
            >
              <option value="purple-orange">Purple & Orange (Default)</option>
              <option value="blue-cyan">Blue & Cyan</option>
              <option value="magenta-gold">Magenta & Gold</option>
            </select>
          </div>
        </SettingsCard>

        <SettingsCard icon="⚙️" title="Account" delay={0.25}>
          <button type="button" className="settings-action-btn" onClick={() => openPro?.()}>
            Manage Subscription
          </button>
          <button
            type="button"
            className="settings-action-btn danger"
            onClick={() => { logout(); navigate('/login', { replace: true }); }}
          >
            Logout
          </button>
        </SettingsCard>
      </div>
    </div>
  );
}
