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

// Log environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());

// Simple test route at the beginning
app.get('/test-route', (req, res) => {
    console.log('Test route hit!');
    res.json({ message: 'Test route works!' });
});

// Route to list all registered routes
app.get('/routes', (req, res) => {
    const routes = [];
    
    function processRoutes(layer, prefix = '') {
        if (layer.route) {
            // Routes registered directly on the app
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            routes.push({
                method: methods,
                path: prefix + layer.route.path
            });
        } else if (layer.name === 'router') {
            // Routes added with router
            layer.handle.stack.forEach((handler) => {
                processRoutes(handler, prefix);
            });
        } else if (layer.regexp) {
            // This might be a route with parameters
            const path = layer.regexp.toString()
                .replace('/^\\/', '') // Remove leading /^
                .replace('\\/?', '') // Remove optional trailing /
                .replace('(?=\\/|$)', '') // Remove lookahead
                .replace(/\\([^/])/g, '$1') // Remove escape characters
                .replace('$', ''); // Remove trailing $
            
            if (path && !path.startsWith('(?:') && path !== '^/') {
                routes.push({
                    method: 'UNKNOWN',
                    path: path
                });
            }
        }
    }
    
    // Process all layers in the stack
    app._router.stack.forEach((layer) => {
        processRoutes(layer);
    });
    
    res.json({
        status: 'success',
        count: routes.length,
        routes: routes
    });
});

// Middleware - Must be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
    console.log(`\n=== ${new Date().toISOString()} ===`);
    console.log(`${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

// Models - Must be before routes
const Workout = require('./models/Workout');

// MongoDB connection with enhanced logging
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workouts';
    console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
    
    try {
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database name: ${conn.connection.name}`);
        console.log(`MongoDB version: ${conn.connection.version}`);
        
        // Log database events
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from DB');
        });
        
        // Create indexes for better performance
        await Workout.createIndexes();
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Exit process with failure
        process.exit(1);
    }
};

// Initialize DB connection
connectDB().then(() => {
    console.log('Database connection established successfully');
    // Log all registered routes
    console.log('\n=== REGISTERED ROUTES ===');
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes registered directly on the app
            const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
            console.log(`${methods.padEnd(7)} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            // Routes added with router
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
                    console.log(`${methods.padEnd(7)} ${handler.route.path}`);
                }
            });
        }
    });
    console.log('=========================\n');
}).catch(err => {
    console.error('Failed to initialize database connection:', err);
    process.exit(1);
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3003',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Configure CORS
const isDevelopment = process.env.NODE_ENV === 'development';

// Allow all origins in development, with specific ones in production
const corsOptions = {
    origin: isDevelopment 
        ? function (origin, callback) {
            // Allow all origins in development
            callback(null, true);
        } 
        : [
            'http://localhost:3001',  // Expo web
            'http://localhost:3002',  // Local server
            'http://localhost:19006', // Expo webpack dev server
            // Add your production domains here
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Log CORS info
app.use((req, res, next) => {
    console.log(`[CORS] ${req.method} ${req.originalUrl} from origin: ${req.headers.origin || 'none'}`);
    next();
});

// API health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        node: process.version,
        env: process.env.NODE_ENV || 'development',
        cors: {
            mode: isDevelopment ? 'development (all origins allowed)' : 'production',
            origin: req.headers.origin || 'none'
        }
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Workout API is running',
        documentation: {
            health: 'GET /api/health',
            workouts: 'GET /api/workouts',
            addStats: 'POST /api/workouts/:muscle/exercises/:exercise/stats'
        },
        timestamp: new Date().toISOString()
    });
});

// Log all routes for debugging
console.log('\n=== ROUTE STACK ===');
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(Object.keys(r.route.methods).join(',').toUpperCase(), r.route.path);
    }
});
console.log('=================\n');

// Handle undefined routes
app.use((req, res, next) => {
    console.error('Unhandled route:', req.method, req.originalUrl);
    res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: [
            'GET    /',
            'GET    /api/health',
            'GET    /api/workouts',
            'POST   /api/workouts/:muscle/exercises/:exercise/stats',
            'GET    /api/workouts/:muscle/exercises/:exercise/stats/:date'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body
    });
    
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err.details 
        })
    });
});

// Debug route registration
console.log('Registering API routes...');

// Log all registered routes
const printRoutes = () => {
    console.log('\n=== REGISTERED ROUTES ===');
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes registered directly on the app
            const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
            console.log(`${methods.padEnd(7)} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            // Routes added with router
            middleware.handle.stack.forEach((handler) => {
                const route = handler.route;
                if (route) {
                    const methods = Object.keys(route.methods).join(',').toUpperCase();
                    console.log(`${methods.padEnd(7)} ${route.path}`);
                }
            });
        }
    });
    console.log('=========================\n');
};

// Log all incoming requests with detailed information
app.use((req, res, next) => {
    const start = Date.now();
    
    // Log request start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    
    // Log response finish
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        originalEnd.apply(res, [chunk, encoding]);
    };
    
    next();
});

