/**
 * Translation history — stored locally per signed-in user.
 */

import { getSession } from '../utils/session';

const STORAGE_PREFIX = 'voxai_translation_history';
const MAX_HISTORY = 50;

function getStorageKey() {
  const email = getSession()?.email?.toLowerCase() || 'guest';
  return `${STORAGE_PREFIX}:${email}`;
}

function readHistory() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    const history = raw ? JSON.parse(raw) : [];
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function writeHistory(history) {
  localStorage.setItem(getStorageKey(), JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function mapToFrontend(entry) {
  const rawTime = entry.createdAt || entry.rawTime || new Date().toISOString();

  return {
    id: entry.id || rawTime,
    original: entry.originalText || entry.original || '',
    translated: entry.translatedText || entry.translated || '',
    source: entry.inputLanguage || entry.source || '',
    target: entry.outputLanguage || entry.target || '',
    translationType: entry.translationType || 'text',
    time: entry.createdAt
      ? new Date(entry.createdAt).toLocaleString()
      : entry.time || new Date(rawTime).toLocaleString(),
    rawTime,
    isFavorite: !!entry.isFavorite,
  };
}

function mapToAnalytics(entry) {
  const rawTime = entry.rawTime || entry.createdAt || new Date().toISOString();

  return {
    _id: entry.id || rawTime,
    inputLanguage: entry.source || entry.inputLanguage || '',
    outputLanguage: entry.target || entry.outputLanguage || '',
    originalText: entry.original || entry.originalText || '',
    translatedText: entry.translated || entry.translatedText || '',
    translationType: entry.translationType || 'text',
    createdAt: rawTime,
  };
}

function aggregateAnalytics(history) {
  const totalTranslations = history.length;
  const voiceCount = history.filter((item) => item.translationType === 'voice').length;
  const textCount = totalTranslations - voiceCount;

  const countBy = (getter) => {
    const counts = new Map();
    history.forEach((item) => {
      const key = getter(item);
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count }));
  };

  const topSourceLang = countBy((item) => item.source)[0]?.key || null;
  const topTargetLang = countBy((item) => item.target)[0]?.key || null;

  const langPairCounts = new Map();
  history.forEach((item) => {
    if (!item.source || !item.target) return;
    const pairKey = `${item.source}|||${item.target}`;
    const current = langPairCounts.get(pairKey) || 0;
    langPairCounts.set(pairKey, current + 1);
  });

  const langPairs = Array.from(langPairCounts.entries())
    .map(([pairKey, count]) => {
      const [source, target] = pairKey.split('|||');
      return { source, target, count };
    })
    .sort((a, b) => b.count - a.count);

  const topLangPair = langPairs[0] || null;

  const dailyCountsMap = new Map();
  const weeklyCountsMap = new Map();
  const monthlyCountsMap = new Map();

  history.forEach((item) => {
    const date = new Date(item.rawTime || item.createdAt || Date.now());
    if (Number.isNaN(date.getTime())) return;

    const dayKey = date.toISOString().slice(0, 10);
    dailyCountsMap.set(dayKey, (dailyCountsMap.get(dayKey) || 0) + 1);

    const weekStart = new Date(date);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    const weekKey = weekStart.toISOString().slice(0, 10);
    weeklyCountsMap.set(weekKey, (weeklyCountsMap.get(weekKey) || 0) + 1);

    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    monthlyCountsMap.set(monthKey, (monthlyCountsMap.get(monthKey) || 0) + 1);
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setHours(0, 0, 0, 0);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  return {
    totalTranslations,
    voiceCount,
    textCount,
    topSourceLang,
    topTargetLang,
    topLangPair,
    langPairs,
    dailyCounts: Array.from(dailyCountsMap.entries())
      .filter(([date]) => new Date(date) >= sevenDaysAgo)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count })),
    weeklyCounts: Array.from(weeklyCountsMap.entries())
      .filter(([date]) => new Date(date) >= fourWeeksAgo)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, count]) => ({ week, count })),
    monthlyCounts: Array.from(monthlyCountsMap.entries())
      .filter(([month]) => new Date(`${month}-01`) >= sixMonthsAgo)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count })),
    recentActivity: history.slice(0, 20).map(mapToAnalytics),
  };
}

export async function fetchTranslationHistory() {
  return readHistory().map(mapToFrontend);
}

export async function saveTranslationHistory(entry) {
  const history = readHistory();
  const saved = {
    id: entry.id || crypto.randomUUID(),
    inputLanguage: entry.source,
    outputLanguage: entry.target,
    originalText: entry.original,
    translatedText: entry.translated,
    translationType: entry.translationType || 'text',
    createdAt: entry.rawTime || new Date().toISOString(),
    isFavorite: !!entry.isFavorite,
  };

  writeHistory([saved, ...history]);
  return mapToFrontend(saved);
}

export async function deleteTranslationHistory(id) {
  const history = readHistory().filter((item) => (item.id || item.rawTime) !== id);
  writeHistory(history);
}

export async function clearTranslationHistory() {
  localStorage.removeItem(getStorageKey());
}

export async function toggleFavoriteTranslation(id) {
  const history = readHistory();
  const updated = history.map((item) => {
    const itemId = item.id || item.createdAt || item.rawTime;
    if (itemId === id) {
      return { ...item, isFavorite: !item.isFavorite };
    }
    return item;
  });
  writeHistory(updated);
}

export async function fetchAnalytics() {
  return aggregateAnalytics(readHistory().map(mapToFrontend));
}

export function getAllUsersLocalTranslations() {
  const translations = [];
  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith('voxai_translation_history:')
    );
    keys.forEach((key) => {
      const email = key.split(':')[1];
      const raw = localStorage.getItem(key);
      const items = raw ? JSON.parse(raw) : [];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          translations.push({
            id: item.id || item.createdAt || item.rawTime || Date.now(),
            original: item.originalText || item.original || '',
            translated: item.translatedText || item.translated || '',
            source: item.inputLanguage || item.source || '',
            target: item.outputLanguage || item.target || '',
            translationType: item.translationType || 'text',
            createdAt: item.createdAt || item.rawTime || new Date().toISOString(),
            userEmail: email,
          });
        });
      }
    });
  } catch {
    // ignore
  }
  return translations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
