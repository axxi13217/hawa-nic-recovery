import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the token automatically to every request, if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hawaToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;