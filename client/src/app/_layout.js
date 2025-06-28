import { Stack } from "expo-router";
import { WorkoutProvider } from '@context/WorkoutContext';

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Exercises" }} />
        <Stack.Screen 
          name="[name]" 
          options={({ route }) => ({
            title: route.params?.name || 'Exercise Details'
          })}
        />
        <Stack.Screen 
          name="exercise/[muscle]/[exercise]" 
          options={({ route }) => ({
            title: `${route.params?.muscle.replace(/%20/g, ' ') || ''} - ${route.params?.exercise.replace(/%20/g, ' ') || ''}`
          })}
        />
      </Stack>
    </WorkoutProvider>
  );
}
