const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple test route
app.get('/test', (req, res) => {
    res.json({ message: 'Test route works!' });
});

// Simple POST test route
app.post('/test-post', (req, res) => {
    console.log('Test POST received:', req.body);
    res.json({ 
        message: 'POST received',
        data: req.body 
    });
});

// Workout stats endpoint
app.post('/api/workouts/:muscle/exercises/:exercise/stats', (req, res) => {
    console.log('=== WORKOUT STATS ENDPOINT ===');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    res.json({
        status: 'success',
        message: 'Workout stats received',
        data: {
            params: req.params,
            body: req.body
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        status: 'error',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    console.log(`  GET  http://localhost:${PORT}/test`);
    console.log(`  POST http://localhost:${PORT}/test-post`);
    console.log(`  POST http://localhost:${PORT}/api/workouts/:muscle/exercises/:exercise/stats`);
});
