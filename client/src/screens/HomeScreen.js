import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  console.log("home screen inside home screen");
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back, {user?.username || 'User'}!</Text>
      <Text style={styles.subtitle}>Track your workouts and see your progress</Text>
      
      {/* Add workout summary or quick actions here */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Workout</Text>
        <Text style={styles.cardText}>No workout planned for today</Text>
      </View>
    </View>
    </SafeAreaView>
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
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
