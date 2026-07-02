import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import {
  fetchTranslationHistory,
  deleteTranslationHistory,
  clearTranslationHistory,
  toggleFavoriteTranslation,
} from '../api/translationHistoryApi';
import { LANGUAGE_MAP, SPEECH_SYNTHESIS_LANG } from '../constants/languages';
import './HistoryPage.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'source', label: 'Source Language' },
  { value: 'target', label: 'Target Language' },
];

const TIME_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'favorites', label: '⭐ Favorites' },
];

function SkeletonRow() {
  return (
    <div className="history-skeleton-row glass-card">
      <div className="skeleton-line w40" />
      <div className="skeleton-line w80" />
      <div className="skeleton-line w60" />
    </div>
  );
}

export default function HistoryPage() {
  const { settings } = useSettings();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [timeFilter, setTimeFilter] = useState('all');
  const [langPairFilter, setLangPairFilter] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const items = await fetchTranslationHistory();
      setHistory(items);
    } catch {
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadHistory]);

  const langPairs = useMemo(() => {
    const pairs = new Set();
    history.forEach((h) => pairs.add(`${h.source}→${h.target}`));
    return Array.from(pairs);
  }, [history]);

  // Date helper functions
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  };

  const isLastWeek = (date) => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    return date >= oneWeekAgo && date < new Date(today.setHours(0, 0, 0, 0));
  };

  const filtered = useMemo(() => {
    let items = [...history];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (h) => h.original?.toLowerCase().includes(q) || h.translated?.toLowerCase().includes(q)
      );
    }

    // Time/Favorites filter
    if (timeFilter !== 'all') {
      items = items.filter((h) => {
        const date = new Date(h.rawTime);
        if (timeFilter === 'today') return isToday(date);
        if (timeFilter === 'yesterday') return isYesterday(date);
        if (timeFilter === 'lastWeek') return isLastWeek(date);
        if (timeFilter === 'favorites') return !!h.isFavorite;
        return true;
      });
    }

    // Lang pair filter
    if (langPairFilter !== 'all') {
      items = items.filter((h) => `${h.source}→${h.target}` === langPairFilter);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        items.sort((a, b) => new Date(a.rawTime) - new Date(b.rawTime));
        break;
      case 'source':
        items.sort((a, b) => (LANGUAGE_MAP[a.source] || a.source).localeCompare(LANGUAGE_MAP[b.source] || b.source));
        break;
      case 'target':
        items.sort((a, b) => (LANGUAGE_MAP[a.target] || a.target).localeCompare(LANGUAGE_MAP[b.target] || b.target));
        break;
      default: // newest
        items.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));
    }

    return items;
  }, [history, search, timeFilter, langPairFilter, sortBy]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteTranslationHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch {
      setError('Failed to delete. Please try again.');
    }
  };

  const handleToggleFavorite = async (e, id) => {
    e.stopPropagation();
    try {
      await toggleFavoriteTranslation(id);
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isFavorite: !h.isFavorite } : h))
      );
      if (selectedItem?.id === id) {
        setSelectedItem((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
      }
    } catch {
      setError('Failed to toggle favorite.');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearTranslationHistory();
      setHistory([]);
      setConfirmClear(false);
      setSelectedItem(null);
    } catch {
      setError('Failed to clear history. Please try again.');
    }
  };

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSpeak = (e, text, lang) => {
    e.stopPropagation();
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_SYNTHESIS_LANG[lang] || lang;
    u.rate = settings.voiceSpeed || 1;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="history-page">
      <header className="history-header">
        <div>
          <h1>Translation History</h1>
          <p>Browse, search, and manage your past translations</p>
        </div>
        <div className="history-header-actions">
          <span className="history-count">{history.length} item{history.length !== 1 ? 's' : ''}</span>
          {history.length > 0 && !confirmClear && (
            <button type="button" className="history-clear-btn" onClick={() => setConfirmClear(true)}>
              Clear All
            </button>
          )}
          {confirmClear && (
            <div className="history-confirm-clear glass-card">
              <span>Are you sure?</span>
              <button type="button" className="history-confirm-yes" onClick={handleClearAll}>Yes</button>
              <button type="button" className="history-confirm-no" onClick={() => setConfirmClear(false)}>No</button>
            </div>
          )}
        </div>
      </header>

      <div className="history-controls">
        <div className="history-search-row">
          <div className="history-search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search history by text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="history-filters">
          <div className="history-time-tabs">
            {TIME_FILTERS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`history-tab ${timeFilter === t.value ? 'active' : ''}`}
                onClick={() => setTimeFilter(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="history-selects">
            <select
              className="history-select"
              value={langPairFilter}
              onChange={(e) => setLangPairFilter(e.target.value)}
            >
              <option value="all">All languages</option>
              {langPairs.map((p) => (
                <option key={p} value={p}>
                  {LANGUAGE_MAP[p.split('→')[0]] || p.split('→')[0]} → {LANGUAGE_MAP[p.split('→')[1]] || p.split('→')[1]}
                </option>
              ))}
            </select>

            <select
              className="history-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <motion.div className="history-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span>{error}</span>
          <button type="button" onClick={loadHistory} className="history-retry-btn">Retry</button>
        </motion.div>
      )}

      <div className="history-list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <motion.div className="history-empty glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="history-empty-icon">📋</div>
            <h3>{search || timeFilter !== 'all' || langPairFilter !== 'all' ? 'No translations found' : 'No history yet'}</h3>
            <p>{search || timeFilter !== 'all' || langPairFilter !== 'all' ? 'Try adjusting your search terms or filters' : 'Start translating text or speech to build your translation history'}</p>
          </motion.div>
        ) : (
          <div className="history-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className={`history-entry glass-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.25) }}
                  layout
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="history-entry-top">
                    <div className="history-entry-meta">
                      <span className="history-lang-pair">
                        {LANGUAGE_MAP[item.source] || item.source} → {LANGUAGE_MAP[item.target] || item.target}
                      </span>
                      <span className={`history-type-badge ${item.translationType}`}>
                        {item.translationType === 'voice' ? '🎙 Voice' : '📝 Text'}
                      </span>
                    </div>
                    <span className="history-time">{item.time}</span>
                  </div>

                  <div className="history-entry-body">
                    <div className="history-text-block">
                      <span className="history-text-label">Original</span>
                      <p className="history-original">{item.original}</p>
                    </div>
                    <div className="history-text-block">
                      <span className="history-text-label">Translated</span>
                      <p className="history-translated">{item.translated}</p>
                    </div>
                  </div>

                  <div className="history-entry-actions">
                    <button
                      type="button"
                      className="history-action-btn"
                      onClick={(e) => handleCopy(e, item.translated, item.id)}
                      title="Copy translation"
                    >
                      {copiedId === item.id ? '✓ Copied' : '📋 Copy'}
                    </button>
                    <button
                      type="button"
                      className="history-action-btn"
                      onClick={(e) => handleSpeak(e, item.translated, item.target)}
                      title="Play audio translation"
                    >
                      🔊 Play
                    </button>
                    <button
                      type="button"
                      className={`history-action-btn ${item.isFavorite ? 'fav' : ''}`}
                      onClick={(e) => handleToggleFavorite(e, item.id)}
                      title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {item.isFavorite ? '★ Favorited' : '☆ Favorite'}
                    </button>
                    <button
                      type="button"
                      className="history-action-btn danger"
                      onClick={(e) => handleDelete(e, item.id)}
                      title="Delete translation"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Details Dialog Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="history-modal-overlay" onClick={() => setSelectedItem(null)}>
            <motion.div
              className="history-modal-content glass-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="history-modal-header">
                <h2>Translation Details</h2>
                <button type="button" className="history-modal-close" onClick={() => setSelectedItem(null)}>×</button>
              </div>

              <div className="history-modal-meta-row">
                <span className="history-modal-badge">
                  {LANGUAGE_MAP[selectedItem.source] || selectedItem.source} → {LANGUAGE_MAP[selectedItem.target] || selectedItem.target}
                </span>
                <span className={`history-type-badge ${selectedItem.translationType}`}>
                  {selectedItem.translationType === 'voice' ? '🎙 Voice' : '📝 Text'}
                </span>
                <span className="history-modal-date">{selectedItem.time}</span>
              </div>

              <div className="history-modal-body">
                <div className="history-modal-section">
                  <span className="history-text-label">Source Text</span>
                  <div className="history-modal-text-box">{selectedItem.original}</div>
                </div>

                <div className="history-modal-section">
                  <span className="history-text-label">Translated Text</span>
                  <div className="history-modal-text-box translated">{selectedItem.translated}</div>
                </div>
              </div>

              <div className="history-modal-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={(e) => handleSpeak(e, selectedItem.translated, selectedItem.target)}
                >
                  🔊 Listen
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={(e) => handleCopy(e, selectedItem.translated, selectedItem.id)}
                >
                  {copiedId === selectedItem.id ? '✓ Copied' : '📋 Copy Text'}
                </button>
                <button
                  type="button"
                  className={`btn-ghost ${selectedItem.isFavorite ? 'fav' : ''}`}
                  onClick={(e) => handleToggleFavorite(e, selectedItem.id)}
                >
                  {selectedItem.isFavorite ? '★ Favorited' : '☆ Add to Favorites'}
                </button>
                <button
                  type="button"
                  className="btn-ghost danger"
                  onClick={(e) => { handleDelete(e, selectedItem.id); setSelectedItem(null); }}
                  style={{ marginLeft: 'auto' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
