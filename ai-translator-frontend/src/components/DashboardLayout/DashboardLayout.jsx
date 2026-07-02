import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import Sidebar from '../Sidebar/Sidebar';
import ProModal from '../ProModal/ProModal';
import './DashboardLayout.css';

const ROUTE_NAV = {
  '/dashboard': 'translate',
  '/history': 'history',
  '/languages': 'languages',
  '/analytics': 'analytics',
  '/settings': 'settings',
  '/how-it-works': 'how-it-works',
  '/about-founder': 'about-founder',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { syncUserProfile } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [proOpen, setProOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) syncUserProfile(user);
  }, [user, syncUserProfile]);

  const userName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const activeNav = ROUTE_NAV[location.pathname] || 'translate';

  const handleNav = (id) => {
    const routes = {
      translate: '/dashboard',
      history: '/history',
      languages: '/languages',
      analytics: '/analytics',
      settings: '/settings',
      'how-it-works': '/how-it-works',
      'about-founder': '/about-founder',
    };
    const target = routes[id];
    if (target) {
      navigate(target);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-layout">
      <AnimatedBackground />

      {/* Mobile hamburger */}
      <button
        type="button"
        className="dashboard-mobile-toggle"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
          }
        </svg>
      </button>

      <Sidebar
        active={activeNav}
        onNavigate={handleNav}
        onLogout={handleLogout}
        onUpgrade={() => setProOpen(true)}
        userName={userName}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="dashboard-layout-main">
        <Outlet context={{ openPro: () => setProOpen(true) }} />
      </div>

      <AnimatePresence>
        {proOpen && <ProModal onClose={() => setProOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
