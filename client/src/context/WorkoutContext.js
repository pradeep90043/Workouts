import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ENDPOINTS } from '../config/api';
import * as SecureStore from 'expo-secure-store';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const [workouts, setWorkouts] = useState([]);
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

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getAuthToken();
      console.log('Fetch workouts token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(ENDPOINTS.WORKOUTS.SUMMARY, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
console.log('Fetch workouts response:', response);
      if (response.status === 401) {
        // Handle unauthorized (token might be expired)
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Fetched workouts:', result);
      
      // Update based on your actual API response structure
      setWorkouts(result?.muscleGroups || result);
      return result;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError(error.message || 'Failed to load workouts');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workoutData) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(ENDPOINTS.WORKOUTS.BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Refresh the workouts list
      await fetchWorkouts();
      return await response.json();
    } catch (err) {
      console.error('Error adding workout:', err);
      setError(err.message || 'Failed to add workout');
      throw err;
    }
  };

  const updateWorkout = async (workoutData) => {
    try {
      const token = await getAuthToken();
      console.log('Update workout token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ENDPOINTS.WORKOUTS.BASE}/${workoutData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Refresh the workouts list
      await fetchWorkouts();
      return await response.json();
    } catch (err) {
      console.error('Error updating workout:', err);
      setError(err.message || 'Failed to update workout');
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWorkouts();
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        loading,
        error,
        refreshWorkouts: fetchWorkouts,
        addWorkout,
        updateWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
};
