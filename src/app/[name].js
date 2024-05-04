import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native";
import exercises from "../../assets/data/exercises.json";
import { useState } from "react";

export default function ExerciseDetailsScreen() {
  const params = useLocalSearchParams();

  const [isInstructioExpanded, setIsInstructionExpanded] = useState(false);

  const exercise = exercises.find((item) => (item.name = params.name));

  if (!exercise) {
    return <Text>Exercise not found</Text>;
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Stack.Screen options={{ title: exercise.name }} />
        <View style={styles.panel}>
          <Text style={styles.exerciseName}>{exercise.name} </Text>
          <Text style={styles.exerciseTitle}>
            {exercise.muscle} | {exercise.equipment}
          </Text>
        </View>
        <View style={styles.panel}>
          <Text
            style={styles.instructions}
            numberOfLines={isInstructioExpanded ? 0 : 3}
          >
            {exercise.instructions}{" "}
          </Text>
          <Text
            onPress={() => setIsInstructionExpanded(!isInstructioExpanded)}
            style={styles.seeMore}
          >
        {   isInstructioExpanded ? "See less": "See more"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
  },
  panel: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 600,
  },
  exerciseTitle: {
    color: "dimgray",
  },
  instructions: {
    fontSize: 16,
    lineHeight: 22,
  },
  seeMore: {
    alignSelf: "center",
    padding: 10,
    fontWeight: "600",
    color: "gray",
  },
});
