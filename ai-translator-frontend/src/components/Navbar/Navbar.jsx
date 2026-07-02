/**
 * Navbar.jsx
 * Premium glassmorphic navigation bar with scroll links and user actions.
 */

import { motion } from 'framer-motion';
import BrandMark from '../BrandMark/BrandMark';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Translator', href: '#translator' },
  { label: 'History', href: '#history' },
];

export default function Navbar({
  user,
  onAnalytics,
  onAdmin,
  onLogout,
  onHistoryToggle,
  historyCount,
}) {
  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (href === '#history') onHistoryToggle?.();
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      id="navbar"
    >
      <div className="navbar-inner">
        <a href="#hero" className="navbar-logo" onClick={(e) => { e.preventDefault(); scrollTo('#hero'); }}>
          <BrandMark size={28} className="navbar-logo-mark" />
          <span className="navbar-logo-text">VoxAI</span>
        </a>

        <ul className="navbar-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                className="navbar-link"
                onClick={() => scrollTo(link.href)}
              >
                {link.label}
                {link.href === '#history' && historyCount > 0 && (
                  <span className="navbar-link-badge">{historyCount}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button type="button" className="navbar-btn ghost" onClick={onAnalytics}>
            Analytics
          </button>
          {user?.isAdmin && (
            <button type="button" className="navbar-btn ghost" onClick={onAdmin}>
              Admin
            </button>
          )}
          <button type="button" className="navbar-btn outline" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
