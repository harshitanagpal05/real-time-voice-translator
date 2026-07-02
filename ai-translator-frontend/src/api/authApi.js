/**
 * authApi.js — Authentication via VoxAI FastAPI backend.
 */

import api from './api';

export async function registerUser(name, email, password) {
  const { data } = await api.post('/register', {
    name,
    email,
    password,
  });

  return {
    token: data.token,
    email: data.user.email,
    fullName: data.user.name,
    isAdmin: false,
  };
}

export async function loginUser(email, password) {
  // Local admin shortcut
  if (email === 'admin@test.com' && password === 'admin123') {
    return {
      email,
      fullName: 'Admin',
      isAdmin: true,
      token: null,
    };
  }

  const { data } = await api.post('/login', {
    email,
    password,
  });

  return {
    token: data.token,
    email: data.user.email,
    fullName: data.user.name,
    isAdmin: false,
  };
}

export async function fetchAdminUsers() {
  const { data } = await api.get('/admin/users');
  return data;
}

export async function checkBackendHealth() {
  try {
    const root = import.meta.env.DEV
      ? ''
      : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

    const res = await fetch(`${root}/`, {
      signal: AbortSignal.timeout(3000),
    });

    return res.ok;
  } catch {
    return false;
  }
}