import { StyleSheet, Text, View, Image } from "react-native";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getExerciseImage } from "../utils/exerciseImages";

const MuscleGroup = ({ exercises }) => {
const params = useLocalSearchParams();
console.log({params, exercises})
  const defaultJSx = () => (
    <View style={styles.container}>
      {exercises?.map((exercise, index) => (
        <Link 
          href={{ 
            pathname: `/exercise/${params.name}/${exercise.name}`,
            query: { muscle: params.name }
          }} 
          asChild 
          key={index}
        >
          <TouchableOpacity style={styles.exerciseBlock}>
            <View style={styles.exerciseHeader}>
              <Image 
                source={getExerciseImage(exercise.name)}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.label}>Reps: {exercise.stats[0]?.sets?.map((set) => set.reps).join(", ") || 'N/A'}</Text>
                <Text style={styles.label}>Weight: {exercise.stats[0]?.sets?.map((set) => set.weight).join(", ") || 'N/A'}</Text>
                <Text style={styles.label}>Sets: {exercise.stats[0]?.sets?.length || '0'}</Text>
                <Text style={styles.label}>Rest: {exercise.stats[0]?.sets?.map((set) => set.rest).join(", ") || 'N/A'}</Text>
              </View>
            </View>
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
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  exerciseInfo: {
    flex: 1,
    padding: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: '#333',
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
