import { StyleSheet, View, Text } from "react-native";


const arrayJoin = (array) => array.join(", ");
export const renderViewMode = ({exercise}) => {
    const stats = exercise?.stats?.[0];
    const sets = stats?.sets;
    return(
    <View style={styles.container}>
        <View style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{exercise?.name}</Text>
           {sets?.length>0 && (<Text style={styles.label}>Reps: {arrayJoin(sets?.map((set) => set.reps)) || 'N/A'}</Text>)}
           {sets?.length>0 && (<Text style={styles.label}>Weight: {arrayJoin(sets?.map((set) => set.weight)) || 'N/A'}</Text>)}
           {sets?.length>0 && (<Text style={styles.label}>Sets: {sets?.length || 'N/A'}</Text>)}
           {stats?.rest>0 && (<Text style={styles.label}>Rest: {stats.rest || 'N/A'}</Text>)}
           { stats?.duration>0 && (<Text style={styles.label}>Duration (min): {stats.duration || 'N/A'}</Text>)}
        </View>
    </View>
)};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    exerciseBlock: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: "#f8f8f8",
        borderRadius: 6,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginRight: 8,
        minWidth: 120,
    },
});