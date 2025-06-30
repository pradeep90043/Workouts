import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
// Using addWorkout from WorkoutContext
import MuscleHistory from '../../../components/MuscleHistory';
import { TextInput } from 'react-native-paper';
import { useWorkouts } from '@context/WorkoutContext';



export default function ExerciseDetailsScreen() {
  const [isEdit, setIsEdit] = useState(false);
  const params = useLocalSearchParams();
  const { workouts, refreshWorkouts, addWorkout } = useWorkouts();
  const exercise = workouts[0]?.muscleGroups
    ?.find((group) => group.name === params.muscle)
    ?.exercises
    ?.find((ex) => ex.name === params.exercise);
  console.log({exercise})
  const [exerciseData, setExerciseData] = useState(() => {
    // Use the exercise data from context if available, otherwise use defaults
    const currentExercise = workouts[0]?.muscleGroups
      ?.find((group) => group.name === params.muscle)
      ?.exercises?.find((ex) => ex.name === params.exercise);

    if (currentExercise) {
      const firstSet = currentExercise.stats[0]?.sets[0] || {};
      return {
        name: params.exercise,
        reps: currentExercise.stats[0]?.sets?.map(set => set.reps) || [8],
        weight: currentExercise.stats[0]?.sets?.map(set => set.weight) || [20],
        sets: currentExercise.stats[0]?.sets?.length || 3,
        rest: firstSet.rest || 60,
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
        newData[field][setIndex] = Number(value) || 0;
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
      }
      
      return newData;
    });
  };


  const addExercise = async () => {
    try {
      // Format the data according to the server's expected format
      const workoutData = {
        exercises: [{
          name: params.exercise,
          muscleGroup: params.muscle,
          sets: exerciseData.reps.map((reps, index) => ({
            reps: Number(reps) || 0,
            weight: Number(exerciseData.weight[index]) || 0,
            rest: Number(exerciseData.rest) || 60
          })),
          notes: ""
        }]
      };

      console.log('Sending workout data:', JSON.stringify(workoutData, null, 2));

      const result = await addWorkout(workoutData);

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
      addExercise();
    } else {
      setIsEdit(true);
    }
  };

  const renderEditForm = () => (
    <View style={styles.container}>
      <View style={styles.exerciseBlock}>
        <Text style={styles.exerciseName}>{exerciseData.name}</Text>

        <View style={styles.setsContainer}>
          {Array.from({ length: exerciseData.sets }).map((_, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Set {setIndex + 1} Reps:</Text>
                <TextInput
                  style={styles.input}
                  value={exerciseData.reps[setIndex]?.toString() || ''}
                  onChangeText={(value) => handleInputChange('reps', setIndex, value)}
                  keyboardType="numeric"
                  placeholder="Reps"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Set {setIndex + 1} Weight (kg):</Text>
                <TextInput
                  style={styles.input}
                  value={exerciseData.weight[setIndex]?.toString() || ''}
                  onChangeText={(value) => handleInputChange('weight', setIndex, value)}
                  keyboardType="numeric"
                  placeholder="Weight"
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Total Sets:</Text>
          <TextInput
            style={styles.input}
            value={exerciseData.sets.toString()}
            onChangeText={(value) => handleInputChange('sets', null, value)}
            keyboardType="numeric"
            placeholder="Enter sets"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Rest (s):</Text>
          <TextInput
            style={styles.input}
            value={exerciseData.rest.toString()}
            onChangeText={(value) => handleInputChange('rest', null, value)}
            keyboardType="numeric"
            placeholder="Enter rest time"
          />
        </View>
      </View>
    </View>
  );

  const renderViewMode = () => (
    <View style={styles.container}>
      <View style={styles.exerciseBlock}>
        <Text style={styles.exerciseName}>{exerciseData.name}</Text>
        <Text style={styles.label}>Reps: {exerciseData.reps.join(', ')}</Text>
        <Text style={styles.label}>Weight: {exerciseData.weight.join(', ')}</Text>
        <Text style={styles.label}>Sets: {exerciseData.sets}</Text>
        <Text style={styles.label}>Rest: {exerciseData.rest}</Text>
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

        {isEdit ? renderEditForm() : renderViewMode()}

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
