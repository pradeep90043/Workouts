
// app/index.js
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
export default function Index() {
  console.log("index inside index");
  const { isAuthenticated, isLoading } = useAuth();
  console.log("isAuthenticated inside index", {isAuthenticated});
  function removeItem(key) {
        if (Platform.OS === 'web') {
          localStorage.removeItem(key);
          return;
        }
         SecureStore.deleteItemAsync(key);
      }
      const token =SecureStore.getItemAsync("auth_token");
      const user =SecureStore.getItemAsync("user_data");
      console.log("token", token);
      console.log("user", user);
  // removeItem("auth_token");
  // removeItem("user_data");
  console.log('Index rendering', {
    isAuthenticated,
    isLoading,
    time: new Date().toISOString()
  });
  debugger
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <Redirect href="/(tabs)/home" /> : <Redirect href="/login" />;
}