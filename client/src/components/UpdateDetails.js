import React from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'

const UpdateDetails = ({ formData, setEditing, handleInputChange, handleSubmit }) => {
    return (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Weighssst (kg)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.weight}
                    onChangeText={(value) => handleInputChange('weight', value)}
                    keyboardType="numeric"
                    placeholder="Enter weight in kg"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.height}
                    onChangeText={(value) => handleInputChange('height', value)}
                    keyboardType="numeric"
                    placeholder="Enter height in cm"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                    style={styles.input}
                    value={formData.age}
                    onChangeText={(value) => handleInputChange('age', value)}
                    keyboardType="numeric"
                    placeholder="Enter age"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.radioContainer}>
                    <TouchableOpacity 
                        style={[styles.radioButton, formData.gender === 'male' && styles.radioButtonSelected]}
                        onPress={() => handleInputChange('gender', 'male')}
                    >
                        <Text>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.radioButton, formData.gender === 'female' && styles.radioButtonSelected]}
                        onPress={() => handleInputChange('gender', 'female')}
                    >
                        <Text>Female</Text>
                    </TouchableOpacity>
                </View>

            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Goal</Text>
                <TextInput
                    style={styles.input}
                    value={formData.goal}
                    onChangeText={(value) => handleInputChange('goal', value)}
                    placeholder="Enter goal"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Activity Level</Text>
                <TextInput
                    style={styles.input}
                    value={formData.activityLevel}
                    onChangeText={(value) => handleInputChange('activityLevel', value)}
                    placeholder="Enter activity level"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>belly</Text>
                <TextInput
                    style={styles.input}
                    value={formData.belly}
                    onChangeText={(value) => handleInputChange('belly', value)}
                    placeholder="Enter belly"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>chest</Text>
                <TextInput
                    style={styles.input}
                    value={formData.chest}
                    onChangeText={(value) => handleInputChange('chest', value)}
                    placeholder="Enter chest"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>waist</Text>
                <TextInput
                    style={styles.input}
                    value={formData.waist}
                    onChangeText={(value) => handleInputChange('waist', value)}
                    placeholder="Enter waist"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>bicep</Text>
                <TextInput
                    style={styles.input}
                    value={formData.bicep}
                    onChangeText={(value) => handleInputChange('bicep', value)}
                    placeholder="Enter bicep"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>thigh</Text>
                <TextInput
                    style={styles.input}
                    value={formData.thigh}
                    onChangeText={(value) => handleInputChange('thigh', value)}
                    placeholder="Enter thigh"
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setEditing(false)}
                >
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </View>

    )
}

export default UpdateDetails

const styles = StyleSheet.create({
    radioContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    radioButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
    },
    radioButtonSelected: {
        backgroundColor: '#e3f2fd',
        borderColor: '#007AFF',
    },
    formContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
    },
    saveButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
})