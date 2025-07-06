import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useWorkouts } from '../context/WorkoutContext';

const WorkoutsScreen = () => {
  const { workouts } = useWorkouts();

  const renderWorkoutItem = ({ item }) => (
    <View style={styles.workoutItem}>
      <Text style={styles.workoutName}>{item.name}</Text>
      <Text style={styles.workoutDetails}>{item.muscleGroup} • {item.sets} sets</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Workouts</Text>
      
      {workouts && workouts.length > 0 ? (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workouts found</Text>
          <Text style={styles.emptySubtext}>Start by adding a new workout</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  workoutItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default WorkoutsScreen;
