require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const workoutRoutes = require('./routes/workoutRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
    console.log(`\n=== ${new Date().toISOString()} ===`);
    console.log(`${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('Params:', JSON.stringify(req.params, null, 2));
    if (req.method !== 'GET') {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// MongoDB connection state
let isDBConnected = false;

const connectDB = async () => {
    if (isDBConnected) {
        console.log('Using existing database connection');
        return true;
    }

    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workouts?directConnection=true';
    console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
    
    try {
        // Close any existing connections first
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });

        isDBConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database name: ${conn.connection.name}`);
        
        mongoose.connection.on('connected', () => {
            isDBConnected = true;
            console.log('Mongoose connected to DB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
            isDBConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from DB');
            isDBConnected = false;
        });
        
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        isDBConnected = false;
        throw error;
    }
};

// Test route
app.get('/api/health', async (req, res) => {
    try {
        await connectDB();
        res.json({
            status: 'success',
            message: 'Server is healthy',
            database: isDBConnected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Service Unavailable',
            error: 'Database connection failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// API Routes
app.use('/api', workoutRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: [
            'GET    /api/health',
            'GET    /api/workouts/summary',
            'GET    /api/workouts/muscle/:muscleGroup',
            'POST   /api/workouts',
            'POST   /api/workouts/:workoutId/exercises',
            'POST   /api/workouts/:workoutId/exercises/:exerciseName/stats'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
        return res.status(400).json({
            status: 'error',
            message: 'Duplicate key error',
            field: Object.keys(err.keyPattern)[0],
            value: err.keyValue[Object.keys(err.keyPattern)[0]]
        });
    }
    
    // Default error handler
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 3003;

const startServer = async () => {
    try {
        await connectDB();
        
        const server = app.listen(PORT, () => {
            console.log(`\n=== Server running on port ${PORT} ===`);
            console.log('Available endpoints:');
            console.log(`  GET    http://localhost:${PORT}/api/health`);
            console.log(`  GET    http://localhost:${PORT}/api/workouts/summary`);
            console.log(`  GET    http://localhost:${PORT}/api/workouts/muscle/:muscleGroup`);
            console.log(`  POST   http://localhost:${PORT}/api/workouts`);
            console.log(`  POST   http://localhost:${PORT}/api/workouts/:workoutId/exercises`);
            console.log(`  POST   http://localhost:${PORT}/api/workouts/:workoutId/exercises/:exerciseName/stats\n`);
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
