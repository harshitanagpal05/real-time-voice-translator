/**
 * authApi.js — Authentication via VoxAI FastAPI backend.
 */

const FASTAPI_ROOT = import.meta.env.VITE_API_URL || 'https://voxai-python-api.onrender.com';

function normalizeAuthResponse(data, fallbackEmail, fallbackName) {
  if (data?.error) {
    throw new Error(data.error);
  }

  const resolvedEmail = data?.email ?? fallbackEmail;

  return {
    token: data?.token ?? null,
    email: resolvedEmail,
    fullName: data?.name ?? fallbackName ?? (resolvedEmail?.split('@')[0] ?? ''),
    isAdmin: data?.role === 'admin',
  };
}

async function postFastApiAuth(path, payload) {
  const res = await fetch(`${FASTAPI_ROOT}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error || data?.detail || `Request failed with status code ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function registerUser(name, email, password) {
  const data = await postFastApiAuth('/register', {
    name,
    email,
    password,
  });

  return normalizeAuthResponse(data, email, name);
}

export async function loginUser(email, password) {
  const data = await postFastApiAuth('/login', {
    email,
    password,
  });

  return normalizeAuthResponse(data, email);
}

export async function googleLogin(credential) {
  const data = await postFastApiAuth('/auth/google', { credential });
  return normalizeAuthResponse(data, data?.email);
}

export async function fetchAdminUsers() {
  const res = await fetch(`${FASTAPI_ROOT}/admin/users`);
  const data = await res.json().catch(() => []);

  if (!res.ok) {
    const message = data?.error || data?.detail || `Request failed with status code ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${FASTAPI_ROOT}/`, {
      signal: AbortSignal.timeout(3000),
    });

    return res.ok;
  } catch {
    return false;
  }
}