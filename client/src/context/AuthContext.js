import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const storage = {
    async getItem(key) {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      const result = await SecureStore.getItemAsync(key);
      console.log(key, result);
      return result;
    },
    async setItem(key, value) {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    },
    async removeItem(key) {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    }
  };
  // Load user data from SecureStore and validate with server
  const loadUserData = useCallback(async () => {
    try {
      const [token, userData] = await Promise.all([
        storage.getItem(TOKEN_KEY),
        storage.getItem(USER_KEY),
      ]);

      if (token && userData) {
        try {
          // Validate the token with the server
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        } catch (error) {
          console.log('Token validation failed, logging out...', error);
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(USER_KEY);
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to load user data', error);
      return false;
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await loadUserData();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [loadUserData]);

  // Login function using the API client
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    console.log('Login function called');
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        const { token, user } = response;
        
        // Store the token and user data
        await Promise.all([
          storage.setItem(TOKEN_KEY, token),
          storage.setItem(USER_KEY, JSON.stringify(user)),
        ]);
        
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function using the API client
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure we're sending the correct data structure to the API
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      if (response.success) {
        const { token, user } = response;
        console.log('User registered successfully:', user);
        
        // Store the token and user data
        await Promise.all([
          storage.setItem(TOKEN_KEY, token),
          storage.setItem(USER_KEY, JSON.stringify(user)),
        ]);
        
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored data
      await Promise.all([
        storage.removeItem(TOKEN_KEY),
        storage.removeItem(USER_KEY),
      ]);
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Failed to log out' };
    }
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };
  console.log('AuthContext', {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError,
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
