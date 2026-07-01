import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import {
  fetchTranslationHistory,
  deleteTranslationHistory,
  clearTranslationHistory,
} from '../api/translationHistoryApi';
import { LANGUAGE_MAP, SPEECH_SYNTHESIS_LANG } from '../constants/languages';
import './HistoryPage.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'source', label: 'Source Language' },
  { value: 'target', label: 'Target Language' },
];

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'voice', label: '🎤 Voice' },
  { value: 'text', label: '📝 Text' },
];

function SkeletonRow() {
  return (
    <div className="history-skeleton-row">
      <div className="skeleton-line w60" />
      <div className="skeleton-line w40" />
      <div className="skeleton-line w80" />
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [langPairFilter, setLangPairFilter] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const items = await fetchTranslationHistory();
      setHistory(items);
    } catch (err) {
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const langPairs = useMemo(() => {
    const pairs = new Set();
    history.forEach((h) => pairs.add(`${h.source}→${h.target}`));
    return Array.from(pairs);
  }, [history]);

  const filtered = useMemo(() => {
    let items = [...history];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (h) => h.original?.toLowerCase().includes(q) || h.translated?.toLowerCase().includes(q),
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      items = items.filter((h) => h.translationType === typeFilter);
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
  }, [history, search, typeFilter, langPairFilter, sortBy]);

  const handleDelete = async (id) => {
    try {
      await deleteTranslationHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      setError('Failed to delete. Please try again.');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearTranslationHistory();
      setHistory([]);
      setConfirmClear(false);
    } catch {
      setError('Failed to clear history. Please try again.');
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSpeak = (text, lang) => {
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
          <span className="history-count">{history.length} translation{history.length !== 1 ? 's' : ''}</span>
          {history.length > 0 && !confirmClear && (
            <button type="button" className="history-clear-btn" onClick={() => setConfirmClear(true)}>
              Clear All
            </button>
          )}
          {confirmClear && (
            <div className="history-confirm-clear">
              <span>Are you sure?</span>
              <button type="button" className="history-confirm-yes" onClick={handleClearAll}>Yes, clear</button>
              <button type="button" className="history-confirm-no" onClick={() => setConfirmClear(false)}>Cancel</button>
            </div>
          )}
        </div>
      </header>

      <div className="history-controls">
        <div className="history-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search translations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="history-filters">
          <div className="history-type-tabs">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`history-tab ${typeFilter === t.value ? 'active' : ''}`}
                onClick={() => setTypeFilter(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <select
            className="history-select"
            value={langPairFilter}
            onChange={(e) => setLangPairFilter(e.target.value)}
          >
            <option value="all">All language pairs</option>
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

      {error && (
        <motion.div className="history-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
          <button type="button" onClick={loadHistory} className="history-retry-btn">Retry</button>
        </motion.div>
      )}

      <div className="history-list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <motion.div className="history-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="history-empty-icon">📋</div>
            <h3>{search || typeFilter !== 'all' || langPairFilter !== 'all' ? 'No matches found' : 'No translations yet'}</h3>
            <p>{search ? 'Try a different search term' : 'Start translating to build your history'}</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                className="history-entry"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                layout
              >
                <div className="history-entry-top">
                  <div className="history-entry-meta">
                    <span className="history-lang-pair">
                      {LANGUAGE_MAP[item.source] || item.source} → {LANGUAGE_MAP[item.target] || item.target}
                    </span>
                    <span className={`history-type-badge ${item.translationType}`}>
                      {item.translationType === 'voice' ? '🎤 Voice' : '📝 Text'}
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
                    onClick={() => handleCopy(item.translated, item.id)}
                    title="Copy translation"
                  >
                    {copiedId === item.id ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <button
                    type="button"
                    className="history-action-btn"
                    onClick={() => handleSpeak(item.translated, item.target)}
                    title="Play translation"
                  >
                    🔊 Play
                  </button>
                  <button
                    type="button"
                    className="history-action-btn danger"
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
