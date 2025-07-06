import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator,FlatList, TouchableOpacity } from "react-native";
import { useWorkouts } from "../context/WorkoutContext";
import MuscleGroup from "../components/MuscleGroup";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { getExerciseImage } from "../utils/exerciseImages";
import { renderViewMode } from "../components/ViewDetails";
import { Image } from "react-native";

export default function ExerciseDetailsScreen() {
  const { muscle } = useLocalSearchParams();

  const { workouts, loading, error } = useWorkouts();

  // Get muscle data based on the day name (which matches muscle name)
 const exerciseData = workouts.find((group) => group.name === muscle)?.exercises;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.error}>Error loading workouts: {error}</Text>
      </View>
    );
  }

 

 
  return (
    <>
    <Stack.Screen
      options={{
        title: muscle.charAt(0).toUpperCase() + muscle.slice(1), // Capitalize first letter
        headerBackTitle: 'Back',
        headerShown: true,
      }}
    />
      <ScrollView>
         <View style={styles.container}>
             {exerciseData?.map((exercise, index) => (
               <Link 
               href={{
                 pathname: "/exercise/[muscle]/[exercise]",
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
      </ScrollView>
  </>

  );
}

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

