import express from 'express';
import axios from 'axios';  // To call existing APIs

const router = express.Router();
const url = 'http://18.175.157.162:5000';

// API to get consolidated journal and habit data for a specific date range
router.get('/', async (req, res) => {
    const { user, startDate, endDate } = req.query;

    try {
        // Fetch journal entries from the existing journal API
        const journalResponse = await axios.get(`${url}/api/journalPages/range`, {
            params: { user, startDate, endDate }
        });
        const journalEntries = journalResponse.data;

        // Fetch habit data from the existing habit API with date range support
        const habitResponse = await axios.get(`${url}/api/habits/${user}/range`, {
            params: { startDate, endDate }
        });
        const habitEntries = habitResponse.data;

        // Helper function to compare only the date (ignoring time)
        const isSameDate = (date1, date2) => {
            const d1 = new Date(date1).setUTCHours(0, 0, 0, 0);
            const d2 = new Date(date2).setUTCHours(0, 0, 0, 0);
            return d1 === d2;
        };

        // Consolidate journal entries and habit data by date, remove duplicates
        const consolidatedData = journalEntries.reduce((acc, journal) => {
            const existingEntry = acc.find(entry => isSameDate(entry.date, journal.date));

            if (!existingEntry) {
                // If no duplicate exists, create a new entry
                const habitCompleted = {};
                habitEntries.forEach(habit => {
                    const completedOnThisDate = habit.trackedDays.some(trackedDay =>
                        isSameDate(trackedDay.date, journal.date)
                    );
                    habitCompleted[habit.name] = completedOnThisDate;
                });

                acc.push({
                    date: journal.date,
                    sentiment: journal.sentiment.compound,
                    habitCompleted: habitCompleted
                });
            }

            return acc;
        }, []);

        // Return consolidated data
        res.json(consolidatedData);
    } catch (error) {
        console.error('Error fetching consolidated data:', error);
        res.status(500).json({ message: 'Error fetching correlation data', error });
    }
});

export default router;
