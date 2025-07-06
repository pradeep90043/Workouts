// API base URL - this should come from environment variables in production
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.115:8080/api/v1'  // Use your computer's local IP
  : 'https://workouts-server-sm89.onrender.com/api/v1';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  WORKOUTS: {
    BASE: `${API_BASE_URL}/workouts`,
    SUMMARY: `${API_BASE_URL}/workouts/summary`,
  },
};

export default {
  API_BASE_URL,
  ENDPOINTS,
};
