import { Link } from "expo-router";
import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useWorkouts } from '@context/WorkoutContext';
import { TouchableOpacity } from "react-native";

const MUSCLE_GROUPS_ICONS = [
  { name: "legs", icon: "🦵" ,order:1},
  { name: "biceps", icon: "💪" ,order:2},
  { name: "triceps", icon: "💪" ,order:3},
  { name: "chest", icon: "🫁" ,order:4},
  { name: "back", icon: "🧗" ,order:5},
  { name: "shoulders", icon: "🙆‍♂️" ,order:6},
  { name: "core", icon: "🪨" ,order:7},
  { name: "cardio", icon: "🏃" ,order:8},
];

export default function App() {
  const { workouts, loading, error, refreshWorkouts } = useWorkouts();
  const MUSCLE_GROUPS = workouts?.[0]?.muscleGroups?.map((workout) => {
    return {
      name: MUSCLE_GROUPS_ICONS.find((icon) => icon.name === workout?.name?.toLowerCase())?.name || workout.name,
      icon:MUSCLE_GROUPS_ICONS.find((icon) => icon.name === workout?.name?.toLowerCase())?.icon,
      order:MUSCLE_GROUPS_ICONS.find((icon) => icon.name === workout?.name?.toLowerCase())?.order
    }
  }).sort((a, b) => a.order - b.order);
  
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
        <Pressable onPress={refreshWorkouts} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={MUSCLE_GROUPS}
        contentContainerStyle={{ gap: 16, padding: 16 }}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Link href={`/${item?.name?.toLowerCase()}`} asChild>
            <TouchableOpacity style={styles.muscleItem}>
              <Text style={styles.muscleIcon}>{item.icon}</Text>
              <Text style={styles.muscleName}>{item.name}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  muscleItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  muscleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  muscleName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dashboardLink: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  dashboardButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dashboardText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
