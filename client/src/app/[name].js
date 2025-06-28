import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Link } from "expo-router";
import MuscleGroup from "../components/MuscleGroup";
import legs from "@assets/data/legs.json";
import bicep from "@assets/data/bicep.json";
import triceps from "@assets/data/triceps.json";
import chest from "@assets/data/chest.json";
import back from "@assets/data/back.json";
import shoulders from "@assets/data/shoulders.json";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

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

  // Get muscle data based on the day name (which matches muscle name)
  const muscleData = MUSCLE_DATA[name.toLowerCase()];

  if (!muscleData) {
    return <Text>Muscle not found</Text>;
  }

  const [exerciseData, setExerciseData] = useState(muscleData);

  return (
    <ScrollView>
      <View style={styles.container}>
        <MuscleGroup
          muscle={name}
          exercises={exerciseData}
          setExerciseData={setExerciseData}
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
