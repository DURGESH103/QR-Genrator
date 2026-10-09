import axios from 'axios';

// Absolute backend URL in production (e.g. https://api.example.com/api); falls back to the dev proxy
const API_BASE_URL = (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// QR Code API
export const qrAPI = {
  generate: (data) => api.post('/qr/generate', data),
  preview: (data) => api.post('/qr/preview', data),
  uploadImage: (formData) => api.post('/qr/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/qr', { params }),
  getOne: (id) => api.get(`/qr/${id}`),
  update: (id, data) => api.put(`/qr/${id}`, data),
  delete: (id) => api.delete(`/qr/${id}`),
  trackScan: (id) => api.post(`/qr/${id}/scan`),
};

// Public API (no auth) used by the /view/:id share page
export const publicAPI = {
  getQr: (id) => api.get(`/public/qr/${id}`),
  imageUrl: (path) => `${API_BASE_URL}${path.replace(/^\/api/, '')}`,
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getScanAnalytics: (params) => api.get('/analytics/scans', { params }),
  getQRAnalytics: (id) => api.get(`/analytics/qr/${id}`),
};

export default api;