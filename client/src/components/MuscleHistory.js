import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { DataTable } from 'react-native-paper';
import { format } from 'date-fns';

const MuscleHistory = ({ exercises }) => {
  const columns = [
    { title: 'Date', minWidth: 70 },
    { title: 'Sets', minWidth: 20 },
    { title: 'Reps', minWidth: 20 },
    { title: 'Weight (kg)', minWidth: 90 },
    { title: 'Rest (s)', minWidth: 70 },
  ];

 console.log({exercises},"history")



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

          {exercises?.[0]?.stats?.map((workout, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell style={styles.cell}>
                {format(new Date(workout.date), 'dd MMM')}
              </DataTable.Cell>
              <DataTable.Cell style={styles.setCell}>{workout.sets.length}</DataTable.Cell>
              <DataTable.Cell style={styles.cell}>{workout.sets?.map((set) => set.reps).join(', ')}</DataTable.Cell>
              <DataTable.Cell style={styles.weightCell}>{workout.sets?.map((set) => set.weight).join(', ')}</DataTable.Cell>
              <DataTable.Cell style={styles.restCell}>{workout.sets?.map((set) => set.rest).join(', ')}</DataTable.Cell>
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
    width: "100%",
    minWidth: 70,
    maxWidth: 70,
  },
  setCell: {
    width: "100%",
    minWidth: 20,
    maxWidth: 100,
  },
  restCell: {
    width: "100%",
    minWidth: 20,
    maxWidth: 100,
  },
  weightCell: {
    width: "100%",
    minWidth: 90,
    maxWidth: 90,
  },
});

export default MuscleHistory;
