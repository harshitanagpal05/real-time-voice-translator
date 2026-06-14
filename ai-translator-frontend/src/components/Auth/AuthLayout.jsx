/**
 * AuthLayout.jsx
 * Premium split-screen auth shell with animated background and 3D orb.
 */

import { motion } from 'framer-motion';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import AuthOrb from './AuthOrb';
import './Auth.css';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-page">
      <AnimatedBackground variant="auth" />

      <div className="auth-shell">
        <motion.aside
          className="auth-brand"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="auth-brand-inner">
            <div className="auth-logo-row">
              <span className="auth-logo-mark" />
              <span className="auth-logo-text">VoxAI</span>
            </div>

            <h1 className="auth-brand-title">
              Speak any language.
              <br />
              <span>Instantly.</span>
            </h1>
            <p className="auth-brand-desc">
              Real-time AI voice translation with neural speech recognition,
              powered by advanced language models.
            </p>

            <div className="auth-orb-stage">
              <AuthOrb />
            </div>

            <div className="auth-brand-stats">
              <div className="auth-stat">
                <strong>12+</strong>
                <span>Languages</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-stat">
                <strong>Real-time</strong>
                <span>Translation</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-stat">
                <strong>AI</strong>
                <span>Voice Output</span>
              </div>
            </div>
          </div>
        </motion.aside>

        <motion.main
          className="auth-form-panel"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="auth-mobile-brand">
            <span className="auth-logo-mark" />
            <span className="auth-logo-text">VoxAI</span>
          </div>
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2 className="auth-title">{title}</h2>
              <p className="auth-subtitle">{subtitle}</p>
            </div>
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
