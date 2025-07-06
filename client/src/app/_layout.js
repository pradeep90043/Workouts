// src/app/_layout.js
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { AuthProvider } from '../context/AuthContext';
import { WorkoutProvider } from '../context/WorkoutContext';

function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add your fonts here if needed
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <WorkoutProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default RootLayout;