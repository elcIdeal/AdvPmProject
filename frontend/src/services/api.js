import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

let tokenCallback = null;

export const initializeAuth = (getAccessToken) => {
  tokenCallback = getAccessToken;
};

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    if (!tokenCallback) {
      throw new Error('Auth not initialized');
    }
    const token = await tokenCallback();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error getting access token:', error);
    return Promise.reject(error);
  }
});

export const fetchSummary = () => {
  return api.get('/api/analysis/summary');
};

export const fetchInsights = () => {
  return api.get('/api/analysis/insights');
};

export const uploadTransactions = (formData) => {
  return api.post('/api/transactions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};