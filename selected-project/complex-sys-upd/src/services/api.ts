import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchDashboardData = async () => {
  try {
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAnalyticsData = async (params: Record<string, string>) => {
  try {
    const response = await api.get('/analytics', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserSettings = async (data: Record<string, unknown>) => {
  try {
    const response = await api.patch('/settings', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    throw error;
  }
};

export default api;