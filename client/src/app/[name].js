import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import MuscleGroup from "../components/MuscleGroup";
import legs from "@assets/data/legs.json";
import bicep from "@assets/data/bicep.json";
import triceps from "@assets/data/triceps.json";
import chest from "@assets/data/chest.json";
import back from "@assets/data/back.json";
import shoulders from "@assets/data/shoulders.json";
import { useEffect, useState } from "react";
import { useWorkouts } from '@context/WorkoutContext';

export const MUSCLE_DATA = {
  'legs': legs,
  'bicep': bicep,
  'triceps': triceps,
  'chest': chest,
  'back': back,
  'shoulders': shoulders
};

export default function ExerciseDetailsScreen() {
  const params = useLocalSearchParams();
  const { name } = params;
  const { workouts, loading, error } = useWorkouts();

  // Get muscle data based on the day name (which matches muscle name)
  const muscleData = MUSCLE_DATA[name.toLowerCase()];

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

 

  if (!muscleData) {
    return <Text>Muscle not found</Text>;
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
