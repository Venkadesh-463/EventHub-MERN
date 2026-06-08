import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to include the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('userInfo');
      const userInfo = stored && stored !== 'undefined' ? JSON.parse(stored) : null;

      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    } catch (e) {
      console.error('Error parsing userInfo from localStorage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance
