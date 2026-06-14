import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from '../../constants/languages';
import './TranslatorPanel.css';

export default function TranslatorPanel({
  originalText,
  translatedText,
  sourceLang,
  targetLang,
  isListening,
  isTranslating,
  isSpeaking,
  onSourceChange,
  onTargetChange,
  onSwap,
  onSpeak,
}) {
  return (
    <div className="translator-panel" id="translator-panel">
      <motion.div
        className={`translation-card input-card ${isListening ? 'active' : ''}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-header">
          <span className="card-title">From Language</span>
          <select
            className="card-lang-select"
            value={sourceLang}
            onChange={(e) => onSourceChange(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>
        <div className="card-subheader">Detected Speech</div>
        <div className="card-body">
          <AnimatePresence mode="wait">
            {originalText ? (
              <motion.p key={originalText} className="card-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                {originalText}
              </motion.p>
            ) : (
              <p className="card-text placeholder">
                {isListening ? (
                  <span className="listening-indicator">
                    <span className="listening-bars"><span /><span /><span /><span /></span>
                    Listening...
                  </span>
                ) : 'Press Start to begin speaking'}
              </p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.button
        type="button"
        className="swap-center-btn"
        onClick={onSwap}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        title="Swap languages"
      >
        ⇄
      </motion.button>

      <motion.div
        className={`translation-card output-card ${isTranslating || isSpeaking ? 'active' : ''}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="card-header">
          <span className="card-title">To Language</span>
          <select
            className="card-lang-select"
            value={targetLang}
            onChange={(e) => onTargetChange(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>
        <div className="card-subheader">
          Translation
          {translatedText && <span className="translated-badge">Translated</span>}
        </div>
        <div className="card-body output-body">
          <AnimatePresence mode="wait">
            {translatedText ? (
              <motion.p key={translatedText} className="card-text translated-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                {translatedText}
              </motion.p>
            ) : (
              <p className="card-text placeholder">
                {isTranslating ? <span className="translating-shimmer">Translating...</span> : 'Translation will appear here'}
              </p>
            )}
          </AnimatePresence>
          {translatedText && (
            <motion.button
              type="button"
              className={`speaker-btn ${isSpeaking ? 'speaking' : ''}`}
              onClick={onSpeak}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title="Play translation"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
