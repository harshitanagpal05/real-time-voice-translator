import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { updateUserProfile } from '../api/userApi';
import { getToken } from '../utils/session';
import { LANGUAGES } from '../constants/languages';
import './SettingsPage.css';

const ACCENT_THEMES = [
  { value: 'purple-orange', label: 'Purple & Orange', colors: ['#6A0DAD', '#FF8C00'] },
  { value: 'blue-cyan', label: 'Blue & Cyan', colors: ['#2563eb', '#06b6d4'] },
  { value: 'magenta-gold', label: 'Magenta & Gold', colors: ['#c026d3', '#f59e0b'] },
  { value: 'green-teal', label: 'Green & Teal', colors: ['#059669', '#14b8a6'] },
  { value: 'red-rose', label: 'Red & Rose', colors: ['#dc2626', '#f43f5e'] },
  { value: 'indigo-violet', label: 'Indigo & Violet', colors: ['#4f46e5', '#8b5cf6'] },
  { value: 'sunset', label: 'Sunset', colors: ['#ea580c', '#fbbf24'] },
  { value: 'ocean', label: 'Ocean', colors: ['#0369a1', '#38bdf8'] },
];

const APPEARANCE_MODES = [
  { value: 'dark', label: '🌙 Dark', desc: 'Dark background with vivid accents' },
  { value: 'light', label: '☀️ Light', desc: 'Light background for daytime use' },
  { value: 'amoled', label: '🖤 AMOLED', desc: 'Pure black for OLED screens' },
  { value: 'system', label: '💻 System', desc: 'Follow your OS preference' },
];

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
  const { settings, updateSettings, resetSettings } = useSettings();
  const navigate = useNavigate();
  const { openPro } = useOutletContext() || {};
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState(settings.username);
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

  const handleNotificationToggle = async (enabled) => {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      updateSettings({ notificationsEnabled: permission === 'granted' });
    } else {
      updateSettings({ notificationsEnabled: false });
    }
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
        {/* Profile */}
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

        {/* Translation Preferences */}
        <SettingsCard icon="🌐" title="Translation Preferences" delay={0.1}>
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

        {/* Voice Settings */}
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

        {/* Appearance */}
        <SettingsCard icon="🎨" title="Appearance" delay={0.2}>
          <div className="settings-field">
            <label>Mode</label>
            <div className="settings-appearance-modes">
              {APPEARANCE_MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`appearance-mode-btn ${settings.appearance === m.value ? 'active' : ''}`}
                  onClick={() => { updateSettings({ appearance: m.value }); flashSaved(); }}
                >
                  <span className="appearance-mode-icon">{m.label.split(' ')[0]}</span>
                  <span className="appearance-mode-name">{m.label.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="settings-field">
            <label>Theme Customization</label>
            <div className="settings-theme-grid">
              {ACCENT_THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`theme-swatch ${settings.accentTheme === t.value ? 'active' : ''}`}
                  onClick={() => { updateSettings({ accentTheme: t.value }); flashSaved(); }}
                  title={t.label}
                >
                  <span
                    className="swatch-preview"
                    style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
                  />
                  <span className="swatch-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard icon="🔔" title="Notifications" delay={0.25}>
          <Toggle
            label="Enable browser notifications"
            checked={settings.notificationsEnabled}
            onChange={handleNotificationToggle}
          />
          <p className="settings-hint">
            Get notified when translations complete in the background.
          </p>
        </SettingsCard>

        {/* Accessibility */}
        <SettingsCard icon="♿" title="Accessibility" delay={0.3}>
          <div className="settings-field">
            <label htmlFor="font-size">Font Size</label>
            <select
              id="font-size"
              className="settings-select"
              value={settings.fontSize}
              onChange={(e) => { updateSettings({ fontSize: e.target.value }); flashSaved(); }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium (Default)</option>
              <option value="large">Large</option>
            </select>
          </div>
          <Toggle
            label="High contrast mode"
            checked={settings.highContrast}
            onChange={(v) => { updateSettings({ highContrast: v }); flashSaved(); }}
          />
          <Toggle
            label="Reduce motion"
            checked={settings.reducedMotion}
            onChange={(v) => { updateSettings({ reducedMotion: v }); flashSaved(); }}
          />
        </SettingsCard>

        {/* Account */}
        <SettingsCard icon="⚙️" title="Account" delay={0.35}>
          <button type="button" className="settings-action-btn" onClick={() => openPro?.()}>
            Manage Subscription
          </button>
          <button
            type="button"
            className="settings-action-btn ghost"
            onClick={() => { resetSettings(); flashSaved(); }}
          >
            Reset All Settings
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
