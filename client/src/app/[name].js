import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import MuscleGroup from "../components/MuscleGroup";
import { useWorkouts } from '@context/WorkoutContext';



export default function ExerciseDetailsScreen() {
  const params = useLocalSearchParams();
  const { name } = params;
  const { workouts, loading, error } = useWorkouts();

  // Get muscle data based on the day name (which matches muscle name)
 

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

 

 
console.log(workouts[0].muscleGroups)
  return (
    <ScrollView>
      <View style={styles.container}>
        <MuscleGroup
          muscle={name}
          exercises={workouts[0].muscleGroups.find((group) => group.name === name)?.exercises}
     
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
});
