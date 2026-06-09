/**
 * Auth.jsx
 * Login/Signup authentication component (preserved from original).
 * Uses localStorage for client-side auth + EmailJS for welcome emails.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Email validation
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Password requirement: min 6 chars, 1 letter, 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      alert('Password must be at least 6 characters and include both letters and numbers.');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      // Sign up logic
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (users.find((u) => u.email === email)) {
        alert('Email already registered!');
        setLoading(false);
        return;
      }

      const newUser = { fullName, email, date: new Date().toLocaleString() };
      users.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(users));
    }

    // Identify Admin Login
    const isAdmin = email === 'admin@test.com' && password === 'admin123';
    setTimeout(() => {
      setLoading(false);
      onLogin({ email, fullName, isAdmin });
    }, 600);
  };

  return (
    <div className="auth-page">
      {/* Background gradient mesh */}
      <div className="auth-bg-gradient" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Decorative orb */}
        <div className="auth-orb" />

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="auth-title">{isLogin ? 'Welcome to VoxAI' : 'Get Started with VoxAI'}</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Sign in to your AI voice translator' : 'Create your account and start translating'}
            </p>

            <form onSubmit={handleAuth}>
              {!isLogin && (
                <div className="auth-input-group">
                  <span className="auth-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="auth-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    id="auth-fullname"
                  />
                </div>
              )}
              <div className="auth-input-group">
                <span className="auth-icon">📧</span>
                <input
                  type="email"
                  placeholder="Email address"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="auth-email"
                />
              </div>
              <div className="auth-input-group">
                <span className="auth-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="auth-password"
                />
              </div>

              <motion.button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="auth-submit"
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>
          </motion.div>
        </AnimatePresence>

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? ' Sign Up' : ' Sign In'}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
