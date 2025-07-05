import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/summary`);
      const result = await response.json();
      console.log({ result })
      if (result.statusCode === 200) {
        setLoading(false);
        setWorkouts(result.muscleGroups);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setLoading(false);
      setError(error);
    }
  };

  const addWorkout = async (workoutData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the workouts list
      await fetchWorkouts();
      return await response.json();
    } catch (err) {
      console.error('Error adding workout:', err);
      throw err;
    }
  };

  const updateWorkout = async (workoutData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/${workoutData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the workouts list
      await fetchWorkouts();
      return await response.json();
    } catch (err) {
      console.error('Error updating workout:', err);
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
