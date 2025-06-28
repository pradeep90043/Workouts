import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { DataTable } from 'react-native-paper';
import { format } from 'date-fns';

const MuscleHistory = ({ exercises, history }) => {
  const columns = [
    { title: 'Date', width: 70 },
    { title: 'Sets', width: 20 },
    { title: 'Reps', width: 20 },
    { title: 'Weight (kg)', width: 90 },
    { title: 'Rest (s)', width: 70 },
  ];

  // Generate dummy history data based on current exercises
  const generateHistory = (exercises) => {
    const dates = ['2025-06-27', '2025-06-26', '2025-06-25', '2025-06-24', '2025-06-23'];
    const historyData = [];

    dates.forEach((date, dateIndex) => {
      exercises.forEach((exercise, exerciseIndex) => {
        // Calculate variations based on date and exercise position
        const variation = dateIndex * 5 + exerciseIndex * 3;

        historyData.push({
          date,
          sets: exercise.sets - Math.floor(variation / 10),
          reps: [...exercise.reps].map((rep, repIndex) => {
            // Vary reps slightly for each set
            return rep - variation + repIndex * 2;
          }),
          weight: [...exercise.weight].map((weight, weightIndex) => {
            // Vary weight slightly for each set
            return weight - variation + weightIndex * 3;
          }),
          rest: exercise.rest - variation * 2
        });
      });
    });

    return historyData;
  };

  const historyData = generateHistory(exercises);

  return (
    <View style={styles.container}>
      <ScrollView horizontal={true}>
        <DataTable style={styles.table}>
          <DataTable.Header>
            {columns.map((column, index) => (
              <DataTable.Title key={index} style={{ ...styles.headerCell, width: column.width }}>
                {column.title}
              </DataTable.Title>
            ))}
          </DataTable.Header>

          {historyData.map((workout, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell style={styles.cell}>
                {format(new Date(workout.date), 'dd MMM')}
              </DataTable.Cell>
              <DataTable.Cell style={styles.setCell}>{workout.sets}</DataTable.Cell>
              <DataTable.Cell style={styles.cell}>{workout.reps.join(', ')}</DataTable.Cell>
              <DataTable.Cell style={styles.weightCell}>{workout.weight.join(', ')}</DataTable.Cell>
              <DataTable.Cell style={styles.restCell}>{workout.rest}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 16,
    padding: 8,
  },
  table: {
    width: '100%',
  },
  headerCell: {
    backgroundColor: '#f5f5f5',
  },
  cell: {
    width: 70,
    minWidth: 70,
    maxWidth: 70,
  },
  setCell: {
    width: 20,
    minWidth: 20,
    maxWidth: 20,
  },
  restCell: {
    width: 20,
    minWidth: 20,
    maxWidth: 20,
  },
  weightCell: {
    width: 90,
    minWidth: 90,
    maxWidth: 90,
  },
});

export default MuscleHistory;
