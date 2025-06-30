// Centralized constants for the client application
// Update the PORT here if the Express backend changes
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const PORT = 8080;
// Determine host for API. For native, use the dev machine's IP derived from hostUri.
const localhost = Platform.select({
  web: 'localhost',
  default: Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost',
});
export const API_BASE_URL = `http://${localhost}:${PORT}`;
