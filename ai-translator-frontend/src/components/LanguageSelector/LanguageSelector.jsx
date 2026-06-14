/**
 * LanguageSelector.jsx
 * Styled language dropdown selectors with swap button animation.
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import './LanguageSelector.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ru', label: 'Russian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'ko', label: 'Korean' },
];

export default function LanguageSelector({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
}) {
  const [swapRotation, setSwapRotation] = useState(0);

  const handleSwap = () => {
    setSwapRotation((prev) => prev + 180);
    onSwap();
  };

  return (
    <div className="language-selector" id="language-selector">
      {/* Source Language */}
      <div className="lang-select-group">
        <label className="lang-label">Input</label>
        <div className="lang-dropdown-wrapper">
          <span className="lang-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v5c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </span>
          <select
            className="lang-dropdown"
            value={sourceLang}
            onChange={(e) => onSourceChange(e.target.value)}
            id="source-lang-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Swap Button */}
      <motion.button
        className="swap-btn"
        onClick={handleSwap}
        animate={{ rotate: swapRotation }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        title="Swap languages"
        id="swap-lang-btn"
      >
        ⇄
      </motion.button>

      {/* Target Language */}
      <div className="lang-select-group">
        <label className="lang-label">Output</label>
        <div className="lang-dropdown-wrapper">
          <span className="lang-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
          </span>
          <select
            className="lang-dropdown"
            value={targetLang}
            onChange={(e) => onTargetChange(e.target.value)}
            id="target-lang-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
