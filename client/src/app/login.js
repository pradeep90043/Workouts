// app/login.js
import { Stack } from 'expo-router';
import LoginScreen from '../screens/auth/LoginScreen';

export default function Login() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoginScreen />
    </>
  );
}