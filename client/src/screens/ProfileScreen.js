import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  console.log("profile screen inside profile screen");
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (result.success) {
                Alert.alert(
                  'Logged Out',
                  'You have been successfully logged out.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', result.message || 'Failed to log out. Please try again.');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'An unexpected error occurred during logout.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={24} color="#666" />
          <Text style={styles.infoText}>Member since {new Date(user?.createdAt).toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="stats-chart" size={24} color="#666" />
          <Text style={styles.infoText}>Workouts completed: 0</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ProfileScreen;
