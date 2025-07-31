// app/(tabs)/home.js
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { useWorkouts } from '../../context/WorkoutContext';
import { useEffect } from 'react';

const MUSCLE_GROUPS_ICONS = [
  { name: "legs", icon: "🦵", order: 1 },
  { name: "biceps", icon: "💪", order: 2 },
  { name: "triceps", icon: "💪", order: 3 },
  { name: "chest", icon: "🫁", order: 4 },
  { name: "back", icon: "🧗", order: 5 },
  { name: "shoulders", icon: "🙆‍♂️", order: 6 },
  { name: "core", icon: "🪨", order: 7 },
  { name: "cardio", icon: "🏃", order: 8 },
];

export default function HomeScreen() {
  const { workouts, loading, error, refreshWorkouts } = useWorkouts();

  useEffect(() => {
    refreshWorkouts();
  }, []);
  
  const MUSCLE_GROUPS = workouts?.map((workout) => {
    return {
      name: MUSCLE_GROUPS_ICONS.find((icon) => 
        icon.name === workout?.name?.toLowerCase()
      )?.name || workout.name,
      icon: MUSCLE_GROUPS_ICONS.find((icon) => 
        icon.name === workout?.name?.toLowerCase()
      )?.icon,
      order: MUSCLE_GROUPS_ICONS.find((icon) => 
        icon.name === workout?.name?.toLowerCase()
      )?.order
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
        <TouchableOpacity onPress={refreshWorkouts} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <FlatList
        data={MUSCLE_GROUPS}
        contentContainerStyle={{ gap: 16, padding: 16 }}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Link href={{
            pathname: "/[muscle]",
            params: { muscle: item.name.toLowerCase() }
          }}  asChild>
            <TouchableOpacity style={styles.muscleItem}>
              <Text style={styles.muscleIcon}>{item.icon}</Text>
              <Text style={styles.muscleName}>{item.name}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  error: {
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  }
};