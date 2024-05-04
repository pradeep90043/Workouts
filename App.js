import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import exercises from "./assets/data/exercises.json"

export default function App() {
  const exercise = exercises[0]
  console.log(exercises[0])

  return (
    <View style={styles.container}>
      <Text>{exercise.name}</Text>
      <Text>Muscle: {exercise.muscle}</Text>

      <StatusBar style="auto" /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
