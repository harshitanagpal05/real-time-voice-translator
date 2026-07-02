export const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸', voiceSupport: true, textSupport: true },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸', voiceSupport: true, textSupport: true },
  { code: 'fr', label: 'French', nativeName: 'Français', flag: '🇫🇷', voiceSupport: true, textSupport: true },
  { code: 'de', label: 'German', nativeName: 'Deutsch', flag: '🇩🇪', voiceSupport: true, textSupport: true },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', flag: '🇯🇵', voiceSupport: true, textSupport: true },
  { code: 'ko', label: 'Korean', nativeName: '한국어', flag: '🇰🇷', voiceSupport: true, textSupport: true },
  { code: 'zh', label: 'Chinese', nativeName: '中文', flag: '🇨🇳', voiceSupport: true, textSupport: true },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', voiceSupport: true, textSupport: true },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', voiceSupport: true, textSupport: true },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', voiceSupport: true, textSupport: true },
  { code: 'ru', label: 'Russian', nativeName: 'Русский', flag: '🇷🇺', voiceSupport: true, textSupport: true },
  { code: 'it', label: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', voiceSupport: true, textSupport: true },
];

export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]));

/** BCP-47 tags for Web Speech API (SpeechRecognition + SpeechSynthesis) */
export const SPEECH_RECOGNITION_LANG = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN', hi: 'hi-IN',
  ar: 'ar-SA', pt: 'pt-BR', ru: 'ru-RU', it: 'it-IT',
};

export const SPEECH_SYNTHESIS_LANG = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN', hi: 'hi-IN',
  ar: 'ar-SA', pt: 'pt-BR', ru: 'ru-RU', it: 'it-IT',
};
