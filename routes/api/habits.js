import express from "express";
const router = express.Router();
import Habit from '../../models/Habit.js';
import checkJwt from "../../middleware/checkJwt.js";


router.get('/test-auth', checkJwt, (req, res) => {
    console.log('Decoded token:', req.auth); // or req.user in older versions
    res.json({ message: 'Authenticated!', user: req.auth });
});

// Get all habits for a user
router.get('/habits', checkJwt, async (req, res) => {
    try {
        const userId = req.auth?.sub; //
        console.log("User ID from token:", userId);

        if (!userId) return res.status(400).json({ message: "User ID not found in token." });

        const habits = await Habit.find({ userId });
        res.json(habits);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch habits." });
    }
});



// Get habits for a user within a date range
router.get('/range', checkJwt ,async(req, res) => {
    const userId = req.sub;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
    }

    try {
        // Adjust date comparison to ignore time zones
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999); // End of the day

        console.log('Adjusted Start Date:', startOfDay);
        console.log('Adjusted End Date:', endOfDay);

        const habits = await Habit.find({
            userId,
            'trackedDays.date': { $gte: startOfDay, $lt: new Date(endOfDay.getTime() + 86400000) }  // Add 24 hours to end date
        });

        console.log('Habits found:', habits);
        res.json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({ message: 'Error fetching habits for date range' });
    }
});




// Create a new habit
router.post('/', checkJwt, async (req, res) => {
    try {
        const userId = req.user.sub;
        console.log('Creating a new habit for user:', userId);

        const newHabit = new Habit({
            ...req.body,
            userId,
        });
        await newHabit.save();
        res.status(201).json(newHabit);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request' });
    }
});

// Update a habit's tracked days
router.put('/:id/trackedDays', checkJwt,async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        habit.trackedDays = req.body.trackedDays; // Update trackedDays with the incoming array
        await habit.save();

        res.json(habit); // Return the updated habit
    } catch (error) {
        console.error('Error updating habit:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete a habit
router.delete('/:id', checkJwt, async (req, res) => {
    try {
        const { id } = req.params;

        const habit = await Habit.findById(id);
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        await habit.remove();
        res.status(200).json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Bad Request' });
    }
});

export default router;
