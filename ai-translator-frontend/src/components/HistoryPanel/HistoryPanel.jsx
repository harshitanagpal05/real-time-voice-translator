/**
 * HistoryPanel.jsx
 * Sidebar panel showing translation history with clear functionality.
 * Uses Framer Motion for smooth list animations.
 */

import { motion, AnimatePresence } from 'framer-motion';
import './HistoryPanel.css';

const LANGUAGES = {
  en: 'EN', hi: 'HI', es: 'ES', fr: 'FR',
  de: 'DE', ja: 'JA', zh: 'ZH', ar: 'AR',
  ru: 'RU', pt: 'PT', it: 'IT', ko: 'KO',
};

export default function HistoryPanel({ history, onClear, isOpen, onToggle, hideToggle = false }) {
  return (
    <>
      {!hideToggle && (
        <button type="button" className="history-toggle-btn" onClick={onToggle} id="history-toggle-btn">
          <span className="history-toggle-icon">{isOpen ? '✕' : '📜'}</span>
          {!isOpen && history.length > 0 && (
            <span className="history-badge">{history.length}</span>
          )}
        </button>
      )}

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="history-panel"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            id="history-panel"
          >
            {/* Header */}
            <div className="history-header">
              <h3 className="history-title">
                <span>📜</span> History
              </h3>
              {history.length > 0 && (
                <button
                  className="history-clear-btn"
                  onClick={onClear}
                  title="Clear all history"
                  id="clear-history-btn"
                >
                  Clear
                </button>
              )}
            </div>

            {/* List */}
            <div className="history-list">
              <AnimatePresence>
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <motion.div
                      key={item.id || idx}
                      className="history-entry"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.03 }}
                      layout
                    >
                      <div className="history-entry-header">
                        <span className="history-lang-pair">
                          {LANGUAGES[item.source] || item.source} → {LANGUAGES[item.target] || item.target}
                        </span>
                        <span className="history-time">{item.time}</span>
                      </div>
                      <p className="history-original">{item.original}</p>
                      <p className="history-translated">{item.translated}</p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="history-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="history-empty-icon">🕐</span>
                    <p>No translations yet</p>
                    <p className="history-empty-sub">Start speaking to build your history</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
