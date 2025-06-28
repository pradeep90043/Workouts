


export const renderViewMode = ({exercise}) => (
    <View style={styles.container}>
        <View style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.label}>Reps: {exercise.stats[0].sets?.map((set) => set.reps).join(", ") || 'N/A'}</Text>
            <Text style={styles.label}>Weight: {exercise.stats[0].sets?.map((set) => set.weight).join(", ") || 'N/A'}</Text>
            <Text style={styles.label}>Sets: {exercise.stats[0].sets?.length}</Text>
            <Text style={styles.label}>Rest: {exercise.stats[0].sets?.map((set) => set.rest).join(", ") || 'N/A'}</Text>

        </View>
    </View>
);

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