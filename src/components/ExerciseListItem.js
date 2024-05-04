import { Link } from "expo-router";
import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
const ExerciseListItem = ({ item }) => {




  return (
    <Link href={`./${item.name}`} asChild >
    <Pressable style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{item.name} </Text>
      <Text> {item.muscle} | {item.equipment}</Text>
    </Pressable>
    </Link>
  );
};
export default ExerciseListItem;

const styles = StyleSheet.create({
  exerciseContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 600,
  },
});
