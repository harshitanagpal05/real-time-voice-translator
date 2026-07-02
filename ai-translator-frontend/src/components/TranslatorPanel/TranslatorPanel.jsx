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
  const [favorited, setFavorited] = useState(false);

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

  const handleDownload = () => {
    if (!translatedText) return;
    const srcLabel = LANGUAGES.find((l) => l.code === sourceLang)?.label || sourceLang;
    const tgtLabel = LANGUAGES.find((l) => l.code === targetLang)?.label || targetLang;
    const content = `VoxAI Translation\n${'═'.repeat(40)}\n\nFrom: ${srcLabel}\n${originalText || ''}\n\nTo: ${tgtLabel}\n${translatedText}\n\nTranslated at: ${new Date().toLocaleString()}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxai-translation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!translatedText) return;
    const text = `${originalText || ''}\n\n→ ${translatedText}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'VoxAI Translation', text });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sourceLangObj = LANGUAGES.find((l) => l.code === sourceLang);
  const targetLangObj = LANGUAGES.find((l) => l.code === targetLang);

  return (
    <div className="translator-panel" id="translator-panel">
      {/* Input Card */}
      <motion.div
        className={`translation-card input-card ${isListening || (mode === 'text' && originalText) ? 'active' : ''}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-header">
          <span className="card-title">From</span>
          <div className="card-lang-selector">
            {sourceLangObj && <span className="card-lang-flag">{sourceLangObj.flag}</span>}
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

      {/* Swap Button */}
      <motion.button
        type="button"
        className="swap-center-btn"
        onClick={onSwap}
        disabled={isTranslating}
        whileHover={isTranslating ? {} : { scale: 1.1, rotate: 180 }}
        whileTap={isTranslating ? {} : { scale: 0.9 }}
        title="Swap languages"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="7 16 3 12 7 8" />
          <line x1="21" y1="12" x2="3" y2="12" />
          <polyline points="17 8 21 12 17 16" />
        </svg>
      </motion.button>

      {/* Output Card */}
      <motion.div
        className={`translation-card output-card ${isTranslating || isSpeaking || translatedText ? 'active' : ''}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="card-header">
          <span className="card-title">To</span>
          <div className="card-lang-selector">
            {targetLangObj && <span className="card-lang-flag">{targetLangObj.flag}</span>}
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
                className={`output-action-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={onSpeak}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Play translation"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                Play
              </motion.button>

              <motion.button
                type="button"
                className={`output-action-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Copy translation"
              >
                {copied ? '✓ Copied' : (
                  <>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                className={`output-action-btn ${favorited ? 'favorited' : ''}`}
                onClick={() => setFavorited((v) => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorited ? '★' : '☆'} Favorite
              </motion.button>

              <motion.button
                type="button"
                className="output-action-btn"
                onClick={handleDownload}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Download translation"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </motion.button>

              <motion.button
                type="button"
                className="output-action-btn"
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Share translation"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
