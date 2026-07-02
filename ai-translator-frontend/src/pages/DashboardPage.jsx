import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import useTranslator from '../hooks/useTranslator';
import { SPEECH_SYNTHESIS_LANG } from '../constants/languages';
import RecentHistoryPanel from '../components/RecentHistoryPanel/RecentHistoryPanel';
import VoiceOrb from '../components/VoiceOrb/VoiceOrb';
import AudioVisualizer from '../components/AudioVisualizer/AudioVisualizer';
import TranslatorPanel from '../components/TranslatorPanel/TranslatorPanel';
import './DashboardPage.css';

function getStatusLabel({ error, isListening, isTranslating, isSpeaking }) {
  if (error) return 'Error';
  if (isListening) return 'Listening...';
  if (isTranslating) return 'Translating...';
  if (isSpeaking) return 'Speaking...';
  return 'Ready';
}

export default function DashboardPage() {
  const { settings } = useSettings();
  const translateRef = useRef(null);
  const historyRef = useRef(null);
  const languagesRef = useRef(null);
  const [mode, setMode] = useState('voice'); // 'voice' | 'text'

  const {
    sourceLang, targetLang,
    originalText, translatedText,
    isListening, isTranslating, isSpeaking,
    voiceEnabled, error, history,
    setSourceLang, setTargetLang, setVoiceEnabled,
    startListening, stopListening, swapLanguages, clearHistory,
    speakTranslation, clearError, translateManualText,
    setOriginalText, setTranslatedText,
  } = useTranslator();

  useEffect(() => {
    setSourceLang(settings.defaultSourceLang);
    setTargetLang(settings.defaultTargetLang);
    setVoiceEnabled(settings.aiVoiceEnabled);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.defaultSourceLang, settings.defaultTargetLang, settings.aiVoiceEnabled]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'history' || hash === 'languages') {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, []);

  const speakHistoryItem = useCallback((text, lang) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_SYNTHESIS_LANG[lang] || lang;
    u.rate = settings.voiceSpeed || 1;
    window.speechSynthesis.speak(u);
  }, [settings.voiceSpeed]);

  const statusLabel = getStatusLabel({ error, isListening, isTranslating, isSpeaking });
  const statusActive = isListening || isTranslating || isSpeaking;
  const statusError = !!error;

  return (
    <div className="dashboard-page-inner">
      <main className="dashboard-center">
        {/* Header */}
        <header className="dash-top-header">
          <div>
            <motion.h1
              className="dash-brand"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              VoxAI
            </motion.h1>
            <p className="dash-tagline">
              <span className="dash-tagline-gradient">Speak. Translate. Connect.</span>
            </p>
          </div>
          <div className="dash-header-right">
            <label className="dash-voice-toggle">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={() => setVoiceEnabled((v) => !v)}
              />
              <span className="dash-toggle-track">
                <span className="dash-toggle-thumb" />
              </span>
              <span className="dash-toggle-label">Auto voice</span>
            </label>
          </div>
        </header>

        {/* Translation Mode Selector */}
        <div className="dash-mode-selector-wrapper">
          <div className="dash-mode-selector">
            <button
              type="button"
              className={`dash-mode-btn ${mode === 'voice' ? 'active' : ''}`}
              onClick={() => { setMode('voice'); stopListening(); }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 14c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v5c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5" />
              </svg>
              Voice
            </button>
            <button
              type="button"
              className={`dash-mode-btn ${mode === 'text' ? 'active' : ''}`}
              onClick={() => { setMode('text'); stopListening(); }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
              </svg>
              Text
            </button>
            <motion.div
              className="dash-mode-indicator"
              animate={{ x: mode === 'voice' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div className="dash-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
              <button type="button" onClick={clearError} className="dash-error-dismiss" aria-label="Dismiss">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Controls */}
        <AnimatePresence mode="wait">
          {mode === 'voice' && (
            <motion.div
              key="voice-controls"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <section className="dash-orb-area" ref={translateRef}>
                <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} isTranslating={isTranslating} />
                <VoiceOrb isListening={isListening} isSpeaking={isSpeaking} isTranslating={isTranslating} showStatus={false} />
                <div className={`dash-listening-label ${statusError ? 'error' : ''} ${statusActive ? 'active' : ''}`}>
                  <span className={`dash-live-dot ${statusActive ? 'on' : ''} ${statusError ? 'error' : ''}`} />
                  {statusLabel}
                </div>
              </section>

              <div className="dash-controls-row">
                {!isListening ? (
                  <motion.button
                    type="button"
                    className="dash-control-btn start"
                    onClick={startListening}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    id="start-btn"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 14c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v5c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                    Start Translation
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    className="dash-control-btn stop"
                    onClick={stopListening}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    id="stop-btn"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    Stop Translation
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translator Panel */}
        <section className="dash-cards-area" id="languages" ref={languagesRef}>
          <TranslatorPanel
            mode={mode}
            originalText={originalText}
            translatedText={translatedText}
            sourceLang={sourceLang}
            targetLang={targetLang}
            isListening={isListening}
            isTranslating={isTranslating}
            isSpeaking={isSpeaking}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
            onSwap={swapLanguages}
            onSpeak={speakTranslation}
            onOriginalTextChange={setOriginalText}
            onTranslate={() => translateManualText(originalText)}
            onClear={() => { setOriginalText(''); setTranslatedText(''); }}
          />
        </section>

        {/* Feature chips */}
        <section className="dash-features">
          {[
            { icon: '⚡', label: 'Real-time' },
            { icon: '🌍', label: '12 Languages' },
            { icon: '🎙️', label: 'AI Voice' },
            { icon: '🔒', label: 'Private' },
          ].map((f) => (
            <motion.div
              key={f.label}
              className="dash-feature-chip"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <span>{f.icon}</span>
              {f.label}
            </motion.div>
          ))}
        </section>

        <footer className="dash-footer">
          <div className="dash-footer-left">
            <span className="dash-footer-live"><span className="dash-live-dot on" /> Live</span>
            <span>Powered by AI</span>
            <span>Secure &amp; Private</span>
          </div>
        </footer>
      </main>

      <div id="history" ref={historyRef}>
        <RecentHistoryPanel
          history={history}
          onClear={clearHistory}
          onSpeak={speakHistoryItem}
        />
      </div>
    </div>
  );
}
