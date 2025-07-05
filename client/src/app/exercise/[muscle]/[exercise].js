import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
// Using addWorkout from WorkoutContext
import MuscleHistory from '../../../components/MuscleHistory';
import { TextInput } from 'react-native-paper';
import { useWorkouts } from '@context/WorkoutContext';
import { renderViewMode } from '../../../components/ViewDetails';



export default function ExerciseDetailsScreen() {
  const [isEdit, setIsEdit] = useState(false);
  const params = useLocalSearchParams();
  const { workouts, refreshWorkouts, updateWorkout } = useWorkouts();
  const exercise = workouts
    ?.find((group) => group.name === params.muscle)
    ?.exercises
    ?.find((ex) => ex.name === params.exercise);
  console.log({ exercise })
  const [exerciseData, setExerciseData] = useState(() => {
    // Use the exercise data from context if available, otherwise use defaults
    
    if (exercise) {
      const firstSet = exercise.stats[0]?.sets[0] || {};
      return {
        name: params.exercise,
        reps: exercise.stats[0]?.sets?.map(set => set.reps) || [8],
        weight: exercise.stats[0]?.sets?.map(set => set.weight) || [20],
        sets: exercise.stats[0]?.sets?.length || 3,
        rest: firstSet.rest || 60,
        duration: exercise.stats[0]?.duration,
      };
    }

    // Default values if no exercise data is found
    return {
      name: params.exercise,
      reps: [8, 8, 8],
      weight: [20, 20, 20],
      sets: 3,
      rest: 60,
      history: []
    };
  });

  const handleInputChange = (field, setIndex, value) => {
    setExerciseData(prev => {
      const newData = { ...prev };

      if (field === 'reps' || field === 'weight') {
        // For reps and weight, we need to update the specific set
        newData[field] = [...prev[field]];
        // Allow decimal numbers for weight, but not for reps
        const numericValue = field === 'weight'
          ? parseFloat(value) || 0
          : Math.floor(Number(value)) || 0;
        newData[field][setIndex] = numericValue;
      } else if (field === 'sets') {
        // When changing number of sets, adjust the arrays accordingly
        const newSets = Math.max(1, Math.min(10, Number(value) || 1)); // Limit between 1-10 sets
        const currentSets = prev.sets;

        if (newSets > currentSets) {
          // Add new sets with default values
          const repsToAdd = newSets - currentSets;
          const lastRep = prev.reps.length > 0 ? prev.reps[prev.reps.length - 1] : 8;
          const lastWeight = prev.weight.length > 0 ? prev.weight[prev.weight.length - 1] : 20;

          newData.reps = [...prev.reps, ...Array(repsToAdd).fill(lastRep)];
          newData.weight = [...prev.weight, ...Array(repsToAdd).fill(lastWeight)];
        } else if (newSets < currentSets) {
          // Remove extra sets
          newData.reps = prev.reps.slice(0, newSets);
          newData.weight = prev.weight.slice(0, newSets);
        }

        newData.sets = newSets;
      } else if (field === 'rest') {
        // For rest time, ensure it's a positive number
        newData[field] = Math.max(0, Number(value) || 0);
      } else if (field === 'duration') {
        // For duration, ensure it's a positive number
        newData[field] = Math.max(0, Number(value) || 0);
      }

      return newData;
    });
  };


  const updateExercise = async () => {
    try {
      // Format the data according to the server's expected format
      const exerciseDataToSend = {
        id: exercise.id,
        name: params.exercise,
        muscleGroup: params.muscle,
        sets: exerciseData.reps.map((reps, index) => ({
          reps: Number(reps) || 0,
          weight: Number(exerciseData.weight[index]) || 0,
          rest: Number(exerciseData.rest) || 60
        })),
        notes: ""
      };

      console.log('Sending workout data:', JSON.stringify(exerciseDataToSend, null, 2));

      const result = await updateWorkout(exerciseDataToSend);

      // Show success message
      Alert.alert('Success', 'Workout saved successfully!');

      // Exit edit mode
      setIsEdit(false);

      // Refresh the workout data
      // refreshWorkouts already called inside addWorkout
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', error.message || 'Failed to save workout');
    }
  };

  const onChangeHandler = () => {
    console.log({ isEdit });
    if (isEdit) {
      setIsEdit(false);
      updateExercise();
    } else {
      setIsEdit(true);
    }
  };

  const renderEditForm = () => (
    <View style={styles.container}>
      <View style={styles.exerciseBlock}>
        <Text style={styles.exerciseName}>{exerciseData.name}</Text>

        <View style={styles.setsContainer}>
          {exercise?.muscleGroup !== "cardio" ? Array.from({ length: exerciseData.sets }).map((_, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Set {setIndex + 1} Reps:</Text>
                <TextInput
                  style={styles.input}
                  value={exerciseData.reps[setIndex]?.toString() || ''}
                  onChangeText={(value) => {
                    // Allow only whole numbers for reps
                    if (/^\d*$/.test(value) || value === '') {
                      handleInputChange('reps', setIndex, value);
                    }
                  }}
                  keyboardType="number-pad"
                  placeholder="Reps"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Set {setIndex + 1} Weight (kg):</Text>
                <TextInput
                  style={styles.input}
                  value={exerciseData.weight[setIndex]?.toString() || ''}
                  onChangeText={(value) => {
                    // Allow only numbers and decimal point
                    if (/^\d*\.?\d*$/.test(value) || value === '') {
                      handleInputChange('weight', setIndex, value);
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder="Weight"
                />
              </View>
            </View>
          )) : <View style={styles.inputContainer}>
            <Text style={styles.label}>Duration (s):</Text>
            <TextInput
              style={styles.input}
              value={exerciseData.duration.toString()}
              onChangeText={(value) => handleInputChange('duration', null, value)}
              keyboardType="numeric"
              placeholder="Enter duration"
            />
          </View>

          }
        </View>


       { !exerciseData.duration && <View style={styles.inputContainer}>
          <Text style={styles.label}>Rest (s):</Text>
          <TextInput
            style={styles.input}
            value={exerciseData.rest.toString()}
            onChangeText={(value) => handleInputChange('rest', null, value)}
            keyboardType="numeric"
            placeholder="Enter rest time"
          />
        </View>}
      </View>
    </View>
  );



  return (
    <ScrollView>
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.editButton} onPress={onChangeHandler}>
            <Text style={styles.editText}>{isEdit ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
          {isEdit && <TouchableOpacity style={styles.editButton} onPress={() => setIsEdit(false)}>
            <Text style={styles.editText}>Cancel</Text>
          </TouchableOpacity>}
        </View>

        {isEdit ? renderEditForm() : renderViewMode({ exercise })}

        <MuscleHistory
          exercises={[exercise]}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  editText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  exerciseBlock: {
    marginBottom: 12,
    padding: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  setsContainer: {
    marginBottom: 16,
  },
  setContainer: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
    minWidth: 120,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    width: 80,
  },
});
