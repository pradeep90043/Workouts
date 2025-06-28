const mongoose = require('mongoose');
const Workout = require('./models/Workout');
const path = require('path');
const fs = require('fs').promises;

// Default user ID to match our routes
const DEFAULT_USER_ID = 'demo-user';

// Get today's date at midnight
const today = new Date();
today.setHours(0, 0, 0, 0);

// Map of muscle group files to their display names
const MUSCLE_GROUPS = [
  { file: 'back.json', name: 'back' },
  { file: 'bicep.json', name: 'biceps' },
  { file: 'chest.json', name: 'chest' },
  { file: 'legs.json', name: 'legs' },
  { file: 'shoulders.json', name: 'shoulders' },
  { file: 'triceps.json', name: 'triceps' }
];

// Function to read and parse a JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Function to convert exercise data to our workout format
function createWorkoutData(muscleGroup, exercises) {
  return {
    userId: DEFAULT_USER_ID,
    date: today,
    exercises: exercises.map(exercise => {
      // Parse rest time (remove 's' and convert to number)
      const restTime = exercise.rest ? parseInt(exercise.rest) || 60 : 60;
      
      // Create sets array based on the number of sets
      const sets = [];
      const numSets = exercise.sets || 3;
      
      for (let i = 0; i < numSets; i++) {
        sets.push({
          setNumber: i + 1,
          reps: exercise.reps?.[i] || exercise.reps?.[0] || 10,
          weight: exercise.weight?.[i] || exercise.weight?.[0] || 10,
          rest: restTime,
          completed: false // Default to not completed
        });
      }
      
      return {
        name: exercise.name,
        muscleGroup: muscleGroup,
        stats: [{
          date: today,
          sets: sets,
          notes: `Added as part of initial import`,
          rating: 1, // Default rating (minimum allowed is 1)
          duration: 0 // Will be updated when completed
        }]
      };
    }),
    notes: `${muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)} workout`,
    completed: false // Default to not completed
  };
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workouts?directConnection=true';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Workout.deleteMany({});
    console.log('Cleared existing workout data');

    // Process each muscle group
    const dataDir = path.join(__dirname, '../client/assets/data');
    let totalExercises = 0;
    let totalWorkouts = 0;

    for (const { file, name: muscleGroup } of MUSCLE_GROUPS) {
      const filePath = path.join(dataDir, file);
      console.log(`\nProcessing ${muscleGroup} from ${file}`);
      
      try {
        // Read and parse the JSON file
        const exercises = await readJsonFile(filePath);
        if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
          console.log(`  No exercises found in ${file}`);
          continue;
        }

        console.log(`  Found ${exercises.length} exercises for ${muscleGroup}`);
        totalExercises += exercises.length;

        // Create workout data for this muscle group
        const workoutData = createWorkoutData(muscleGroup, exercises);
        
        // Save to database
        const workout = new Workout(workoutData);
        await workout.save();
        totalWorkouts++;
        
        console.log(`  Added ${muscleGroup} workout with ${exercises.length} exercises`);
      } catch (error) {
        console.error(`  Error processing ${file}:`, error.message);
      }
    }

    // Get summary of inserted data
    const summary = await Workout.aggregate([
      { $unwind: '$exercises' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            muscleGroup: '$exercises.muscleGroup',
            exercise: '$exercises.name'
          },
          totalSets: { $sum: { $size: '$exercises.stats.0.sets' } },
          totalVolume: {
            $sum: {
              $reduce: {
                input: '$exercises.stats.0.sets',
                initialValue: 0,
                in: { $add: ['$$value', { $multiply: ['$$this.reps', '$$this.weight'] }] }
              }
            }
          }
        }
      },
      { $sort: { '_id.date': -1, '_id.muscleGroup': 1, '_id.exercise': 1 } }
    ]);

    // Print summary
    console.log('\n=== Import Summary ===');
    console.log(`Total muscle groups: ${MUSCLE_GROUPS.length}`);
    console.log(`Total exercises: ${totalExercises}`);
    console.log(`Total workouts created: ${totalWorkouts}`);
    console.log('\nWorkout Details:');
    console.log('================');

    let currentDate = '';
    let currentMuscleGroup = '';
    
    summary.forEach(item => {
      const { date, muscleGroup, exercise } = item._id;
      
      if (date !== currentDate) {
        console.log(`\nDate: ${date}`);
        currentDate = date;
        currentMuscleGroup = '';
      }
      
      if (muscleGroup !== currentMuscleGroup) {
        console.log(`  ${muscleGroup}:`);
        currentMuscleGroup = muscleGroup;
      }
      
      console.log(`    ${exercise}: ${item.totalSets} sets`);
    });

    console.log('\nImport completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
