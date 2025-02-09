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

// New API endpoints for credit card recommendations and scraping
export const fetchCreditCardRecommendations = () => {
  return api.get('/api/recommender/suggest-credit-cards');
};

export const fetchCreditCardInfo = () => {
  return api.get('/api/scraper/credit-cards-info');
};

// Transaction listing endpoint
export const fetchTransactions = (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  return api.get('/api/transactions/list', { params });
};