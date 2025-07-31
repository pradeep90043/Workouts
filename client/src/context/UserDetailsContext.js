import { ENDPOINTS } from '../config/api';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const UserDetailsContext = createContext();

export const UserDetailsProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = useCallback(async () => {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }, []);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      console.log('Fetch user details token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(ENDPOINTS.USER_DETAILS.ME, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch user details');
      }

      const data = await response.json();
      setUserDetails(data);
      return data;
    } catch (error) {
      console.error('Error in fetchUserDetails:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const updateUserDetails = async (details) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(ENDPOINTS.USER_DETAILS.UPDATE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user details');
      }

      const data = await response.json();
      setUserDetails(data);
      return data;
    } catch (error) {
      console.error('Error in updateUserDetails:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails().catch(console.error);
  }, [fetchUserDetails]);

  const value = {
    userDetails,
    loading,
    error,
    fetchUserDetails,
    updateUserDetails,
  };

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (context === undefined) {
    throw new Error('useUserDetails must be used within a UserDetailsProvider');
  }
  return context;
};

export default UserDetailsContext;