import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import AdminLayout from './components/AdminLayout/AdminLayout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const AboutFounderPage = lazy(() => import('./pages/AboutFounderPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const LanguagesPage = lazy(() => import('./pages/LanguagesPage'));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminActivityPage = lazy(() => import('./pages/admin/AdminActivityPage'));
const AdminSystemPage = lazy(() => import('./pages/admin/AdminSystemPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const hasGoogleClientId = Boolean(GOOGLE_CLIENT_ID);

function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.isAdmin ? '/admin' : '/dashboard'} replace />;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense
      fallback={(
        <AnimatedPage>
          <div style={{ display: 'grid', minHeight: '60vh', placeItems: 'center', color: 'var(--text-secondary)' }}>
            Loading workspace...
          </div>
        </AnimatedPage>
      )}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<GuestRoute><AnimatedPage><LoginPage /></AnimatedPage></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><AnimatedPage><SignupPage /></AnimatedPage></GuestRoute>} />

          {/* User Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about-founder" element={<AboutFounderPage />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/activity" element={<AdminActivityPage />} />
            <Route path="/admin/system" element={<AdminSystemPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  if (!hasGoogleClientId) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
        <div>
          <h1 style={{ marginBottom: '0.75rem' }}>Google sign-in is not configured</h1>
          <p style={{ maxWidth: '42rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Add <strong>VITE_GOOGLE_CLIENT_ID</strong> to <strong>ai-translator-frontend/.env</strong> and register <strong>http://localhost:5173</strong> in Google Cloud Console as an authorized JavaScript origin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
