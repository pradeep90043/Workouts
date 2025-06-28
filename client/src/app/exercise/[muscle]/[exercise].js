import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import MuscleHistory from '../../../components/MuscleHistory';
import { TextInput } from 'react-native-paper';
import { useWorkouts } from '@context/WorkoutContext';



export default function ExerciseDetailsScreen() {
  const [isEdit, setIsEdit] = useState(false);
  const params = useLocalSearchParams();
  const { workouts } = useWorkouts();
  const exercise = workouts[0].muscleGroups?.find((group) => group.name === params.muscle)?.exercises?.find((exercise) => exercise.name === params.exercise);
  console.log({exercise})
  const [exerciseData, setExerciseData] = useState(() => {
    return {
      name: params.exercise,
      reps: [0, 0, 0],
      weight: [0, 0, 0],
      sets: 3,
      rest: 0,
      history: []
    };
  });

  const handleInputChange = (field, setIndex, value) => {
    const newExercise = { ...exerciseData };
    if (field === 'sets') {
      newExercise[field] = parseInt(value);
      // Update reps and weight arrays to match new sets count
      if (parseInt(value) > newExercise.reps.length) {
        while (newExercise.reps.length < parseInt(value)) {
          newExercise.reps.push(0);
          newExercise.weight.push(0);
        }
      } else if (parseInt(value) < newExercise.reps.length) {
        newExercise.reps = newExercise.reps.slice(0, parseInt(value));
        newExercise.weight = newExercise.weight.slice(0, parseInt(value));
      }
    } else {
      const currentValues = newExercise[field];
      const updatedValues = [...currentValues];
      updatedValues[setIndex] = parseInt(value);
      newExercise[field] = updatedValues;
    }
    setExerciseData(newExercise);
  };


  const addExercise = async () => {
    try {
      const newExercise = { ...exerciseData, note: "" };
      delete newExercise.history;
      delete newExercise.name;
      const formattedExerciseName = params.exercise.toLowerCase().replaceAll(" ", "");
      const url = `http://localhost:3002/api/workouts/${params.muscle}/exercises/${formattedExerciseName}/stats`;

      console.log('Sending request to:', url);
      console.log('Request body:', JSON.stringify(newExercise, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExercise),
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Server responded with non-JSON data: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        console.error('Server error details:', {
          status: response.status,
          statusText: response.statusText,
          body: responseData
        });
        const errorMessage = responseData.error || responseData.message || 'Unknown server error';
        const errorDetails = responseData.details ? ` Details: ${responseData.details}` : '';
        throw new Error(`Server error (${response.status}): ${errorMessage}${errorDetails}`);
      }

      console.log('Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in addExercise:', error);
      throw error; // Re-throw to allow error boundary to catch it
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
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        <View style={styles.setsContainer}>
          {exercise.stats[0].sets?.map((set, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Set {setIndex + 1} Reps:</Text>
                <TextInput
                  style={styles.input}
                  value={set.reps.toString()}
                  onChangeText={(value) => handleInputChange('reps', setIndex, value)}
                  keyboardType="numeric"
                  placeholder="Reps"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Set {setIndex + 1} Weight (kg):</Text>
                <TextInput
                  style={styles.input}
                  value={set.weight.toString()}
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
            value={exercise.stats[0].sets?.length.toString()}
            onChangeText={(value) => handleInputChange('sets', null, value)}
            keyboardType="numeric"
            placeholder="Enter sets"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Rest (s):</Text>
          <TextInput
            style={styles.input}
            value={exercise.stats[0].sets?.map((set) => set.rest).reduce((a, b) => a + b, 0).toString()}
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
           <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.label}>Reps: {exercise.stats[0].sets?.map((set) => set.reps).join(", ") || 'N/A'}</Text>
                    <Text style={styles.label}>Weight: {exercise.stats[0].sets?.map((set) => set.weight).join(", ") || 'N/A'}</Text>
                    <Text style={styles.label}>Sets: {exercise.stats[0].sets?.length}</Text>
                    <Text style={styles.label}>Rest: {exercise.stats[0].sets?.map((set) => set.rest).join(", ") || 'N/A'}</Text>
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
          history={exercise.history}
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
