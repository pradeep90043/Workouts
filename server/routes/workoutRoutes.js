const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');

// Default user ID to use when authentication is bypassed
const DEFAULT_USER_ID = 'demo-user';

/**
 * @route GET /api/workouts/summary
 * @desc Get workout summary grouped by date, muscle group, and exercise
 * @query startDate - Start date for filtering (ISO format)
 * @query endDate - End date for filtering (ISO format)
 */
router.get('/workouts/summary', async (req, res) => {
    try {
        const { startDate = '1970-01-01', endDate = new Date().toISOString() } = req.query;
        
        const summary = await Workout.aggregate([
            {
                $match: {
                    userId: DEFAULT_USER_ID,
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            { $unwind: '$exercises' },
            { $unwind: '$exercises.stats' },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$exercises.stats.date' } },
                        muscleGroup: '$exercises.muscleGroup',
                        exercise: '$exercises.name'
                    },
                    totalSets: { $sum: { $size: '$exercises.stats.sets' } },
                    totalVolume: {
                        $sum: {
                            $reduce: {
                                input: '$exercises.stats.sets',
                                initialValue: 0,
                                in: { $add: ['$$value', { $multiply: ['$$this.reps', '$$this.weight'] }] }
                            }
                        }
                    },
                    stats: { $push: '$exercises.stats' }
                }
            },
            {
                $group: {
                    _id: {
                        date: '$_id.date',
                        muscleGroup: '$_id.muscleGroup'
                    },
                    exercises: {
                        $push: {
                            name: '$_id.exercise',
                            totalSets: '$totalSets',
                            totalVolume: '$totalVolume',
                            stats: '$stats'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    date: { $first: '$_id.date' },
                    muscleGroups: {
                        $push: {
                            name: '$_id.muscleGroup',
                            exercises: '$exercises'
                        }
                    },
                    totalExercises: { $sum: { $size: '$exercises' } },
                    totalVolume: { $sum: { $sum: '$exercises.totalVolume' } }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        res.json({
            status: 'success',
            data: summary,
            meta: {
                startDate,
                endDate,
                totalWorkouts: summary.length
            }
        });
    } catch (error) {
        console.error('Error fetching workout summary:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch workout summary',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

/**
 * @route POST /api/workouts
 * @desc Add exercise details for a specific date
 * @body {
 *   date: string (ISO date),
 *   exercises: [{
 *     name: string,
 *     muscleGroup: string,
 *     sets: [{
 *       reps: number,
 *       weight: number,
 *       rest: number (optional, in seconds),
 *       completed: boolean (optional, default: true)
 *     }],
 *     notes: string (optional),
 *     rating: number (1-5, optional),
 *     duration: number (in seconds, optional)
 *   }],
 *   notes: string (optional)
 * }
 */
router.post('/workouts', async (req, res) => {
    try {
        const { date = new Date(), exercises, notes } = req.body;

        // Validate required fields
        if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'At least one exercise is required'
            });
        }

        // Validate each exercise
        for (const [index, ex] of exercises.entries()) {
            if (!ex.name || !ex.muscleGroup || !ex.sets || !Array.isArray(ex.sets) || ex.sets.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: `Exercise at index ${index} is missing required fields (name, muscleGroup, or sets)`
                });
            }

            for (const [setIndex, set] of ex.sets.entries()) {
                if (typeof set.reps === 'undefined' || typeof set.weight === 'undefined') {
                    return res.status(400).json({
                        status: 'error',
                        message: `Set ${setIndex + 1} in exercise "${ex.name}" is missing reps or weight`
                    });
                }
            }
        }

        // Create workout data
        const workoutData = {
            userId: DEFAULT_USER_ID,
            date: new Date(date),
            exercises: exercises.map(ex => ({
                name: ex.name,
                muscleGroup: ex.muscleGroup.toLowerCase(),
                stats: [{
                    date: new Date(date),
                    sets: ex.sets.map((set, index) => ({
                        setNumber: index + 1,
                        reps: set.reps,
                        weight: set.weight,
                        rest: set.rest || 60,
                        completed: set.completed !== false // default to true if not specified
                    })),
                    notes: ex.notes || '',
                    rating: ex.rating,
                    duration: ex.duration
                }]
            })),
            notes: notes || '',
            completed: true
        };

        const workout = new Workout(workoutData);
        await workout.save();

        res.status(201).json({
            status: 'success',
            data: workout
        });
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(400).json({
            status: 'error',
            message: 'Failed to create workout',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

module.exports = router;
