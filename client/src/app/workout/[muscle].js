// app/workouts/[muscle].js
import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function WorkoutDetail() {
  const { muscle } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: muscle.charAt(0).toUpperCase() + muscle.slice(1) }} />
      <Text>Workout details for {muscle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});