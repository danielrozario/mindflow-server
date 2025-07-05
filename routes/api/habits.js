import express from "express";
import Habit from '../../models/Habit.js';
import checkJwt from "../../middleware/checkJwt.js";

const router = express.Router();

// ✅ Test Authenticated Route
router.get('/test-auth', checkJwt, (req, res) => {
    console.log('Decoded token:', req.auth);
    res.json({ message: 'Authenticated!', user: req.auth });
});

// ✅ Get all habits for a user
router.get('/', checkJwt, async (req, res) => {
    try {
        const userId = req.auth?.sub;
        console.log("User ID from token:", userId);

        if (!userId) return res.status(400).json({ message: "User ID not found in token." });

        const habits = await Habit.find({ userId });
        res.json(habits);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch habits." });
    }
});

// ✅ Get habits within date range
router.get('/range', checkJwt, async (req, res) => {
    try {
        const userId = req.auth?.sub;
        const { startDate, endDate } = req.query;

        if (!userId) return res.status(400).json({ message: "User ID not found in token." });
        if (!startDate || !endDate) return res.status(400).json({ message: 'Start and end dates are required.' });

        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        const habits = await Habit.find({
            userId,
            'trackedDays.date': { $gte: start, $lte: end }
        });

        res.json(habits);
    } catch (error) {
        console.error('Error fetching habits in range:', error);
        res.status(500).json({ message: 'Error fetching habits for date range.' });
    }
});

// ✅ Create a new habit
router.post('/', checkJwt, async (req, res) => {
    try {
        const userId = req.auth?.sub;
        console.log('Creating a new habit for user:', userId);

        if (!userId) return res.status(400).json({ message: "User ID not found in token." });

        const newHabit = new Habit({ ...req.body, userId });
        await newHabit.save();

        res.status(201).json(newHabit);
    } catch (error) {
        console.error('Error creating habit:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
});

// ✅ Update trackedDays
router.put('/:id/trackedDays', checkJwt, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        habit.trackedDays = req.body.trackedDays || [];
        await habit.save();

        res.json(habit);
    } catch (error) {
        console.error('Error updating habit:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ Delete a habit
router.delete('/:id', checkJwt, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ message: 'Habit not found' });

        await habit.deleteOne();
        res.status(200).json({ message: 'Habit deleted' });
    } catch (error) {
        console.error('Error deleting habit:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
});

export default router;
