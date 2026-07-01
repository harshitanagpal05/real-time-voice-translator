import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { fetchUserProfile } from '../api/userApi';
import { getToken } from '../utils/session';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../utils/settings';

const SettingsContext = createContext(null);

function resolveAppearance(appearance) {
  if (appearance === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return appearance;
}

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(() => loadSettings());

  // Apply theme, accent, appearance, accessibility to document
  useEffect(() => {
    const doc = document.documentElement;
    const resolved = resolveAppearance(settings.appearance || 'dark');

    // Appearance (dark/light/amoled)
    doc.setAttribute('data-theme', resolved);
    doc.setAttribute('data-accent', settings.accentTheme);

    doc.classList.remove('theme-light', 'theme-amoled');
    if (resolved === 'light') {
      doc.classList.add('theme-light');
    } else if (resolved === 'amoled') {
      doc.classList.add('theme-amoled');
    }

    // Font size
    const fontSizes = { small: '14px', medium: '16px', large: '18px' };
    doc.style.fontSize = fontSizes[settings.fontSize] || '16px';

    // Accessibility
    if (settings.highContrast) {
      doc.classList.add('high-contrast');
    } else {
      doc.classList.remove('high-contrast');
    }

    if (settings.reducedMotion) {
      doc.classList.add('reduced-motion');
    } else {
      doc.classList.remove('reduced-motion');
    }
  }, [settings.appearance, settings.accentTheme, settings.fontSize, settings.highContrast, settings.reducedMotion]);

  // Listen for system theme changes when appearance === 'system'
  useEffect(() => {
    if (settings.appearance !== 'system') return undefined;

    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      const doc = document.documentElement;
      const resolved = mq.matches ? 'light' : 'dark';
      doc.setAttribute('data-theme', resolved);
      doc.classList.remove('theme-light', 'theme-amoled');
      if (resolved === 'light') doc.classList.add('theme-light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.appearance]);

  const syncUserProfile = useCallback(async (user) => {
    if (!user) return;

    if (getToken()) {
      try {
        const profile = await fetchUserProfile();
        setSettingsState((prev) => {
          const next = {
            ...prev,
            username: profile.name || user.fullName || '',
            email: profile.email || user.email || '',
          };
          saveSettings(next);
          return next;
        });
        return;
      } catch {
        /* fall through to session data */
      }
    }

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
