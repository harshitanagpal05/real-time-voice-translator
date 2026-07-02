import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/Auth/AuthLayout';
import { loginUser, googleLogin } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(value) {
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};

    if (!email.trim()) next.email = 'Email is required';
    else if (!validateEmail(email)) next.email = 'Enter a valid email address';

    if (!password) next.password = 'Password is required';
    else if (!validatePassword(password)) {
      next.password = 'Min 6 characters with letters and numbers';
    }

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const user = await loginUser(email.trim(), password);
      login(user);
      navigate(user.isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrors({});
    setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      login(user);
      navigate(user.isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.message || 'Google sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your voice translator"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <motion.div
            className="auth-error-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.form}
          </motion.div>
        )}

        <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
          <label htmlFor="login-email">Email</label>
          <div className="auth-input-wrap">
            <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" stroke="none" fill="currentColor" opacity="0" />
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '', form: '' })); }}
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="auth-field-error">{errors.email}</span>}
        </div>

        <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
          <label htmlFor="login-password">Password</label>
          <div className="auth-input-wrap">
            <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '', form: '' })); }}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-toggle-pw"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <span className="auth-field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? <span className="auth-spinner" /> : 'Sign In'}
        </button>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="auth-google-wrap">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrors({ form: 'Google sign-in failed. Please try again.' })}
            theme="filled_black"
            size="large"
            shape="pill"
            width="100%"
            text="signin_with"
          />
        </div>

        <p className="auth-switch">
          Don&apos;t have an account?
          <Link to="/signup" className="auth-switch-link">Create Account</Link>
        </p>

      </form>
    </AuthLayout>
  );
}
