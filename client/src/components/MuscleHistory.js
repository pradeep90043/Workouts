import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { DataTable } from 'react-native-paper';
import { format } from 'date-fns';

const MuscleHistory = ({ exercise }) => {
  const columns = [
    { title: 'Date' },
    { ...exercise.stats?.[0]?.duration ? { title: 'Duration (min)' } : { title: 'Weight x Reps' } },
  ];

  console.log({ exercise }, "history")



  return (
    <View style={styles.container}>
      <ScrollView horizontal={true}>
        <DataTable style={styles.table}>
          <DataTable.Header>
            {columns.map((column, index) => (
              <DataTable.Title key={index} style={{ ...styles.headerCell, width: "100%" }}>
                {column.title}
              </DataTable.Title>
            ))}
          </DataTable.Header>

          {exercise?.stats?.map((stat, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell style={styles.cell}>
                {format(new Date(stat.date), 'dd MMM')}
              </DataTable.Cell>
              {stat?.duration ? <DataTable.Cell style={styles.cell}>{stat.duration}</DataTable.Cell> : <DataTable.Cell style={styles.cell}>  {stat.sets?.map(set => `(${set.weight} x ${set.reps})`).join(', ')}</DataTable.Cell>}
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
    width: "50%",
    minWidth: "50%",
    maxWidth: "100%",
  },
  cell: {
    width: "50%",
    minWidth: "50%",
    maxWidth: "100%",
  },
});

export default MuscleHistory;
