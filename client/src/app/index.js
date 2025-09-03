
// app/index.js
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  function removeItem(key) {
        if (Platform.OS === 'web') {
          localStorage.removeItem(key);
          return;
        }
         SecureStore.deleteItemAsync(key);
      }
      const token =SecureStore.getItemAsync("auth_token");
      const user =SecureStore.getItemAsync("user_data");
  // removeItem("auth_token");
  // removeItem("user_data");
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <Redirect href="/(tabs)/home" /> : <Redirect href="/login" />;
}