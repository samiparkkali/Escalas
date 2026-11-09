import axios from 'axios';

const TOKEN_KEY = 'escalas.token';

// Empty in development: the Vite dev server proxies /api to the backend.
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
});

const unauthorizedListeners = new Set();

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const onUnauthorized = (listener) => {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.endsWith('/api/auth/login');
    if (error.response?.status === 401 && !isLogin) {
      setToken(null);
      unauthorizedListeners.forEach((listener) => listener());
    }
    return Promise.reject(error);
  },
);

// Turns an API error into a message a user can act on.
export const errorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string' && detail) return `${fallback}: ${detail}`;
  if (Array.isArray(detail) && detail.length) {
    const messages = detail.map((d) => (d.msg || '').replace(/^Value error, /, '')).filter(Boolean);
    if (messages.length) return `${fallback}: ${messages.join('; ')}`;
  }
  if (error?.response) return `${fallback} (HTTP ${error.response.status})`;
  if (error?.request) return `${fallback}: the server could not be reached`;
  return fallback;
};

export const filenameFromDisposition = (header, fallback) => {
  const match = /filename="?([^";]+)"?/i.exec(header || '');
  return match ? match[1] : fallback;
};

export const login = async (username, password) => {
  const { data } = await api.post('/api/auth/login', { username, password });
  setToken(data.access_token);
  return data.username;
};

export const logout = () => setToken(null);

export const downloadSchedule = async () => {
  let response;
  try {
    response = await api.get('/api/schedule/export', { responseType: 'blob' });
  } catch (error) {
    // Blob responses hide the JSON error body; decode it so errorMessage can read it.
    const body = error.response?.data;
    if (body instanceof Blob) {
      try {
        error.response.data = JSON.parse(await body.text());
      } catch {
        // Not JSON; keep the status-only message.
      }
    }
    throw error;
  }
  const filename = filenameFromDisposition(response.headers['content-disposition'], 'escalas.csv');
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default api;
