import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './InfoPage.css';

const STEPS = [
  { num: 1, title: 'Speak', desc: 'User speaks naturally using microphone input.', icon: '🎤' },
  { num: 2, title: 'AI Voice Recognition', desc: 'VoxAI detects and converts speech into text using AI.', icon: '🧠' },
  { num: 3, title: 'Translation Engine', desc: 'The text is translated instantly into the selected language.', icon: '🌐' },
  { num: 4, title: 'Voice Output', desc: 'Translated text is converted back into natural AI speech.', icon: '🔊' },
];

const FEATURES = [
  { title: 'Real-time translation', desc: 'Instant results as you speak — no delays, no waiting.', icon: '⚡' },
  { title: 'Multi-language support', desc: 'Translate across 12+ languages with a single click.', icon: '🗺️' },
  { title: 'AI powered speech recognition', desc: 'Advanced neural models capture every word accurately.', icon: '🤖' },
  { title: 'Natural voice generation', desc: 'Hear translations spoken in fluent, natural AI voices.', icon: '🎙️' },
  { title: 'Secure translation history', desc: 'Your sessions are saved locally and kept private.', icon: '🔒' },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <header className="info-page-header">
        <button type="button" className="info-back" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>What is VoxAI?</motion.h1>
      </header>

      <motion.p
        className="info-intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        VoxAI stands for Voice Artificial Intelligence. It is an AI-powered real-time voice
        translation platform designed to remove language barriers and make conversations easier worldwide.
      </motion.p>

      <h2 className="info-section-title">How It Works</h2>
      <div className="info-steps">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            className="info-step-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            whileHover={{ y: -4 }}
          >
            <span className="info-step-num">{step.num}</span>
            <span className="info-step-icon">{step.icon}</span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="info-section-title">Platform Features</h2>
      <div className="info-features">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="info-feature-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.06 }}
          >
            <span className="info-feature-icon">{f.icon}</span>
            <div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        type="button"
        className="info-cta-btn"
        onClick={() => navigate('/dashboard')}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Start Translating
      </motion.button>
    </div>
  );
}
