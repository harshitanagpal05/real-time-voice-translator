/**
 * Translation history — persisted via MongoDB backend.
 */

import api from './api';

function mapToFrontend(entry) {
  return {
    id: entry._id,
    original: entry.originalText,
    translated: entry.translatedText,
    source: entry.inputLanguage,
    target: entry.outputLanguage,
    time: entry.createdAt
      ? new Date(entry.createdAt).toLocaleString()
      : new Date().toLocaleString(),
  };
}

export async function fetchTranslationHistory() {
  const { data } = await api.get('/translations/history');
  return (data.translations || []).map(mapToFrontend);
}

export async function saveTranslationHistory(entry) {
  const { data } = await api.post('/translations', {
    inputLanguage: entry.source,
    outputLanguage: entry.target,
    originalText: entry.original,
    translatedText: entry.translated,
  });
  return mapToFrontend(data.translation);
}

export async function deleteTranslationHistory(id) {
  await api.delete(`/translations/${id}`);
}

export async function clearTranslationHistory() {
  await api.delete('/translations');
}
