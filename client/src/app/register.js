// app/register.js
import { Stack } from 'expo-router';
import RegisterScreen from '../screens/auth/RegisterScreen';

export default function Register() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RegisterScreen />
    </>
  );
}