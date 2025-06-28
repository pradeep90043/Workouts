import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";

const MuscleGroup = ({ exercises }) => {

  const defaultJSx = () => (
    <View style={styles.container}>
      {exercises.map((exercise , index) => (
        <Link href={`/exercise/${exercise.name}`} asChild key={index} params={{ exercise: JSON.stringify(exercise) }}>
          <TouchableOpacity style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.label}>Reps: {exercise.reps.join(", ") || 'N/A'}</Text>
            <Text style={styles.label}>Weight: {exercise.weight.join(", ") || 'N/A'}</Text>
            <Text style={styles.label}>Sets: {exercise.sets}</Text>
            <Text style={styles.label}>Rest: {exercise.rest}</Text>
          </TouchableOpacity>
        </Link>
      ))}
    </View>
  );

  return defaultJSx();
};

const styles = StyleSheet.create({
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
    backgroundColor: "#f8f8f8",
    borderRadius: 6,
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
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default MuscleGroup;
