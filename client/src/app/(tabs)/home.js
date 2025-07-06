// app/(tabs)/home.js
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { useWorkouts } from '../../context/WorkoutContext';
import { useAuth } from '../../context/AuthContext';


export default function HomeScreen() {
const {user,loading,error} = useAuth();
const userDetail = user?.data;
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
     <Text style={styles.title}>Welcome Back, {userDetail?.username || 'User'}!</Text>
    
    </View>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
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