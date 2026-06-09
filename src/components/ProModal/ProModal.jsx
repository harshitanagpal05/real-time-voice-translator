import { motion } from 'framer-motion';
import './ProModal.css';

const FEATURES = [
  'Unlimited real-time translations',
  'Premium AI voices',
  'Faster translation speed',
  'Multi-device support',
  'Priority AI processing',
];

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['50 translations/day', 'Standard voices', 'Basic speed'],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'VoxAI Pro',
    price: '$9.99',
    period: '/month',
    features: ['Unlimited translations', 'Premium AI voices', 'Priority processing', 'Multi-device sync'],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$24.99',
    period: '/month',
    features: ['Everything in Pro', 'Team workspace', 'Admin dashboard', 'API access'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function ProModal({ onClose }) {
  return (
    <motion.div
      className="pro-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="pro-modal"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="pro-modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="pro-modal-header">
          <span className="pro-modal-badge">Premium</span>
          <h2 className="pro-modal-title">VoxAI Pro</h2>
          <p className="pro-modal-subtitle">Unlock the full power of AI voice translation</p>
        </div>

        <ul className="pro-feature-list">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {f}
            </motion.li>
          ))}
        </ul>

        <div className="pro-plans">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`pro-plan-card ${plan.highlighted ? 'highlighted' : ''}`}>
              <h3>{plan.name}</h3>
              <div className="pro-plan-price">
                <span>{plan.price}</span>
                <small>{plan.period}</small>
              </div>
              <ul>
                {plan.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <button
                type="button"
                className={`pro-plan-btn ${plan.highlighted ? 'primary' : ''}`}
                onClick={plan.highlighted ? onClose : undefined}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
