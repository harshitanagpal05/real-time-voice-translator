import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from '../../constants/languages';
import './TranslatorPanel.css';

export default function TranslatorPanel({
  mode = 'voice',
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
  onOriginalTextChange,
  onTranslate,
  onClear,
}) {
  const [copied, setCopied] = useState(false);

  const handleTextareaChange = (e) => {
    const val = e.target.value;
    if (val.length <= 5000) {
      onOriginalTextChange?.(val);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="translator-panel" id="translator-panel">
      <motion.div
        className={`translation-card input-card ${isListening || (mode === 'text' && originalText) ? 'active' : ''}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-header">
          <span className="card-title">From Language</span>
          <select
            className="card-lang-select"
            value={sourceLang}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={isTranslating}
          >
            <option value="auto">🔍 Auto Detect</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>
        <div className="card-subheader">
          {mode === 'voice' ? '🎙 Detected Speech' : '⌨ Enter Text'}
        </div>
        <div className="card-body">
          {mode === 'voice' ? (
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
          ) : (
            <div className="text-input-wrapper">
              <textarea
                className="card-textarea"
                placeholder="Type or paste text to translate..."
                value={originalText || ''}
                onChange={handleTextareaChange}
                disabled={isTranslating}
                rows={4}
              />
              <div className="input-card-footer">
                <span className="char-counter">{originalText?.length || 0} / 5000</span>
                <div className="input-actions">
                  {(originalText || translatedText) && (
                    <button type="button" className="action-btn-clear" onClick={onClear} disabled={isTranslating}>
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    className="action-btn-translate"
                    onClick={onTranslate}
                    disabled={isTranslating || !originalText?.trim()}
                  >
                    {isTranslating ? (
                      <span className="loading-spinner-wrapper">
                        <span className="mini-spinner" />
                        Translating...
                      </span>
                    ) : 'Translate'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.button
        type="button"
        className="swap-center-btn"
        onClick={onSwap}
        disabled={isTranslating}
        whileHover={isTranslating ? {} : { scale: 1.1, rotate: 180 }}
        whileTap={isTranslating ? {} : { scale: 0.9 }}
        title="Swap languages"
      >
        ⇄
      </motion.button>

      <motion.div
        className={`translation-card output-card ${isTranslating || isSpeaking || translatedText ? 'active' : ''}`}
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
            disabled={isTranslating}
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
          <div className="output-content">
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
          </div>
          {translatedText && (
            <div className="output-actions-row">
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
              <motion.button
                type="button"
                className={`copy-output-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                title="Copy translation"
              >
                {copied ? (
                  <span className="copied-checkmark">✓</span>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
