import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { LANGUAGES } from '../constants/languages';
import './LanguagesPage.css';

function getFavorites() {
  try { return JSON.parse(localStorage.getItem('voxai_fav_langs') || '[]'); } catch { return []; }
}
function saveFavorites(favs) {
  localStorage.setItem('voxai_fav_langs', JSON.stringify(favs));
}
function getRecentLangs() {
  try { return JSON.parse(localStorage.getItem('voxai_recent_langs') || '[]'); } catch { return []; }
}

export default function LanguagesPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [search, setSearch] = useState('');
  const [sortAlpha, setSortAlpha] = useState(false);
  const [favorites, setFavorites] = useState(getFavorites);
  const [selectMode, setSelectMode] = useState(null); // 'source' | 'target' | null
  const recentLangs = useMemo(() => getRecentLangs().slice(0, 6), []);

  const toggleFavorite = useCallback((code) => {
    setFavorites((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      saveFavorites(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let list = [...LANGUAGES];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.label.toLowerCase().includes(q) ||
          l.nativeName.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q)
      );
    }
    if (sortAlpha) {
      list.sort((a, b) => a.label.localeCompare(b.label));
    }
    return list;
  }, [search, sortAlpha]);

  const favLangs = useMemo(() => LANGUAGES.filter((l) => favorites.includes(l.code)), [favorites]);
  const recentLangItems = useMemo(() => LANGUAGES.filter((l) => recentLangs.includes(l.code)), [recentLangs]);

  const handleSelectLang = (code, as) => {
    if (as === 'source') {
      updateSettings({ defaultSourceLang: code });
    } else {
      updateSettings({ defaultTargetLang: code });
    }
    navigate('/dashboard');
  };

  return (
    <div className="languages-page">
      <header className="languages-header">
        <div>
          <h1>Languages</h1>
          <p>{LANGUAGES.length} supported languages</p>
        </div>
        <div className="languages-header-actions">
          <button
            type="button"
            className={`lang-sort-btn btn-ghost ${sortAlpha ? 'active' : ''}`}
            onClick={() => setSortAlpha((v) => !v)}
          >
            {sortAlpha ? 'Sorted A-Z ✓' : 'Sort A-Z'}
          </button>
        </div>
      </header>

      <div className="languages-search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search languages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quick select mode */}
      <div className="lang-quick-select glass-card">
        <span className="lang-quick-label">Set language as default:</span>
        <div className="lang-quick-actions">
          <button
            type="button"
            className={`lang-quick-btn ${selectMode === 'source' ? 'active' : ''}`}
            onClick={() => setSelectMode(selectMode === 'source' ? null : 'source')}
          >
            Source Input Language
          </button>
          <button
            type="button"
            className={`lang-quick-btn ${selectMode === 'target' ? 'active' : ''}`}
            onClick={() => setSelectMode(selectMode === 'target' ? null : 'target')}
          >
            Target Output Language
          </button>
        </div>
      </div>

      {/* Favorites section */}
      {favLangs.length > 0 && !search && (
        <section className="lang-section">
          <h3 className="lang-section-title">⭐ Favorites</h3>
          <div className="lang-grid">
            {favLangs.map((lang) => (
              <LanguageCard
                key={lang.code}
                lang={lang}
                isFav={true}
                onToggleFav={toggleFavorite}
                onSelect={selectMode ? (code) => handleSelectLang(code, selectMode) : null}
                isCurrentSource={settings.defaultSourceLang === lang.code}
                isCurrentTarget={settings.defaultTargetLang === lang.code}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently used */}
      {recentLangItems.length > 0 && !search && (
        <section className="lang-section">
          <h3 className="lang-section-title">🕐 Recently Used</h3>
          <div className="lang-grid">
            {recentLangItems.map((lang) => (
              <LanguageCard
                key={lang.code}
                lang={lang}
                isFav={favorites.includes(lang.code)}
                onToggleFav={toggleFavorite}
                onSelect={selectMode ? (code) => handleSelectLang(code, selectMode) : null}
                isCurrentSource={settings.defaultSourceLang === lang.code}
                isCurrentTarget={settings.defaultTargetLang === lang.code}
              />
            ))}
          </div>
        </section>
      )}

      {/* All languages */}
      <section className="lang-section">
        <h3 className="lang-section-title">🌐 Supported Languages</h3>
        <div className="lang-grid">
          <AnimatePresence>
            {filtered.map((lang, idx) => (
              <LanguageCard
                key={lang.code}
                lang={lang}
                isFav={favorites.includes(lang.code)}
                onToggleFav={toggleFavorite}
                onSelect={selectMode ? (code) => handleSelectLang(code, selectMode) : null}
                isCurrentSource={settings.defaultSourceLang === lang.code}
                isCurrentTarget={settings.defaultTargetLang === lang.code}
                delay={Math.min(idx * 0.02, 0.25)}
              />
            ))}
          </AnimatePresence>
        </div>
        {filtered.length === 0 && (
          <div className="lang-empty glass-card">
            <p>No languages match your search query</p>
          </div>
        )}
      </section>
    </div>
  );
}

function LanguageCard({ lang, isFav, onToggleFav, onSelect, isCurrentSource, isCurrentTarget, delay = 0 }) {
  return (
    <motion.div
      className={`lang-card glass-card ${isCurrentSource ? 'current-source' : ''} ${isCurrentTarget ? 'current-target' : ''} ${onSelect ? 'selectable' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => onSelect?.(lang.code)}
    >
      <div className="lang-card-top">
        <span className="lang-flag">{lang.flag}</span>
        <button
          type="button"
          className={`lang-fav-btn ${isFav ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFav(lang.code); }}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFav ? '★' : '☆'}
        </button>
      </div>
      <div className="lang-card-name">{lang.label}</div>
      <div className="lang-card-native">{lang.nativeName}</div>
      <div className="lang-card-code">{lang.code.toUpperCase()}</div>
      <div className="lang-card-badges">
        {lang.voiceSupport && <span className="lang-badge voice">🎤 Voice</span>}
        {lang.textSupport && <span className="lang-badge text">📝 Text</span>}
      </div>
      {isCurrentSource && <span className="lang-current-badge source">Input Source</span>}
      {isCurrentTarget && <span className="lang-current-badge target">Output Target</span>}
    </motion.div>
  );
}
