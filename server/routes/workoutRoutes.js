const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const { protect } = require('../middleware/auth');

// Apply protect middleware to all routes
router.use(protect);

/**
 * @route GET /api/v1/workouts/summary
 * @desc Get workout summary grouped by date, muscle group, and exercise
 * @query startDate - Start date for filtering (ISO format)
 * @query endDate - End date for filtering (ISO format)
 */
// server/routes/workoutRoutes.js
router.get('/summary', async (req, res, next) => {
    
    try {
      const result = await Workout.aggregate([{
        $match: { userId: req.user.username }
      }, {
        $unwind: '$stats'
      }, {
        $unwind: '$stats.sets'
      }, {
        $addFields: {
          'stats.sets.volume': {
            $multiply: [
              '$stats.sets.reps',
              '$stats.sets.weight'
            ]
          }
        }
      }, 
    //   {
    //     $group: {
    //       _id: '$_id',
    //       name: { $first: '$name' },
    //       muscleGroup: { $first: '$muscleGroup' },
    //       stats: { $push: '$stats' },
    //       exerciseVolume: { $sum: '$stats.sets.volume' }
    //     }
    //   }, {
    //     $group: {
    //       _id: '$muscleGroup',
    //       exercises: {
    //         $push: {
    //           id: '$_id',
    //           name: '$name',
    //           muscleGroup: '$muscleGroup',
    //           stats: '$stats',
    //           volume: '$exerciseVolume'
    //         }
    //       },
    //       totalVolume: { $sum: '$exerciseVolume' }
    //     }
    //   }, 
    //   {
    //     $project: {
    //       _id: 0,
    //       name: '$_id',
    //       exercises: 1,
    //       totalVolume: 1
    //     }
    //   }
    ]);
res.status(200).json({
    status: 'success',
    data: result,
    statusCode: 200
});
      // Calculate exercise volumes across all muscle groups
      const exerciseVolumes = [];
      const exerciseMap = new Map();
      
      result.forEach(muscleGroup => {
        muscleGroup.exercises.forEach(exercise => {
          if (exerciseMap.has(exercise.name)) {
            exerciseMap.set(exercise.name, exerciseMap.get(exercise.name) + exercise.volume);
          } else {
            exerciseMap.set(exercise.name, exercise.volume);
          }
        });
      });

      exerciseMap.forEach((volume, name) => {
        exerciseVolumes.push({ name, volume });
      });

    //   res.status(200).json({
    //     status: 'success',
    //     data: {
    //       muscleGroups: result,
    //       exerciseVolumes,
    //       muscleVolumes: result.map(({ name, totalVolume }) => ({
    //         name,
    //         volume: totalVolume
    //       }))
    //     },
    //     statusCode: 200
    //   });
    } catch (error) {
      console.error('Error in /summary:', error);
      res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Failed to fetch workout summary',
        error: error.message
      });
    }
  });
  

/**
 * @route POST /api/workouts
 * @desc Add new exercise stats (creates new exercise entry)
 * @body {
 *   name: string (required),
 *   muscleGroup: string (required),
 *   sets: [{
 *     reps: number (required),
 *     weight: number (optional, default: 0),
 *     rest: number (optional, default: 60)
 *   }],
 *   notes: string (optional)
 * }
 */
