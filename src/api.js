import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create Axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
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
