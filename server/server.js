const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Date helper functions
const startOfDay = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const endOfDay = (date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
};

const app = express();


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workouts')
.then(() => {
    console.log('Connected to MongoDB');
    // Create indexes for better performance
    Workout.createIndexes();
})
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Serve static files from client build (for production)
app.use(express.static(path.join(__dirname, '../client')));

// Models
const Workout = require('./models/Workout');

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Workout endpoints
app.get('/api/workouts/:muscle', async (req, res) => {
    try {
        const workouts = await Workout.find({ muscleGroup: req.params.muscle });
        res.json(workouts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// Add exercise stats
app.post('/api/workouts/:muscle/exercises/:exercise/stats', async (req, res) => {
    try {
        const { sets, reps, weight, rest, notes } = req.body;
        const date = new Date();
        const muscle = req.params.muscle.toLowerCase();
        const exercise = req.params.exercise.toLowerCase();

        // Find or create workout for today
        let workout = await Workout.findOne({ 
            muscleGroup: muscle, 
            date: { $gte: startOfDay(date), $lt: endOfDay(date) }
        });

        if (!workout) {
            workout = new Workout({
                name: `${exercise} Workout`,
                muscleGroup: muscle,
                exercises: [{
                    name: exercise,
                    stats: []
                }]
            });
        }

        // Find or create exercise stats
        const exerciseIndex = workout.exercises.findIndex(ex => ex.name.toLowerCase() === exercise);
        if (exerciseIndex === -1) {
            workout.exercises.push({
                name: exercise,
                stats: []
            });
            exerciseIndex = workout.exercises.length - 1;
        }

        // Add new stats
        workout.exercises[exerciseIndex].stats.push({
            date,
            sets,
            reps,
            weight,
            rest,
            notes
        });

        const savedWorkout = await workout.save();
        res.status(201).json(savedWorkout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add exercise stats' });
    }
});

// Get exercise stats for a specific day
app.get('/api/workouts/:muscle/exercises/:exercise/stats/:date', async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const muscle = req.params.muscle.toLowerCase();
        const exercise = req.params.exercise.toLowerCase();

        const workout = await Workout.findOne({ 
            muscleGroup: muscle, 
            date: { $gte: startOfDay(date), $lt: endOfDay(date) }
        });

        if (!workout) {
            return res.status(404).json({ error: 'No workout found for this date' });
        }

        const exerciseStats = workout.exercises.find(ex => ex.name.toLowerCase() === exercise);
        if (!exerciseStats) {
            return res.status(404).json({ error: 'No stats found for this exercise' });
        }

        res.json(exerciseStats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch exercise stats' });
    }
});

// Get all stats for an exercise
app.get('/api/workouts/:muscle/exercises/:exercise/stats', async (req, res) => {
    try {
        const muscle = req.params.muscle.toLowerCase();
        const exercise = req.params.exercise.toLowerCase();

        const workouts = await Workout.find({ muscleGroup: muscle });
        const exerciseStats = workouts.reduce((acc, workout) => {
            const stats = workout.exercises.find(ex => ex.name.toLowerCase() === exercise);
            if (stats) {
                acc.push(...stats.stats);
            }
            return acc;
        }, []);

        res.json(exerciseStats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch exercise stats' });
    }
});

// Original workout endpoints
app.post('/api/workouts', async (req, res) => {
    try {
        const workout = new Workout(req.body);
        const savedWorkout = await workout.save();
        res.status(201).json(savedWorkout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create workout' });
    }
});

app.put('/api/workouts/:id', async (req, res) => {
    try {
        const workout = await Workout.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(workout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update workout' });
    }
});

app.delete('/api/workouts/:id', async (req, res) => {
    try {
        await Workout.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

// Public workout data (static)
app.get('/api/static/workouts/:muscle', (req, res) => {
    const muscle = req.params.muscle.toLowerCase();
    const dataPath = path.join(__dirname, '../client/assets/data', `${muscle}.json`);
    
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Workout data not found' });
    }
});

// Public exercises data
app.get('/api/static/exercises', (req, res) => {
    const dataPath = path.join(__dirname, '../client/assets/data', 'exercises.json');
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Exercises not found' });
    }
});

// Public weekly plan
app.get('/api/static/weekly-plan', (req, res) => {
    const dataPath = path.join(__dirname, '../client/assets/data', 'weeklyPlan.json');
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Weekly plan not found' });
    }
});



// Workout data endpoints (static data)
app.get('/api/static/workouts/:muscle', (req, res) => {
    const muscle = req.params.muscle.toLowerCase();
    const dataPath = path.join(__dirname, '../client/assets/data', `${muscle}.json`);
    
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Workout data not found' });
    }
});

// Get all exercises
app.get('/api/static/exercises', (req, res) => {
    const dataPath = path.join(__dirname, '../client/assets/data', 'exercises.json');
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Exercises not found' });
    }
});

// Get weekly plan
app.get('/api/static/weekly-plan', (req, res) => {
    const dataPath = path.join(__dirname, '../client/assets/data', 'weeklyPlan.json');
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Weekly plan not found' });
    }
});

// Handle all other GET requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
