import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const userJson = localStorage.getItem('currentUser');
      const auth0Id = userJson ? JSON.parse(userJson).id : 'auth0|local_dummy_001';
      config.headers['X-Auth0-Id'] = auth0Id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setupInterceptors = (getAccessTokenSilently) => {
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await getAccessTokenSilently();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        return config;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default api;
