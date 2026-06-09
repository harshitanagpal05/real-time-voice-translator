import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../utils/settings';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(() => loadSettings());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-accent', settings.accentTheme);
    if (settings.theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [settings.theme, settings.accentTheme]);

  const syncUserProfile = useCallback((user) => {
    if (!user) return;
    setSettingsState((prev) => {
      const next = {
        ...prev,
        username: prev.username || user.fullName || user.email?.split('@')[0] || '',
        email: prev.email || user.email || '',
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings({ ...DEFAULT_SETTINGS });
    setSettingsState({ ...DEFAULT_SETTINGS });
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings, syncUserProfile }),
    [settings, updateSettings, resetSettings, syncUserProfile],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
