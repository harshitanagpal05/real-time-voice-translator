/**
 * FeatureCards.jsx
 * Glassmorphic feature grid with scroll-triggered Framer Motion reveals.
 */

import { motion } from 'framer-motion';
import './FeatureCards.css';

const FEATURES = [
  {
    icon: '🎙️',
    title: 'Real-Time Voice',
    description: 'Speak naturally and get instant speech-to-text recognition with continuous listening.',
  },
  {
    icon: '🌐',
    title: '12+ Languages',
    description: 'Translate between English, Japanese, Spanish, Chinese, and many more languages instantly.',
  },
  {
    icon: '🔊',
    title: 'Voice Output',
    description: 'Hear translations spoken aloud with natural text-to-speech in your target language.',
  },
  {
    icon: '⚡',
    title: 'AI-Powered',
    description: 'Backend AI translation with intelligent fallback ensures fast, accurate results every time.',
  },
  {
    icon: '📜',
    title: 'History Tracking',
    description: 'Every translation is saved locally so you can review past conversations anytime.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your session data stays on your device. Enterprise-grade authentication built in.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function FeatureCards() {
  return (
    <section className="features-section" id="features">
      <motion.div
        className="features-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-tag">Why Choose VoxAI</span>
        <h2 className="section-title">Built for the Future of Communication</h2>
        <p className="section-subtitle">
          Experience voice translation that feels like magic — fast, accurate, and beautifully designed.
        </p>
      </motion.div>

      <motion.div
        className="features-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {FEATURES.map((feature) => (
          <motion.article
            key={feature.title}
            className="feature-card"
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
          >
            <div className="feature-icon-wrap">
              <span className="feature-icon">{feature.icon}</span>
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
