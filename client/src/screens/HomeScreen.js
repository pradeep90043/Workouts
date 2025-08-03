import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { BarChart, LineChart } from 'react-native-chart-kit';
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

// Mock data for exercise progress
const exerciseProgressData = {
  labels: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
  datasets: [{
    data: [65, 59, 80, 81, 56, 55], // Progress percentages
    colors: [
      (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
      (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
      (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
      (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
      (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
      (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
    ]
  }]
};

// Mock data for body measurements
const bodyMeasurementsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [75, 72, 70, 68, 66, 65],
      color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
      strokeWidth: 2
    },
    {
      data: [95, 92, 90, 88, 86, 84],
      color: (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
      strokeWidth: 2
    },
    {
      data: [110, 105, 100, 98, 95, 92],
      color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
      strokeWidth: 2
    }
  ],
  legend: ['Chest (in)', 'Waist (in)', 'Hips (in)']
};

const screenWidth = Dimensions.get('window').width - 40;

const HomeScreen = () => {
  const { user, authToken } = useAuth();
  const [meals, setMeals] = useState([]);
  const [currentMealType, setCurrentMealType] = useState(getCurrentMealType());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3m'); // 1m, 3m, 6m, 1y

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
        
        {/* Exercise Progress Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exercise Progress</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={exerciseProgressData}
              width={screenWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForLabels: {
                  fontSize: 10,
                },
                barPercentage: 0.6,
                useShadowColorFromDataset: false,
                formatYLabel: (value) => `${Math.round(value)}%`,
              }}
              style={styles.chart}
              verticalLabelRotation={0}
              fromZero
              showBarTops={false}
              withInnerLines={false}
              withOuterLines={true}
              showValuesOnTopOfBars={true}
              withCustomBarColorFromData={true}
              flatColor={true}
            />
          </View>
          <Text style={styles.chartNote}>Weekly progress by muscle group</Text>
        </View>

        {/* Body Measurements Chart */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Body Measurements</Text>
            <View style={styles.timeframeSelector}>
              {['1m', '3m', '6m', '1y'].map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === timeframe && styles.activeTimeframe
                  ]}
                  onPress={() => setSelectedTimeframe(timeframe)}
                >
                  <Text style={[
                    styles.timeframeText,
                    selectedTimeframe === timeframe && styles.activeTimeframeText
                  ]}>
                    {timeframe}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={bodyMeasurementsData}
              width={screenWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=" in"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#fff'
                },
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={true}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
            />
          </View>
          <View style={styles.legendContainer}>
            {bodyMeasurementsData.legend.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendColor, 
                    { backgroundColor: bodyMeasurementsData.datasets[index].color(1) }
                  ]} 
                />
                <Text style={styles.legendText}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartNote}>Track your body measurements over time</Text>
        </View>

        {/* Today's Workout Card */}
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
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  chartNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 13,
  },
  activeTimeframe: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeframeText: {
    fontSize: 12,
    color: '#666',
  },
  activeTimeframeText: {
    color: '#333',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
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
