import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      'X-Auth0-Id': 'auth0|local_dummy_001'
    };
    console.log('Petición saliente con headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
