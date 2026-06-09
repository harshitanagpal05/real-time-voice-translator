import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RecentHistoryPanel.css';

const LANG_SHORT = {
  en: 'EN', es: 'ES', fr: 'FR', de: 'DE', ja: 'JA', zh: 'ZH',
  hi: 'HI', ar: 'AR', ru: 'RU', pt: 'PT', it: 'IT', ko: 'KO',
};

export default function RecentHistoryPanel({ history, onClear, onSpeak }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return history;
    const q = search.toLowerCase();
    return history.filter(
      (h) => h.original?.toLowerCase().includes(q) || h.translated?.toLowerCase().includes(q),
    );
  }, [history, search]);

  return (
    <aside className="recent-panel">
      <div className="recent-header">
        <h3 className="recent-title">Recent Translations</h3>
        <div className="recent-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="recent-list">
        <AnimatePresence>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                className="recent-entry"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ delay: idx * 0.02 }}
                layout
              >
                <div className="recent-entry-top">
                  <span className="recent-lang-pair">
                    {LANG_SHORT[item.source] || item.source} → {LANG_SHORT[item.target] || item.target}
                  </span>
                  <span className="recent-time">{item.time}</span>
                </div>
                <p className="recent-original">{item.original}</p>
                <div className="recent-translated-row">
                  <p className="recent-translated">{item.translated}</p>
                  <button
                    type="button"
                    className="recent-play-btn"
                    onClick={() => onSpeak?.(item.translated, item.target)}
                    title="Play translation"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="recent-empty">
              <p>{search ? 'No matches found' : 'No translations yet'}</p>
              <span>Start speaking to build history</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {history.length > 0 && (
        <button type="button" className="recent-clear-btn" onClick={onClear}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear History
        </button>
      )}
    </aside>
  );
}
