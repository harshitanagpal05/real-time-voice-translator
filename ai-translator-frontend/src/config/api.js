/** Backend API base — uses Vite proxy in dev */
export const BACKEND_URL = import.meta.env.DEV
  ? '/api'
  : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;
