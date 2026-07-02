import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import './AdminLayout.css';

const ADMIN_NAV = [
  { id: 'overview', path: '/admin', label: 'Overview', icon: 'grid' },
  { id: 'users', path: '/admin/users', label: 'Users', icon: 'users' },
  { id: 'analytics', path: '/admin/analytics', label: 'Translation Analytics', icon: 'chart' },
  { id: 'activity', path: '/admin/activity', label: 'Recent Activity', icon: 'activity' },
  { id: 'system', path: '/admin/system', label: 'System', icon: 'server' },
  { id: 'settings', path: '/admin/settings', label: 'Settings', icon: 'gear' },
];

function AdminNavIcon({ type }) {
  const props = { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  switch (type) {
    case 'grid': return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case 'users': return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'chart': return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'activity': return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case 'server': return <svg {...props}><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>;
    case 'gear': return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
    default: return null;
  }
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = user?.fullName || user?.email?.split('@')[0] || 'Admin';
  const activePath = location.pathname;

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      <AnimatedBackground />

      {/* Mobile toggle */}
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle admin menu"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
          }
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-logo">
          <span className="admin-logo-icon">⚡</span>
          <div>
            <span className="admin-logo-text">VoxAI</span>
            <span className="admin-logo-badge">Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {ADMIN_NAV.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              className={`admin-nav-item ${activePath === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <AdminNavIcon type={item.icon} />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="admin-sidebar-divider" />

        <button
          type="button"
          className="admin-nav-item admin-back-btn"
          onClick={() => navigate('/dashboard')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>User Dashboard</span>
        </button>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-avatar">{userName?.[0]?.toUpperCase() || 'A'}</span>
            <div>
              <span className="admin-user-name">{userName}</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div className="admin-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
