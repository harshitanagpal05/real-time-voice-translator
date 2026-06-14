/**
 * translatorApi.js — backend-first translation with MyMemory fallback.
 */

import { BACKEND_URL } from '../config/api';

async function tryBackend(text, sourceLang, targetLang) {
  const res = await fetch(`${BACKEND_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
    }),
  });

  if (!res.ok) throw new Error(`Backend ${res.status}`);
  const data = await res.json();
  if (data.translated_text?.trim()) return data.translated_text;
  throw new Error('Empty backend response');
}

async function tryMyMemory(text, sourceLang, targetLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('MyMemory failed');
  const data = await res.json();
  const translated = data.responseData?.translatedText;
  if (!translated || translated === text) throw new Error('No translation returned');
  return translated;
}

export async function translateText(text, sourceLang, targetLang) {
  if (!text?.trim() || text.trim().length < 2) return '';

  try {
    return await tryBackend(text, sourceLang, targetLang);
  } catch {
    try {
      return await tryMyMemory(text, sourceLang, targetLang);
    } catch {
      throw new Error('Translation failed — start backend or check internet');
    }
  }
}

export async function checkBackendHealth() {
  try {
    const root = import.meta.env.DEV
      ? ''
      : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
    const res = await fetch(`${root}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
