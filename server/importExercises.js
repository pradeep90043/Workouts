const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Workout model
const Workout = require('./models/Workout');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workouts?directConnection=true';

// Path to the data directory
const DATA_DIR = path.join(__dirname, '../client/assets/data');

// Map of filenames to muscle groups
const MUSCLE_GROUPS = {
    'bicep.json': 'biceps',
    'triceps.json': 'triceps',
    'shoulders.json': 'shoulders',
    'chest.json': 'chest',
    'back.json': 'back',
    'legs.json': 'legs'
};

async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log('Connected to MongoDB');
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return false;
    }
}

async function importExercises() {
    const connected = await connectToDatabase();
    if (!connected) {
        console.error('Failed to connect to database');
        process.exit(1);
    }

    try {
        // Clear existing data
        await Workout.deleteMany({});
        console.log('Cleared existing workout data');

        // Process each muscle group file
        for (const [filename, muscleGroup] of Object.entries(MUSCLE_GROUPS)) {
            const filePath = path.join(DATA_DIR, filename);
            
            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filename}`);
                continue;
            }

            console.log(`\nProcessing ${muscleGroup} exercises from ${filename}`);
            
            try {
                const exercises = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                
                for (const exercise of exercises) {
                    // Create stats array from reps and weights
                    const stats = [];
                    for (let i = 0; i < exercise.sets; i++) {
                        stats.push({
                            date: new Date(),
                            sets: 1,
                            reps: exercise.reps[i] || exercise.reps[exercise.reps.length - 1],
                            weight: exercise.weight[i] || exercise.weight[exercise.weight.length - 1],
                            rest: parseInt(exercise.rest) || 60,
                            notes: 'Imported from JSON'
                        });
                    }


                    // Create workout document
                    const workout = new Workout({
                        name: exercise.name,
                        muscleGroup: muscleGroup.toLowerCase(),
                        exercises: [{
                            name: exercise.name,
                            stats: stats
                        }],
                        userId: 'import-script'
                    });


                    await workout.save();
                    console.log(`  - Added: ${exercise.name}`);
                }
            } catch (error) {
                console.error(`Error processing ${filename}:`, error);
            }
        }

        console.log('\nImport completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during import:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

// Run the import
importExercises();
