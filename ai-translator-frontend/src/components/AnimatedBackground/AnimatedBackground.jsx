/**
 * AnimatedBackground.jsx
 * Floating gradient orbs + particle field for premium AI aesthetic.
 */

import { motion } from 'framer-motion';
import './AnimatedBackground.css';

export default function AnimatedBackground({ variant = 'default' }) {
  return (
    <div className={`animated-bg ${variant}`} aria-hidden="true">
      <div className="animated-bg-base" />
      <motion.div
        className="animated-orb orb-1"
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="animated-orb orb-2"
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="animated-orb orb-3"
        animate={{ x: [0, 20, -30, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="animated-grid" />
      <div className="animated-noise" />
    </div>
  );
}
