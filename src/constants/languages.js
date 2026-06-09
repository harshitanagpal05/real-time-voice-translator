export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
];

export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.code, l.label]));

/** BCP-47 tags for Web Speech API (SpeechRecognition + SpeechSynthesis) */
export const SPEECH_RECOGNITION_LANG = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  zh: 'zh-CN',
  hi: 'hi-IN',
  ar: 'ar-SA',
  ru: 'ru-RU',
  pt: 'pt-BR',
  it: 'it-IT',
  ko: 'ko-KR',
};

export const SPEECH_SYNTHESIS_LANG = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  zh: 'zh-CN',
  hi: 'hi-IN',
  ar: 'ar-SA',
  ru: 'ru-RU',
  pt: 'pt-BR',
  it: 'it-IT',
  ko: 'ko-KR',
};
