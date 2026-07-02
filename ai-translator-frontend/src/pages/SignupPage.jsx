import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/Auth/AuthLayout';
import { registerUser, googleLogin } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { hasGoogleSignIn } from '../config/googleAuth';

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(value) {
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value);
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};

    if (!fullName.trim()) next.fullName = 'Full name is required';
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
      const user = await registerUser(fullName.trim(), email.trim(), password);
      login(user);
      navigate(user.isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
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
      setErrors({ form: err.message || 'Google sign-up failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start translating voices in seconds"
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

        <div className={`auth-field ${errors.fullName ? 'has-error' : ''}`}>
          <label htmlFor="signup-name">Full Name</label>
          <div className="auth-input-wrap">
            <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="signup-name"
              type="text"
              className="auth-input"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '', form: '' })); }}
              autoComplete="name"
            />
          </div>
          {errors.fullName && <span className="auth-field-error">{errors.fullName}</span>}
        </div>

        <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
          <label htmlFor="signup-email">Email</label>
          <div className="auth-input-wrap">
            <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              id="signup-email"
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
          <label htmlFor="signup-password">Password</label>
          <div className="auth-input-wrap">
            <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder="Min 6 chars, letters + numbers"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '', form: '' })); }}
              autoComplete="new-password"
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
          {loading ? <span className="auth-spinner" /> : 'Create Account'}
        </button>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {hasGoogleSignIn ? (
          <>
            <div className="auth-google-caption">Continue with <span>Google</span></div>
            <div className="auth-google-wrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrors({ form: 'Google sign-up failed. Please try again.' })}
              theme="filled_black"
              size="large"
              shape="pill"
              width="100%"
              text="signup_with"
            />
            </div>
          </>
        ) : (
          <div className="auth-google-wrap" style={{ color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
            Google sign-in is unavailable in this deployment.
          </div>
        )}

        <p className="auth-switch">
          Already have an account?
          <Link to="/login" className="auth-switch-link">Sign In</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
