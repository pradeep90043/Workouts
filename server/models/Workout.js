const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    muscleGroup: {
        type: String,
        required: true
    },
    exercises: [{
        name: String,
        stats: [{
            date: {
                type: Date,
                required: true
            },
            sets: {
                type: Number,
                required: true,
                min: 1
            },
            reps: {
                type: Number,
                required: true,
                min: 1
            },
            weight: {
                type: Number,
                required: true,
                min: 0
            },
            rest: {
                type: Number,
                required: true,
                min: 0
            },
            notes: String
        }]
    }],
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster querying by date and muscle group
workoutSchema.index({ date: 1, muscleGroup: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
