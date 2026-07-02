const SETTINGS_KEY = 'voxai_settings';

export const DEFAULT_SETTINGS = {
  username: '',
  email: '',
  defaultSourceLang: 'en',
  defaultTargetLang: 'es',
  autoDetectLanguage: false,
  saveHistory: true,
  voiceSpeed: 1,
  voiceType: 'natural',
  aiVoiceEnabled: true,
  theme: 'dark',
  accentTheme: 'purple-orange',
  appearance: 'dark',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  notificationsEnabled: false,
  favoriteLanguages: [],
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const loaded = raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    return {
      ...loaded,
      accentTheme: DEFAULT_SETTINGS.accentTheme,
    };
  } catch {
    return {
      ...DEFAULT_SETTINGS,
      accentTheme: DEFAULT_SETTINGS.accentTheme,
    };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getVoiceRate(speed) {
  const n = Number(speed);
  if (Number.isNaN(n)) return 0.95;
  return Math.min(1.5, Math.max(0.5, n));
}
