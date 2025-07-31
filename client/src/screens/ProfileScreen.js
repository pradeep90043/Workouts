import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserDetails } from '../context/UserDetailsContext';
import UpdateDetails from '../components/UpdateDetails';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { userDetails, loading, error, fetchUserDetails, updateUserDetails } = useUserDetails();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    chest: "",
    waist: "",
    bicep: "",
    thigh: "",
    belly: "",
    age: "",
    gender: "",
    goal: "",
    activityLevel: "",

  });

  useEffect(() => {
    if (userDetails) {
      setFormData({
        weight: userDetails.weight?.toString() || '',
        height: userDetails.height?.toString() || '',
        chest: userDetails.chest?.toString() || '',
        waist: userDetails.waist?.toString() || '',
        bicep: userDetails.bicep?.toString() || '',
        thigh: userDetails.thigh?.toString() || '',
        age: userDetails.age?.toString() || '',
        gender: userDetails.gender?.toString() || '',
        goal: userDetails.goal?.toString() || '',
        belly: userDetails.belly?.toString() || '',
        activityLevel: userDetails.activityLevel?.toString() || '',
      });
    }
  }, [userDetails]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateUserDetails({
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        chest: parseFloat(formData.chest),
        waist: parseFloat(formData.waist),
        bicep: parseFloat(formData.bicep),
        thigh: parseFloat(formData.thigh),
        age: parseFloat(formData.age),
        gender: formData.gender,
        goal: formData.goal,
        belly: parseFloat(formData.belly),
        activityLevel: formData.activityLevel,
      });
      setEditing(false);
      Alert.alert('Success', 'Your details have been updated successfully!');
    } catch (error) {
      console.error('Error updating user details:', error);
      Alert.alert('Error', 'Failed to update details. Please try again.');
    }
  };





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
                  [{ text: 'OK', onPress: () => router.replace('/login') }]
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={90} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={24} color="#666" />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={24} color="#666" />
            <Text style={styles.infoText}>
              Member since {new Date(user?.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>User Details</Text>
            {
              !editing && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditing(true)}
                >
                  <Ionicons name="pencil" size={20} color="#fff" />
                  <Text style={styles.editButtonText}>Edit Details</Text>
                </TouchableOpacity>
              )
            }
          </View>

          {editing ? <UpdateDetails formData={formData} setEditing={setEditing} handleInputChange={handleInputChange} handleSubmit={handleSubmit} /> : loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : userDetails ? (
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{userDetails.weight || 'N/A'} kg</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Height</Text>
                <Text style={styles.detailValue}>{userDetails.height || 'N/A'} cm</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Age</Text>
                <Text style={styles.detailValue}>{userDetails.age || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>{userDetails.gender || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Goal</Text>
                <Text style={styles.detailValue}>{userDetails.goal || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Activity Level</Text>
                <Text style={styles.detailValue}>{userDetails.activityLevel || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Belly</Text>
                <Text style={styles.detailValue}>{userDetails.belly || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bicep</Text>
                <Text style={styles.detailValue}>{userDetails.bicep || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Thigh</Text>
                <Text style={styles.detailValue}>{userDetails.thigh || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Chest</Text>
                <Text style={styles.detailValue}>{userDetails.chest || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Waist</Text>
                <Text style={styles.detailValue}>{userDetails.waist || 'N/A'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noDetailsContainer}>
              <Text style={styles.noDetailsText}>No details available</Text>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={() => setEditing(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.buttonText}>Add Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#8e8e93',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 15,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#e9ecef',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#212529',
  },
  email: {
    fontSize: 16,
    color: '#6c757d',
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#495057',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  noDetailsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noDetailsText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    margin: 16,
    borderRadius: 8,
  },
  retryButton: {
    backgroundColor: '#6c757d',
  },
  loader: {
    marginVertical: 24,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 16,
  },
});

export default ProfileScreen;
