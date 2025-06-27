import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ExerciseListItem = ({ item }) => {
  return (
    <Link href={`./${item.name}`} asChild>
      <Pressable style={styles.exerciseContainer}>
        <Text style={styles.exerciseDay}>{item.name}</Text>
        <Text style={styles.exerciseInfo}>
          {item.muscle} | {item.equipment}
        </Text>
        <Text style={styles.reps}>{item.reps} reps</Text>
      </Pressable>
    </Link>
  );
};

export default ExerciseListItem;

const styles = StyleSheet.create({
  exerciseContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    elevation: 2,
  },
  exerciseDay: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  exerciseInfo: {
    color: "#666",
    marginBottom: 5,
  },
  reps: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
