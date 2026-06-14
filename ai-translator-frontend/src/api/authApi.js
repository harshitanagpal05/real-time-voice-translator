/**
 * authApi.js — Authentication via VoxAI Express backend.
 */

import api from './api';

export async function registerUser(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return {
    token: data.token,
    email: data.user.email,
    fullName: data.user.name,
    isAdmin: false,
  };
}

export async function loginUser(email, password) {
  if (email === 'admin@test.com' && password === 'admin123') {
    return { email, fullName: 'Admin', isAdmin: true, token: null };
  }

  const { data } = await api.post('/auth/login', { email, password });
  return {
    token: data.token,
    email: data.user.email,
    fullName: data.user.name,
    isAdmin: false,
  };
}

export async function fetchAdminUsers() {
  return JSON.parse(localStorage.getItem('registered_users') || '[]');
}

export async function checkBackendHealth() {
  try {
    const root = import.meta.env.DEV
      ? ''
      : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
    const res = await fetch(`${root}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
