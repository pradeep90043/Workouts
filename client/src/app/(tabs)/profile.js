// app/(tabs)/profile.js
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
const {user,loading,error} = useAuth();
console.log("user", user);
const userDetail = user?.data;
console.log("userDetail", userDetail);
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.subtitle}>Email: {userDetail?.email}</Text>
          <Text style={styles.subtitle}>ID: {userDetail?.id}</Text>
          <Text style={styles.subtitle}>Username: {userDetail?.username}</Text>
          <Text style={styles.subtitle}>Weight: {userDetail?.weight||""}</Text>
          <Text style={styles.subtitle}>Height: {userDetail?.height||""}</Text>
          <Text style={styles.subtitle}>Gender: {userDetail?.gender||""}</Text>
          <Text style={styles.subtitle}>Age: {userDetail?.age||""}</Text>    
    </View>
    </SafeAreaView>
  );  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
});