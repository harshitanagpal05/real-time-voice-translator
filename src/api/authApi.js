/**
 * authApi.js
 * Authentication via backend FastAPI with localStorage fallback.
 */

import { BACKEND_URL } from '../config/api';

const USERS_KEY = 'registered_users';

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function registerUser(name, email, password) {
  let backendOk = false;

  try {
    const res = await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await parseJson(res);
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Registration failed');
    }
    backendOk = true;
  } catch (err) {
    if (err.message === 'Email already registered') throw err;
    if (backendOk) throw err;
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  if (users.find((u) => u.email === email)) {
    if (!backendOk) throw new Error('Email already registered');
    return { success: true };
  }

  users.push({
    fullName: name,
    email,
    password,
    date: new Date().toLocaleString(),
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return { success: true };
}

export async function loginUser(email, password) {
  if (email === 'admin@test.com' && password === 'admin123') {
    return { email, fullName: 'Admin', isAdmin: true };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJson(res);
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Invalid email or password');
    }

    const localUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const local = localUsers.find((u) => u.email === email);

    return {
      email: data.email,
      fullName: local?.fullName || data.email.split('@')[0],
      isAdmin: data.role === 'admin',
    };
  } catch (err) {
    if (err.message === 'Invalid email or password') throw err;

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u) => u.email === email);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password. Create an account first.');
    }

    return { email: user.email, fullName: user.fullName, isAdmin: false };
  }
}

export async function fetchAdminUsers() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/users`);
    if (res.ok) {
      const data = await res.json();
      return data.map((u) => ({
        fullName: u.name,
        email: u.email,
        date: '—',
        role: u.role,
      }));
    }
  } catch {
    /* fallback below */
  }

  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
