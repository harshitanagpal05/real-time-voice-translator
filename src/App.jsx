import { useEffect, useRef, useState } from "react";
import "./App.css";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "pt", label: "Portuguese" }
];

export default function App() {
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [view, setView] = useState("main");
  const [mode, setMode] = useState("audio");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ja");

  const [original, setOriginal] = useState("");
  const [translated, setTranslated] = useState("");
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");

  /* ---------- VIDEO LOGIC ---------- */
  useEffect(() => {
    if (mode !== "video" || view !== "main") return;
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(() => setError("Could not access camera"));
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [mode, view]);

  /* ---------- SPEECH LOGIC ---------- */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition not supported");
      return;
    }
    const recog = new SR();
    recog.continuous = true;
    recog.lang = sourceLang === "zh" ? "zh-CN" : sourceLang;
    recog.onresult = e => {
      const text = e.results[e.results.length - 1][0].transcript;
      setOriginal(text);
      translate(text);
    };
    recog.onerror = e => { if (e.error !== "no-speech") setError(e.error); };
    recognitionRef.current = recog;
  }, [sourceLang, targetLang]);

  const start = () => {
    setError(""); setOriginal(""); setTranslated("");
    recognitionRef.current?.start();
    setRunning(true); setPaused(false);
  };

  const pause = () => { recognitionRef.current?.stop(); setPaused(true); };
  const resume = () => { recognitionRef.current?.start(); setPaused(false); };
  const stop = () => { recognitionRef.current?.stop(); setRunning(false); setPaused(false); };

  /* ---------- TRANSLATION LOGIC ---------- */
  const translate = async text => {
    if (!text || text.length < 2) return;
    setTranslated("Translating...");
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
      const data = await res.json();
      const resultText = data.responseData.translatedText;
      setTranslated(resultText);
      const history = JSON.parse(localStorage.getItem("history") || "[]");
      history.unshift({ original: text, translated: resultText, source: sourceLang, target: targetLang, time: new Date().toLocaleString() });
      localStorage.setItem("history", JSON.stringify(history.slice(0, 50)));
    } catch { setTranslated("Translation failed"); }
  };

  /* ---------- ANALYTICS DRAWING ---------- */
  useEffect(() => {
    if (view !== "analytics") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    if (history.length === 0) return;
    const counts = {};
    history.forEach(h => { counts[h.target] = (counts[h.target] || 0) + 1; });
    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const max = Math.max(...values);
    labels.forEach((label, i) => {
      const barHeight = (values[i] / max) * 250; 
      const x = 100 + i * 100; const y = 350 - barHeight;
      ctx.fillStyle = "#38bdf8"; ctx.fillRect(x, y, 50, barHeight);
      ctx.fillStyle = "#e5e7eb"; ctx.font = "bold 14px Inter"; ctx.textAlign = "center";
      ctx.fillText(label.toUpperCase(), x + 25, 380); ctx.fillText(values[i], x + 25, y - 15);
    });
  }, [view]);

  /* ---------- RENDER VIEWS ---------- */
  if (view === "history") {
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    return (
      <div className="page history-page">
        <button className="back-btn-alt" onClick={() => setView("main")}>← Back to Home</button>
        <h2 className="page-title">📜 Translation History</h2>
        <div className="history-list-centered">
          {history.map((h, i) => (
            <div key={i} className="history-item-centered">
              <div className="history-meta"><b>{h.source.toUpperCase()} → {h.target.toUpperCase()}</b></div>
              <p className="history-text original-text">{h.original}</p>
              <p className="history-text translated-text accent">{h.translated}</p>
              <small className="history-date">{h.time}</small>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "analytics") {
    return (
      <div className="page analytics-page">
        <div className="analytics-header">
          <button className="back-btn-alt" onClick={() => setView("main")}>← Back to Home</button>
          <h2 className="analytics-title">📊 Translation Analytics</h2>
        </div>
        
        <div className="analytics-card">
          <div className="chart-wrapper">
             <canvas ref={canvasRef} width="600" height="400" />
          </div>
          <div className="chart-legend">
            <p>Usage frequency based on target languages translated in this session.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1 className="main-title">🌍 Real Time Translator</h1>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Mode</label>
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="audio">🎤 Audio</option>
            <option value="video">📹 Video</option>
          </select>
        </div>
        <div className="control-group">
          <label className="control-label">Source Language</label>
          <select value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <div className="control-group">
          <label className="control-label">Translated Language</label>
          <select value={targetLang} onChange={e => setTargetLang(e.target.value)}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <div className="control-group">
          <label className="control-label">Controls</label>
          <div className="action-row">
            {!running && <button className="btn-action primary" onClick={start}>▶ Start</button>}
            {running && !paused && <button className="btn-action warn" onClick={pause}>⏸ Pause</button>}
            {paused && <button className="btn-action primary" onClick={resume}>▶ Resume</button>}
            {running && <button className="btn-action danger" onClick={stop}>⏹ Stop</button>}
          </div>
        </div>
      </div>

      <div className="box-row">
        <div className="box"><h3>Original</h3><div className="box-inner">{original || "Listening..."}</div></div>
        <div className="box"><h3>Translated</h3><div className="box-inner accent">{translated || "Waiting..."}</div></div>
      </div>

      {mode === "video" && (
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay muted playsInline className="video" />
          <div className="subtitle-container">
            {original && <div className="subtitle subtitle-source">{original}</div>}
            {translated && <div className="subtitle subtitle-translated">{translated}</div>}
          </div>
        </div>
      )}

      <div className="footer-buttons">
        <button onClick={() => setView("history")}>📜 History</button>
        <button onClick={() => setView("analytics")}>📊 Analytics</button>
      </div>

      <footer className="footer-main">
        <div className="footer-content">
          <div className="footer-branding">
            <h2 className="footer-logo">Real Time Translator</h2>
            <p>© 2025 All rights reserved.</p>
            <div className="social-icons">
              <span className="icon">f</span><span className="icon">t</span>
              <span className="icon">i</span><span className="icon">in</span>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>RESOURCES</h4><ul><li>Application</li><li>Documentation</li><li>Systems</li><li>FAQ</li></ul>
            </div>
            <div className="footer-column">
              <h4>PRICING</h4><ul><li>Overview</li><li>Premium Plans</li><li>Affiliate</li><li>Promotions</li></ul>
            </div>
            <div className="footer-column">
              <h4>COMPANY</h4><ul><li>About Us</li><li>Blog</li><li>Partnerships</li><li>Careers</li></ul>
            </div>
            <div className="footer-column">
              <h4>SOCIAL</h4><ul><li>Facebook</li><li>Twitter</li><li>Instagram</li><li>LinkedIn</li></ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}