router.post('/', async (req, res, next) => {
    try {
        const { name, muscleGroup, sets, notes, rating, duration } = req.body;
        const currentDate = new Date();
        const userId = req.user.id;

        // Validate required fields
        if (!name || !muscleGroup || !Array.isArray(sets) || sets.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name, muscleGroup, or sets'
            });
        }

        // Validate each set in the exercise
        for (const [setIndex, set] of sets.entries()) {
            if (set.reps === undefined) {
                return res.status(400).json({
                    status: 'error',
                    message: `Set ${setIndex + 1} is missing required 'reps' field`
                });
            }
        }

        // Find all workout documents for the user
        let workouts = await Workout.find({ userId: req.user.id });

        // If no workouts exist, create one
        if (workouts.length === 0) {
            const newWorkout = new Workout({
                userId: req.user.id,
                exercises: [],
                notes: 'Workout Tracker',
                completed: true
            });
            await newWorkout.save();
            workouts = [newWorkout];
        }

        // For now, we'll work with the first workout
        // In a real app, you might want to create a new workout per session or per day
        // Format the date to compare just the date part (ignoring time)
        const statsDate = new Date(currentDate);
        statsDate.setHours(0, 0, 0, 0);

        // Prepare the new stats entry
        const newStats = {
            date: statsDate,
            sets: sets.map((set, index) => ({
                setNumber: index + 1,
                reps: set.reps,
                weight: set.weight || 0,
                rest: set.rest || 60,
                completed: true,
                notes: ''
            })),
            notes: notes || '',
            rating: rating || 1,
            duration: duration || 0
        };

        // Always create a new exercise entry for POST
        const firstWorkout = workouts[0];
        firstWorkout.exercises.push({
            name: name,
            muscleGroup: muscleGroup,
            userId: userId,
            stats: [newStats]
        });
        const savedWorkout = await firstWorkout.save();

        return res.status(201).json({
            status: 'success',
            message: 'New exercise stats added successfully',
            data: savedWorkout
        });
    } catch (error) {
        console.error('Error adding workout:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding workout',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * @route PUT /api/workouts/:exerciseId
 * @desc Update existing exercise stats
 * @params exerciseId - ID of the exercise to update
 * @body {
 *   sets: [{
 *     reps: number (required),
 *     weight: number (optional, default: 0),
 *     rest: number (optional, default: 60)
 *   }],
 *   notes: string (optional)
 * }
 */
router.put('/:exerciseId', async (req, res, next) => {
    try {
        const { exerciseId } = req.params;
        const { sets, notes, rating, duration } = req.body;
        const currentDate = new Date();
        const userId = req.user.id;

        // Validate required fields
        if (!Array.isArray(sets) || sets.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Sets array is required'
            });
        }

        // Find the exercise within the user's workouts
        const workout = await Workout.findOne({
            'exercises._id': exerciseId,
            userId: userId
        });
        
        if (!workout) {
            return res.status(404).json({
                status: 'error',
                message: 'Exercise not found or not authorized'
            });
        }
        
        // Find the specific exercise
        const exercise = workout.exercises.id(exerciseId);
        if (!exercise) {
            return res.status(404).json({
                status: 'error',
                message: 'Exercise not found'
            });
        }



        // Format the date to compare just the date part (ignoring time)
        const statsDate = new Date(currentDate);
        statsDate.setHours(0, 0, 0, 0);

        // Prepare the new stats entry
        const newStats = {
            date: statsDate,
            sets: sets.map((set, index) => ({
                setNumber: index + 1,
                reps: set.reps || 0,
                weight: set.weight || 0,
                rest: set.rest || 60,
                completed: true,
                notes: ''
            })),
            notes: notes || '',
            rating: rating || 1,
            duration: duration || 0
        };

        // Check if stats already exist for this date in the exercise
        const statsIndex = exercise.stats.findIndex(stat => {
            const statDate = new Date(stat.date);
            statDate.setHours(0, 0, 0, 0);
            return statDate.getTime() === statsDate.getTime();
        });

        if (statsIndex >= 0) {
            // Update existing stats
            exercise.stats.set(statsIndex, newStats);
        } else {
            // Add new stats
            exercise.stats.push(newStats);
        }

        // Mark the exercise as modified to ensure Mongoose saves the changes
        workout.markModified('exercises');
        
        // Save the updated workout
        const savedWorkout = await workout.save();

     

        return res.status(200).json({
            status: 'success',
            message: 'Exercise stats updated successfully',
            data: savedWorkout
        });
    } catch (error) {
        console.error('Error adding workout:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding workout',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
