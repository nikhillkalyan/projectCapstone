import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getExpiredSessionRedirectPath = () => {
  const storedUser = localStorage.getItem('lms_user');

  if (!storedUser) {
    return '/';
  }

  try {
    const { role } = JSON.parse(storedUser);

    if (role === 'student') return '/student/login';
    if (role === 'instructor') return '/instructor/login';
  } catch (error) {
    console.warn('Failed to parse stored user during auth redirect', error);
  }

  return '/';
};

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('lms_user');
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const redirectPath = getExpiredSessionRedirectPath();
      localStorage.removeItem('lms_user');
      localStorage.removeItem('token');
      window.location.replace(redirectPath);
    }
    return Promise.reject(error);
  }
);

export default api;
