/**
 * Axios API client — base URL from VITE_API_URL with JWT interceptor.
 */

import axios from 'axios';
import { getToken } from '../utils/session';

const API_ROOT = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

const api = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

export function getApiBaseUrl() {
  return API_ROOT;
}