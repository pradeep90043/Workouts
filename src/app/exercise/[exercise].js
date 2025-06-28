import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import MuscleHistory from '../../components/MuscleHistory';
import { TextInput } from 'react-native-paper';



export default function ExerciseDetailsScreen() {
  const [isEdit, setIsEdit] = useState(false);
  const [exerciseData, setExerciseData] = useState(() => {
    const params = useLocalSearchParams();  
    console.log({params})
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

  const renderEditForm = () => (
    <View style={styles.container}>
      <View style={styles.exerciseBlock}>
        <Text style={styles.exerciseName}>{exerciseData.name}</Text>
        
        <View style={styles.setsContainer}>
          {exerciseData.reps.map((rep, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Set {setIndex + 1} Reps:</Text>
                <TextInput
                  style={styles.input}
                  value={rep.toString()}
                  onChangeText={(value) => handleInputChange('reps', setIndex, value)}
                  keyboardType="numeric"
                  placeholder="Reps"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Set {setIndex + 1} Weight (kg):</Text>
                <TextInput
                  style={styles.input}
                  value={exerciseData.weight[setIndex].toString()}
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
          {/* <TouchableOpacity style={styles.backButton}>
            <Link href={`../${params.name}`}>
              <Text style={styles.backText}>← Back</Text>
            </Link>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEdit(!isEdit)}>
            <Text style={styles.editText}>{isEdit ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
          {isEdit && <TouchableOpacity style={styles.editButton} onPress={() => setIsEdit(false)}>
            <Text style={styles.editText}>Cancel</Text>
          </TouchableOpacity>}
        </View>

        {isEdit ? renderEditForm() : renderViewMode()}

        <MuscleHistory
          exercises={[exerciseData]}
          history={exerciseData.history}
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
