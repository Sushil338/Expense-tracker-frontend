import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const SESSION_EXPIRED_MESSAGE = 'Your session expired. Please log in again.';

// Create Axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('userId');
  delete API.defaults.headers.common['Authorization'];
};

// Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired token
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const hasActiveToken = Boolean(localStorage.getItem('token'));
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (status === 401 && hasActiveToken && !isLoginRequest) {
      console.warn("Session expired. Logging out...");
      clearStoredAuth();
      sessionStorage.setItem('authError', SESSION_EXPIRED_MESSAGE);
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason: 'session-expired' }
      }));
    }
    return Promise.reject(error);
  }
);

// Manual token setter
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// ✅ UPDATE USER API
export const updateUser = (id, data) => {
  return API.put(`/auth/update/${id}`, data);
};

export const getCurrentUser = () => {
  return API.get('/auth/me');
};

export const addExtraBudget = (data) => {
  return API.post('/budget/extra-budget', data);
};

export default API;
