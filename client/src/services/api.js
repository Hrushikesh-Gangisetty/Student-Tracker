import axios from 'axios';

// The backend address comes from client/.env (local) or the Vercel project settings (production).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token has expired, log the user out and send them to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function errorMessage(error) {
  if (!error.response) return 'Cannot reach the server. Please check that it is running.';
  return error.response.data?.message || 'Something went wrong. Please try again.';
}

export default api;
