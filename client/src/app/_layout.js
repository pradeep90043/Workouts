import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}
