// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ 
        title: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }} />
      <Tabs.Screen name="workout" options={{  // Changed from "workouts" to "workout"
        title: 'Workouts',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="barbell" size={size} color={color} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{ 
        title: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }} />
    </Tabs>
  );
}