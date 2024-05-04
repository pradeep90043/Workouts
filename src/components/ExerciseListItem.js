
import { FlatList, StyleSheet, Text, View } from "react-native";
const ExerciseListItem = ({ item }) => {
    return (
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text> {item.muscle}</Text>
      </View>
    );
  };
  export default ExerciseListItem

  const styles = StyleSheet.create({
    exerciseContainer: {
      backgroundColor: "#fff",
      borderRadius:10,
      padding:10
    },
    exerciseName:{
        fontSize:18,
        fontWeight:600
    }

  });