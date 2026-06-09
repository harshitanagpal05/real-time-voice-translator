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

  useEffect(() => {
    if (user) syncUserProfile(user);
  }, [user, syncUserProfile]);

  const userName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const activeNav = ROUTE_NAV[location.pathname] || 'translate';

  const handleNav = (id) => {
    const routes = {
      dashboard: '/dashboard',
      translate: '/dashboard',
      history: '/dashboard#history',
      languages: '/dashboard#languages',
      settings: '/settings',
      'how-it-works': '/how-it-works',
      'about-founder': '/about-founder',
    };
    const target = routes[id];
    if (target?.includes('#')) {
      navigate('/dashboard');
      setTimeout(() => {
        document.getElementById(target.split('#')[1])?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else if (target) {
      navigate(target);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-layout">
      <AnimatedBackground />
      <Sidebar
        active={activeNav}
        onNavigate={handleNav}
        onLogout={handleLogout}
        onUpgrade={() => setProOpen(true)}
        userName={userName}
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
