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
        name="exercise/[exercise]" 
        options={({ route }) => ({
          title: 'Exercise Details'
        })}
      />
    </Stack>
  );
}