// Debug route to list all registered routes
app.get('/debug/routes', (req, res) => {
    const routes = [];
    
    function processMiddleware(middleware, prefix = '') {
        if (middleware.route) {
            // Routes registered directly on the app
            const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
            routes.push({
                method: methods,
                path: prefix + middleware.route.path
            });
        } else if (middleware.name === 'router') {
            // Routes added with router
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
                    routes.push({
                        method: methods,
                        path: prefix + handler.route.path
                    });
                }
            });
        }
    }
    
    // Process all middleware in the stack
    app._router.stack.forEach((middleware) => {
        processMiddleware(middleware);
    });
    
    res.json({
        status: 'success',
        count: routes.length,
        routes: routes
    });
});

// Root route
app.get('/', (req, res) => {
    const routes = [
        { method: 'GET', path: '/', description: 'API status' },
        { method: 'GET', path: '/debug/routes', description: 'List all registered routes' },
        { method: 'GET', path: '/api/health', description: 'Health check' },
        { method: 'GET', path: '/api/test', description: 'Test endpoint' },
        { method: 'POST', path: '/api/test-post', description: 'Test POST endpoint' },
        { method: 'GET', path: '/api/workouts', description: 'Get all workouts' },
        { method: 'GET', path: '/api/workouts/:muscle', description: 'Get workouts by muscle group' },
        { method: 'POST', path: '/api/workouts/:muscle/exercises/:exercise/stats', description: 'Add exercise stats' },
        { method: 'GET', path: '/api/workouts/:muscle/exercises/:exercise/stats/:date', description: 'Get exercise stats by date' }
    ];
    
    res.json({
        status: 'Workout API',
        timestamp: new Date().toISOString(),
        endpoints: routes.filter(route => route.method.includes('GET'))
    });
});

// Print routes after they're all registered
setImmediate(printRoutes);

// API Routes
app.get('/api/health', (req, res) => {
    console.log('Health check endpoint hit');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Test endpoint works!' });
});

// Test POST route
app.post('/api/test-post', (req, res) => {
    console.log('Test POST endpoint hit');
    console.log('Request body:', req.body);
    res.json({ 
        message: 'Test POST endpoint works!',
        body: req.body 
    });
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

// Add exercise stats - simplified route
console.log('Registering POST /api/workouts/:muscle/exercises/:exercise/stats route');
console.log('Current stack trace:', new Error().stack);

app.post('/api/workouts/:muscle/exercises/:exercise/stats', async (req, res) => {
    console.log('=== STATS ENDPOINT HIT ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    console.log('Request body:', req.body);
    console.log('Request route:', req.route);
    try {
        console.log('=== NEW REQUEST ===');
        console.log('Received request with body:', JSON.stringify(req.body, null, 2));
        
        const { sets, reps, weight, rest, notes } = req.body;
        const date = new Date();
        const muscle = req.params.muscle.toLowerCase();
        const exercise = req.params.exercise.toLowerCase();

        console.log(`Processing stats for ${exercise} in ${muscle} muscle group`);
        console.log('Current date:', date);
        console.log('Date range for query:', {
            start: startOfDay(date),
            end: endOfDay(date)
        });

        // Validate required fields
        if (!sets || !reps || !weight) {
            console.error('Missing required fields:', { sets, reps, weight });
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['sets', 'reps', 'weight']
            });
        }

        // Find or create workout for today
        let workout;
        try {
            const query = { 
                muscleGroup: muscle, 
                date: { $gte: startOfDay(date), $lt: endOfDay(date) }
            };
            console.log('Database query:', JSON.stringify(query, null, 2));
            
            workout = await Workout.findOne(query);
            console.log('Found existing workout:', workout ? 'Yes' : 'No');
            
        } catch (dbError) {
            console.error('Database error when finding workout:', dbError);
            return res.status(500).json({ 
                error: 'Database error when finding workout',
                details: dbError.message,
                stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
            });
        }

        if (!workout) {
            console.log('Creating new workout document');
            try {
                const newWorkoutData = {
                    name: `${exercise} Workout`,
                    muscleGroup: muscle,
                    date: date,
                    exercises: [{
                        name: exercise,
                        stats: []
                    }]
                };
                console.log('New workout data:', JSON.stringify(newWorkoutData, null, 2));
                
                workout = new Workout(newWorkoutData);
                console.log('Workout model created, attempting to save...');
                
                await workout.save();
                console.log('New workout saved successfully');
                
            } catch (createError) {
                console.error('Error creating/saving workout:', {
                    message: createError.message,
                    name: createError.name,
                    code: createError.code,
                    errors: createError.errors,
                    stack: createError.stack
                });
                return res.status(500).json({ 
                    error: 'Error creating workout',
                    message: createError.message,
                    details: process.env.NODE_ENV === 'development' ? createError.stack : undefined
                });
            }
        }


        // Find or create exercise stats
        let exerciseIndex = workout.exercises.findIndex(ex => ex.name.toLowerCase() === exercise);
        console.log(`Exercise index: ${exerciseIndex}`);
        
        if (exerciseIndex === -1) {
            console.log('Adding new exercise to workout');
            if (!Array.isArray(workout.exercises)) {
                workout.exercises = [];
            }
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
