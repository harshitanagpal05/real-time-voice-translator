/**
 * Hero.jsx
 * Premium hero section with headline, tag pill, and 3D voice orb centerpiece.
 */

import { motion } from 'framer-motion';
import VoiceOrb from '../VoiceOrb/VoiceOrb';
import AudioVisualizer from '../AudioVisualizer/AudioVisualizer';
import './Hero.css';

export default function Hero({
  isListening,
  isSpeaking,
  isTranslating,
  onStart,
  onStop,
}) {
  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.span
            className="hero-tag"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="hero-tag-dot" />
            AI Voice Translation
          </motion.span>

          <h1 className="hero-headline">
            Change the World
            <br />
            <span className="hero-headline-gradient">with Voice AI</span>
          </h1>

          <p className="hero-subtext">
            Real-time multilingual translation powered by advanced AI.
            Speak naturally and hear instant, fluent translations in any language.
          </p>

          <div className="hero-cta">
            {!isListening ? (
              <motion.button
                type="button"
                className="hero-btn primary"
                onClick={onStart}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Try for free
              </motion.button>
            ) : (
              <motion.button
                type="button"
                className="hero-btn stop"
                onClick={onStop}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Stop listening
              </motion.button>
            )}
            <motion.a
              href="#translator"
              className="hero-btn ghost"
              whileHover={{ x: 4 }}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#translator')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
              <span className="hero-btn-arrow">›</span>
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          className="hero-orb-wrapper"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="orb-section">
            <AudioVisualizer
              isListening={isListening}
              isSpeaking={isSpeaking}
              isTranslating={isTranslating}
            />
            <VoiceOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              isTranslating={isTranslating}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
