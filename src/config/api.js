/** Backend URL — uses Vite proxy in dev for reliable CORS */
export const BACKEND_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001');
