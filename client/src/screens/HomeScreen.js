import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { ENDPOINTS } from '../config/api';
import { format } from 'date-fns';
import { mealAPI } from '../utils/api';
import { useUserDetails } from '../context/UserDetailsContext';
import { useWorkouts } from '../context/WorkoutContext';

const getCurrentMealType = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'Detox';
  if (hour >= 8 && hour < 10) return 'Breakfast';
  if (hour >= 10 && hour < 12) return 'Mid Meal';
  if (hour >= 12 && hour < 15) return 'Lunch';
  if (hour >= 15 && hour < 19) return 'Snack';
  return 'Dinner';
};


const HomeScreen = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [currentMealType, setCurrentMealType] = useState(getCurrentMealType());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3m'); // 1m, 3m, 6m, 1y
  const [viewAll, setViewAll] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  const { userDetails, } = useUserDetails();
  const { workouts, refreshWorkouts } = useWorkouts();
  console.log({ userDetails })
  const getMeasurements = (type) => userDetails?.map((userDetail) => userDetail?.[type]) || []
  const workoutsWithVolume = workouts?.map((workout) => {
    return {
      ...workout,
      exercises: workout?.exercises?.map((exercise, index) => {
        return {
          ...exercise,
          volume: exercise?.stats?.reduce((acc, stat) => {
            return acc + stat?.sets?.reduce((acc, set) => {
              return acc + set?.weight * set?.reps;
            }, 0);
          }, 0),
          baseVolume: exercise?.stats?.[0]?.sets?.reduce((acc, set) => {
            return acc + set?.weight * set?.reps;
          }, 0)
        }
      })
    }
  })
  useEffect(() => {
    refreshWorkouts();
  }, []);



  const getVolumeByMuscleGroup = (muscleGroup) => {
    const exercise = workoutsWithVolume?.find((workout) => workout?.exercises?.find((exercise) => exercise?.muscleGroup === muscleGroup))
    console.log({ exercise })
    const baseVolume = exercise?.exercises?.find((exercise) => exercise?.muscleGroup === muscleGroup)?.baseVolume
    const volume = exercise?.exercises?.find((exercise) => exercise?.muscleGroup === muscleGroup)?.volume
    const progressData = volume / baseVolume * 100
    return progressData
  }
  const getVolumeByExercise = (exerciseName, muscleGroup) => {
    const exercise = workoutsWithVolume?.find((workout) => workout?.exercises?.find((exercise) => exercise?.muscleGroup === muscleGroup))
    console.log({ exercise })
    const baseVolume = exercise?.exercises?.find((exercise) => exercise?.name === exerciseName)?.baseVolume
    const volume = exercise?.exercises?.find((exercise) => exercise?.name === exerciseName)?.volume
    const progressData = volume / baseVolume * 100
    return progressData

  }
  console.log({ workoutsWithVolume })
  console.log("Volume chest", getVolumeByMuscleGroup('chest'))
  console.log("Volume Concentration Curl", getVolumeByExercise('Concentration Curl', 'biceps'))
  // Body measurements data with validation
  const getMeasurementsData = () => {
    // Ensure we have valid numeric data for each measurement
    const measurements = ['chest', 'waist', 'belly', 'thigh', 'bicep', 'weight'];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    // For each measurement, get the data and ensure it's an array of numbers
    const datasets = measurements.map((measurement, index) => {
      // Get the measurement data and ensure it's an array
      let data = getMeasurements(measurement);

      // If it's not an array, use an empty array
      if (!Array.isArray(data)) {
        data = [];
      }

      // Ensure we have exactly 6 data points (one for each month)
      // If we have less, pad with zeros
      while (data.length < 6) {
        data.push(0);
      }

      // Ensure all values are numbers
      data = data.map(val => {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      });

      // Different colors for each dataset
      const colors = [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 100, 100, 1)',
        'rgba(155, 55, 86, 1)',
        'rgba(255, 99, 132, 1)'
      ];

      const measurementLabels = ['Chest (cm)', 'Waist (cm)', 'Belly (cm)', 'Thigh (cm)', 'Bicep (cm)', 'Weight (kg)'];

      return {
        data,
        color: (opacity = 1) => {
          const color = colors[index % colors.length];
          return color.replace('1)', `${opacity})`);
        },
        strokeWidth: 2,
        label: measurementLabels[index] || measurement
      };
    });

    return {
      labels,
      datasets,
      legend: measurements.map((m, i) => {
        const labels = ['Chest (cm)', 'Waist (cm)', 'Belly (cm)', 'Thigh (cm)', 'Bicep (cm)', 'Weight (kg)'];
        return labels[i] || m;
      })
    };
  };

  const bodyMeasurementsData = getMeasurementsData();

  const muscleLabels = () => {
    let labels = []
    if (selectedMuscle === 'All') {
      labels = workoutsWithVolume?.map((workout) => workout?.muscleGroup)
    } else {
      const muscle = workoutsWithVolume?.find((workout) => workout?.muscleGroup === selectedMuscle)
      labels = muscle?.exercises?.map((exercise) => exercise?.name)
    }
    return labels
  }

  const getMuscleProgressData = () => {
    const data = muscleLabels()?.map((muscle) => {
      return getVolumeByMuscleGroup(muscle?.toLowerCase())
    })
    return data
  }

  const getExerciseProgressData = () => {
    const data = muscleLabels()?.map((muscle) => {
      return getVolumeByExercise(muscle?.toLowerCase())
    })
    return data
  }




  // // Exercise progress data with validation
  // const exerciseProgressData = {
  //   labels: muscleLabels(),
  //   datasets: [{
  //     data:  selectedMuscle === 'All' ? getMuscleProgressData() : getExerciseProgressData(),
  //     colors: [
  //       (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
  //       (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
  //       (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
  //       (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
  //       (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
  //       (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
  //     ]
  //   }]
  // };

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


  const getMeals = async () => {
    mealAPI.getMeals()
      .then((response) => {
        setMeals(response);
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

  const filteredMeals = meals.find(meal =>
    meal.mealType === currentMealType
  );

  const mealTypeDisplay = {
    Detox: 'Detox',
    Breakfast: 'Breakfast',
    MidMeal: 'Mid Meal',
    Lunch: 'Lunch',
    Snack: 'Snack',
    Dinner: 'Dinner'
  };

  const screenWidth = Dimensions.get('window').width;



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back, {user?.username || 'User'}!</Text>
          <Text style={styles.subtitle}>{mealTypeDisplay[currentMealType] || 'Meal Time'}</Text>
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading your meals...</Text>
        ) : filteredMeals ? (
          <View style={styles.mealsContainer}>
            <View style={styles.mealCard}>
              <Text style={styles.mealTitle}>{filteredMeals.mealType.charAt(0).toUpperCase() + filteredMeals.mealType.slice(1)}</Text>
              <View style={styles.mealDetails}>
                <Text style={styles.mealItems}>{filteredMeals.items.join(', ')}</Text>
                <Text style={styles.mealInfo}>Calories: {filteredMeals.calories} | Protein: {filteredMeals.protein}g</Text>
                {filteredMeals.notes && <Text style={styles.mealNotes}>Notes: {filteredMeals.notes}</Text>}
              </View>
              {!filteredMeals.isDone && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => markMealAsDone(filteredMeals._id)}
                >
                  <Text style={styles.doneButtonText}>Mark as Done</Text>
                </TouchableOpacity>
              )}
              <View style={styles.mealCardFooter}>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => setViewAll(!viewAll)}>
                  <Text style={styles.viewAllText}>{viewAll ? 'Hide' : 'View All'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {viewAll && <View style={styles.allMeal}>
              {meals.map((meal) => (
                <View key={meal._id} style={styles.mealtab}>
                  <Text style={styles.mealTabTitle}>{meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</Text>
                  <Text style={styles.mealTabItems}>{meal.items.join(', ')}</Text>

                </View>
              ))}
            </View>}
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
            <View style={styles.filters}>
              <Text style={styles.filterText}>Filter by muscle group</Text>
              <View style={styles.filterButtons}>
                {[...muscleLabels(), 'All']?.map((muscle, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterButton,
                      selectedMuscle === muscle && styles.activeFilterButton
                    ]}
                    onPress={() => setSelectedMuscle(muscle)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedMuscle === muscle && styles.activeFilterButtonText
                    ]}>{muscle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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

  },
  scrollView: {
    flex: 1,
  },
  header: {
    margin: 20,

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
    margin: 20,
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
  allMeal: {
    display: 'flex',
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealtab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: "50%",

  },
  mealTabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  mealCardFooterText: {
    fontSize: 14,
    color: '#666',
  },
  mealTabItems: {
    fontSize: 14,
    color: '#666',
  },
  viewAllButton: {
    backgroundColor: 'gray',
    padding: 8,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;
