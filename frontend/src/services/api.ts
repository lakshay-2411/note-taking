import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const authAPI = {
  signup: (data: { name: string; email: string; dateOfBirth: string }) =>
    api.post('/auth/signup', data),
  
  login: (data: { email: string }) =>
    api.post('/auth/login', data),
  
  verifyOTP: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),
  
  resendOTP: (data: { email: string }) =>
    api.post('/auth/resend-otp', data),
  
  googleAuth: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
};

export const notesAPI = {
  getNotes: () => api.get('/notes'),
  
  createNote: (data: { title: string; content: string }) =>
    api.post('/notes', data),
  
  updateNote: (id: string, data: { title: string; content: string }) =>
    api.put(`/notes/${id}`, data),
  
  deleteNote: (id: string) => api.delete(`/notes/${id}`),
  
  getNote: (id: string) => api.get(`/notes/${id}`),
};

export default api;
