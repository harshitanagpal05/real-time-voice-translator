import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import './OverlayPage.css';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hist = JSON.parse(localStorage.getItem('translation_history') || '[]');
    if (hist.length === 0) return;

    const counts = {};
    hist.forEach((h) => { counts[h.target] = (counts[h.target] || 0) + 1; });
    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const max = Math.max(...values);

    labels.forEach((label, i) => {
      const barHeight = (values[i] / max) * 250;
      const x = 80 + i * 90;
      const y = 320 - barHeight;

      const gradient = ctx.createLinearGradient(x, y, x, 320);
      gradient.addColorStop(0, '#FF8C00');
      gradient.addColorStop(1, '#6A0DAD');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, 50, barHeight, 6);
      ctx.fill();

      ctx.fillStyle = '#888';
      ctx.font = '600 12px Sora, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label.toUpperCase(), x + 25, 345);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(values[i], x + 25, y - 10);
    });
  }, []);

  return (
    <motion.div
      className="overlay-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatedBackground />
      <button type="button" className="overlay-back" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
      <h2 className="overlay-title">Translation Analytics</h2>
      <div className="overlay-card">
        <canvas ref={canvasRef} width="600" height="380" />
        <p className="overlay-legend">Usage frequency by target language in this session.</p>
      </div>
    </motion.div>
  );
}
