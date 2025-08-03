import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { format } from 'date-fns';
import { mealAPI } from '../utils/api';

const getCurrentMealType = () => {
  const hour = new Date().getHours();
  if(hour >=5 && hour < 8) return 'Detox';
  if (hour >= 8 && hour < 10) return 'Breakfast';
  if (hour >= 10 && hour < 12) return 'Mid Meal';
  if (hour >= 12 && hour < 15) return 'Lunch';
  if (hour >= 15 && hour < 19) return 'Snack';
  return 'Dinner';
};

const HomeScreen = () => {
  const { user, authToken } = useAuth();
  const [meals, setMeals] = useState([]);
  const [currentMealType, setCurrentMealType] = useState(getCurrentMealType());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const getMeals = async () => {
   mealAPI.getMeals()
   .then((response) => {
    setMeals(response);
    console.log('Fetched meals:', response);
    setIsLoading(false);
   })
   .catch((error) => {
    console.error('Error fetching meals:', error);
    setIsLoading(false);
   })
    }
  

  const markMealAsDone = async (mealId) => {
    try {
      // Here you would typically make an API call to update the meal status
      // For now, we'll just update the local state
      setMeals(prevMeals => 
        prevMeals.map(meal => 
          meal._id === mealId ? { ...meal, isDone: true } : meal
        )
      );
      // Show success message or update UI
    } catch (error) {
      console.error('Error updating meal status:', error);
    }
  };

  useEffect(() => {
    getMeals();
    
    // Update current meal type every hour
    const interval = setInterval(() => {
      setCurrentMealType(getCurrentMealType());
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const filteredMeals = meals.filter(meal => 
    meal.mealType === currentMealType
  );
  
  console.log('Filtered meals:', filteredMeals);
  const mealTypeDisplay = {
    Detox: 'Detox',
    Breakfast: 'Breakfast',
    MidMeal: 'Mid Meal',
    Lunch: 'Lunch',
    Snack: 'Snack',
    Dinner: 'Dinner'
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back, {user?.username || 'User'}!</Text>
          <Text style={styles.subtitle}>{mealTypeDisplay[currentMealType] || 'Meal Time'}</Text>
        </View>
        
        {isLoading ? (
          <Text style={styles.loadingText}>Loading your meals...</Text>
        ) : filteredMeals.length > 0 ? (
          <View style={styles.mealsContainer}>
            {filteredMeals.map((meal) => (
              <View key={meal._id} style={styles.mealCard}>
                <Text style={styles.mealTitle}>{meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</Text>
                <View style={styles.mealDetails}>
                  <Text style={styles.mealItems}>{meal.items.join(', ')}</Text>
                  <Text style={styles.mealInfo}>Calories: {meal.calories} | Protein: {meal.protein}g</Text>
                  {meal.notes && <Text style={styles.mealNotes}>Notes: {meal.notes}</Text>}
                </View>
                {!meal.isDone && (
                  <TouchableOpacity 
                    style={styles.doneButton}
                    onPress={() => markMealAsDone(meal._id)}
                  >
                    <Text style={styles.doneButtonText}>Mark as Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noMealsContainer}>
            <Text style={styles.noMealsText}>No meals planned for {currentMealType} yet.</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add {currentMealType}</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Existing workout card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Workout</Text>
          <Text style={styles.cardText}>No workout planned for today</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 20,
    
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  mealsContainer: {
    marginBottom: 24,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  mealDetails: {
    marginBottom: 16,
  },
  mealItems: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  mealInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  mealNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noMealsContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 24,
  },
  noMealsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    width: '70%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#666',
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
