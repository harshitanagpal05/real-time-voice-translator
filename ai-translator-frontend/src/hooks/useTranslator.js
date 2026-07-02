/**
 * useTranslator.js
 * Speech recognition → translation API → TTS pipeline with stable restarts.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { translateText } from '../api/translatorApi';
import {
  fetchTranslationHistory,
  saveTranslationHistory,
  clearTranslationHistory,
} from '../api/translationHistoryApi';
import { useAuth } from '../context/AuthContext';
import { SPEECH_RECOGNITION_LANG, SPEECH_SYNTHESIS_LANG } from '../constants/languages';
import { loadSettings, getVoiceRate } from '../utils/settings';

const MAX_HISTORY = 50;
const RESTART_DELAY_MS = 350;
const NETWORK_RETRY_DELAY_MS = 1200;

export default function useTranslator() {
  const { isAuthenticated } = useAuth();
  const initialSettings = loadSettings();
  const [sourceLang, setSourceLang] = useState(initialSettings.defaultSourceLang);
  const [targetLang, setTargetLang] = useState(initialSettings.defaultTargetLang);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(initialSettings.aiVoiceEnabled);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [micGranted, setMicGranted] = useState(null);

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const restartTimerRef = useRef(null);
  const sourceLangRef = useRef(sourceLang);
  const targetLangRef = useRef(targetLang);
  const voiceEnabledRef = useRef(voiceEnabled);
  const networkRetriesRef = useRef(0);

  const settingsRef = useRef(initialSettings);

  useEffect(() => {
    sourceLangRef.current = sourceLang;
    targetLangRef.current = targetLang;
    voiceEnabledRef.current = voiceEnabled;
  }, [sourceLang, targetLang, voiceEnabled]);

  useEffect(() => {
    settingsRef.current = loadSettings();
  }); // runs after every render to keep settings updated safely

  useEffect(() => {
    if (!isAuthenticated) {
      setTimeout(() => setHistory([]), 0);
      return undefined;
    }

    let cancelled = false;
    fetchTranslationHistory()
      .then((items) => { if (!cancelled) setHistory(items); })
      .catch(() => { if (!cancelled) setHistory([]); });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const saveHistory = useCallback(async (entry) => {
    if (!loadSettings().saveHistory) return;

    try {
      const recents = JSON.parse(localStorage.getItem('voxai_recent_langs') || '[]');
      const nextRecents = Array.from(new Set([entry.source, entry.target, ...recents])).slice(0, 10);
      localStorage.setItem('voxai_recent_langs', JSON.stringify(nextRecents));
    } catch {
      // ignore
    }

    try {
      const saved = await saveTranslationHistory(entry);
      setHistory((prev) => [saved, ...prev].slice(0, MAX_HISTORY));
    } catch {
      setHistory((prev) => [{ ...entry, id: entry.id || Date.now() }, ...prev].slice(0, MAX_HISTORY));
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await clearTranslationHistory();
    } catch {
      /* keep local clear */
    }
    setHistory([]);
  }, []);

  const speakText = useCallback((text, lang, force = false) => {
    if ((!force && !voiceEnabledRef.current) || !text?.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_SYNTHESIS_LANG[lang] || lang;
    utterance.rate = getVoiceRate(loadSettings().voiceSpeed);
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleTranslateRef = useRef(null);

  const handleTranslate = useCallback(async (text) => {
    if (!text || text.trim().length < 2) return;

    setIsTranslating(true);
    setError('');

    try {
      const result = await translateText(
        text,
        sourceLangRef.current,
        targetLangRef.current,
      );

      if (!result || result.includes('Translation failed')) {
        throw new Error(result || 'Translation failed');
      }

      setTranslatedText(result);
      saveHistory({
        original: text,
        translated: result,
        source: sourceLangRef.current,
        target: targetLangRef.current,
        translationType: 'voice',
        time: new Date().toLocaleString(),
        id: Date.now(),
      });

      speakText(result, targetLangRef.current);
    } catch (err) {
      setTranslatedText('');
      setError(err.message || 'Translation request failed');
    } finally {
      setIsTranslating(false);
    }
  }, [saveHistory, speakText]);

  useEffect(() => {
    handleTranslateRef.current = handleTranslate;
  }, [handleTranslate]);

  const scheduleRestart = useCallback((delay = RESTART_DELAY_MS) => {
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => {
      if (!shouldListenRef.current || !recognitionRef.current) return;
      try {
        recognitionRef.current.start();
        networkRetriesRef.current = 0;
      } catch {
        /* already running */
      }
    }, delay);
  }, []);

  const requestMicPermission = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicGranted(true);
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicGranted(true);
      return true;
    } catch {
      setMicGranted(false);
      setError('Microphone access denied. Allow mic permission in browser settings.');
      return false;
    }
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setTimeout(() => setError('Speech recognition requires Chrome or Edge.'), 0);
      return undefined;
    }

    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recog.lang = SPEECH_RECOGNITION_LANG[sourceLang] || 'en-US';

    recog.onresult = (event) => {
      networkRetriesRef.current = 0;
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript;
        else interim += transcript;
      }

      const display = finalText || interim;
      if (display) setOriginalText(display.trim());
      if (finalText.trim()) handleTranslateRef.current(finalText.trim());
    };

    recog.onerror = (event) => {
      const code = event.error;
      if (code === 'no-speech' || code === 'aborted') return;

      if (code === 'not-allowed') {
        shouldListenRef.current = false;
        setIsListening(false);
        setMicGranted(false);
        setError('Microphone blocked. Enable mic access for this site.');
        return;
      }

      if (code === 'network' && shouldListenRef.current) {
        networkRetriesRef.current += 1;
        if (networkRetriesRef.current <= 5) {
          scheduleRestart(NETWORK_RETRY_DELAY_MS);
          return;
        }
        setError('Speech service unavailable. Check internet connection and try again.');
        shouldListenRef.current = false;
        setIsListening(false);
        return;
      }

      if (code === 'audio-capture') {
        setError('No microphone detected. Connect a mic and try again.');
        shouldListenRef.current = false;
        setIsListening(false);
        return;
      }

      setError(`Speech error: ${code}`);
    };

    recog.onend = () => {
      if (shouldListenRef.current) scheduleRestart();
    };

    recognitionRef.current = recog;

    return () => {
      shouldListenRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      try { recog.stop(); } catch { /* noop */ }
    };
  }, [sourceLang, scheduleRestart]);

  const startListening = useCallback(async () => {
    setError('');
    setOriginalText('');
    setTranslatedText('');

    const ok = await requestMicPermission();
    if (!ok) return;

    const recog = recognitionRef.current;
    if (!recog) {
      setError('Speech recognition is not available.');
      return;
    }

    recog.lang = SPEECH_RECOGNITION_LANG[sourceLangRef.current] || 'en-US';
    shouldListenRef.current = true;
    networkRetriesRef.current = 0;

    try {
      recog.start();
      setIsListening(true);
    } catch {
      scheduleRestart(100);
      setIsListening(true);
    }
  }, [requestMicPermission, scheduleRestart]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    setIsListening(false);
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
  }, []);

  const translateManualText = useCallback(async (text) => {
    if (!text || !text.trim()) return;

    setIsTranslating(true);
    setError('');

    try {
      const result = await translateText(
        text,
        sourceLangRef.current,
        targetLangRef.current,
      );

      if (!result || result.includes('Translation failed')) {
        throw new Error(result || 'Translation failed');
      }

      setTranslatedText(result);
      saveHistory({
        original: text,
        translated: result,
        source: sourceLangRef.current,
        target: targetLangRef.current,
        translationType: 'text',
        time: new Date().toLocaleString(),
        id: Date.now(),
      });

      speakText(result, targetLangRef.current);
    } catch (err) {
      setTranslatedText('');
      setError(err.message || 'Translation request failed');
    } finally {
      setIsTranslating(false);
    }
  }, [saveHistory, speakText]);

  const swapLanguages = useCallback(() => {
    setSourceLang((s) => {
      setTargetLang(s);
      return targetLang;
    });
    setOriginalText((t) => {
      setTranslatedText(t);
      return translatedText;
    });
  }, [targetLang, translatedText]);

  const speakTranslation = useCallback(() => {
    if (translatedText) speakText(translatedText, targetLang, true);
  }, [translatedText, targetLang, speakText]);

  const clearError = useCallback(() => setError(''), []);

  return {
    sourceLang,
    targetLang,
    originalText,
    translatedText,
    isListening,
    isTranslating,
    isSpeaking,
    voiceEnabled,
    micGranted,
    error,
    history,
    setSourceLang,
    setTargetLang,
    setOriginalText,
    setTranslatedText,
    setVoiceEnabled,
    startListening,
    stopListening,
    swapLanguages,
    clearHistory,
    speakTranslation,
    clearError,
    translateManualText,
  };
}
