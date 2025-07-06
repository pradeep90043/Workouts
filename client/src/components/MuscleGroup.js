import { StyleSheet, Text, View, Image } from "react-native";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getExerciseImage } from "../utils/exerciseImages";
import { renderViewMode } from "./ViewDetails";
const MuscleGroup = ({ exercises }) => {
console.log({ exercises})
  const defaultJSx = () => (
    <View style={styles.container}>
      {exercises?.map((exercise, index) => (
        <Link 
        href={{
          pathname: "/[muscle]/[exercise]",
          params: { 
            exercise: exercise.name,
            muscle: exercise.muscleGroup
          }
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
         {renderViewMode({exercise})}  
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
