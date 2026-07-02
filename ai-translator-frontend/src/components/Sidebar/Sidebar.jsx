import { motion } from 'framer-motion';
import BrandMark from '../BrandMark/BrandMark';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'translate', label: 'Translate', icon: 'mic' },
  { id: 'history', label: 'History', icon: 'clock' },
  { id: 'languages', label: 'Languages', icon: 'globe' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
  { id: 'about-founder', label: 'About Founder', icon: 'founder' },
];

function NavIcon({ type }) {
  const props = { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
  switch (type) {
    case 'mic': return <svg {...props}><path d="M12 14c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v5c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>;
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case 'globe': return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
    case 'chart': return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'founder': return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
  }
}

export default function Sidebar({
  active, onNavigate, onLogout, onUpgrade, userName, mobileOpen, onMobileClose,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <BrandMark size={32} className="sidebar-logo-mark" />
          <span className="sidebar-logo-text">VoxAI</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); onMobileClose?.(); }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="sidebar-nav-icon"><NavIcon type={item.icon} /></span>
              <span className="sidebar-nav-label">{item.label}</span>
              {active === item.id && (
                <motion.span
                  className="sidebar-active-indicator"
                  layoutId="sidebar-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="sidebar-pro-card">
          <div className="sidebar-pro-glow" />
          <p className="sidebar-pro-title">Upgrade to Pro</p>
          <p className="sidebar-pro-desc">Unlock unlimited translations &amp; premium voices</p>
          <button type="button" className="sidebar-pro-btn" onClick={onUpgrade}>Upgrade Now</button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-avatar">{userName?.[0]?.toUpperCase() || 'U'}</span>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userName || 'User'}</span>
              <span className="sidebar-user-plan">Free Plan</span>
            </div>
          </div>
          <button type="button" className="sidebar-logout" onClick={onLogout}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
