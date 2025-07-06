import express from 'express';
import { exec } from 'child_process';
import JournalPage from '../../models/JournalPage.js';
import checkJwt from '../../middleware/checkJwt.js';

const router = express.Router();

// Create a new journal page entry with sentiment analysis
router.post('/', checkJwt, async (req, res) => {
    const user = req.auth.sub;
    const { date, goalsForTheDay, reflections, gratitude, dailyAccomplishments, freewriting } = req.body;

    const journalEntryText = `${goalsForTheDay} ${reflections} ${gratitude} ${dailyAccomplishments} ${freewriting}`;

    try {
        exec(`python3 ./scripts/sentiment_analysis.py "${journalEntryText}"`, async (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`Sentiment analysis error:`, error || stderr);
                return res.status(500).json({ message: 'Error analyzing sentiment', error: error?.message || stderr });
            }

            const sentiment = JSON.parse(stdout);

            const newEntry = new JournalPage({
                date: date || new Date(),
                goalsForTheDay,
                reflections,
                gratitude,
                dailyAccomplishments,
                freewriting,
                sentiment,
                user
            });

            await newEntry.save();
            res.status(201).json(newEntry);
        });
    } catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ message: 'Error creating journal entry', error });
    }
});

// Get journal entries for a specific user and date
router.get('/', checkJwt, async (req, res) => {
    const user = req.auth.sub;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    try {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const entries = await JournalPage.find({
            user,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        res.json(entries);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Error fetching journal entries', error });
    }
});

// Get journal entries within a date range
router.get('/range', checkJwt, async (req, res) => {
    const user = req.auth.sub;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
    }

    try {
        const journalEntries = await JournalPage.find({
            user,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });

        res.json(journalEntries);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Error fetching journal entries', error });
    }
});

// Update a journal entry
router.put('/:id', checkJwt, async (req, res) => {
    const user = req.auth.sub;
    const { date, goalsForTheDay, reflections, gratitude, dailyAccomplishments, freewriting } = req.body;
    const journalEntryText = `${goalsForTheDay} ${reflections} ${gratitude} ${dailyAccomplishments} ${freewriting}`;

    try {
        exec(`python3 ./scripts/sentiment_analysis.py "${journalEntryText}"`, async (error, stdout, stderr) => {
            if (error || stderr) {
                console.error('Sentiment analysis error:', error || stderr);
                return res.status(500).json({ message: 'Sentiment analysis failed', error: error?.message || stderr });
            }

            const sentiment = JSON.parse(stdout);

            const updatedEntry = await JournalPage.findOneAndUpdate(
                { _id: req.params.id, user },
                {
                    date,
                    goalsForTheDay,
                    reflections,
                    gratitude,
                    dailyAccomplishments,
                    freewriting,
                    sentiment,
                    updatedAt: Date.now()
                },
                { new: true }
            );

            if (!updatedEntry) {
                return res.status(404).json({ message: 'Journal entry not found' });
            }

            res.json(updatedEntry);
        });
    } catch (error) {
        console.error('Error updating journal entry:', error);
        res.status(500).json({ message: 'Error updating journal entry', error });
    }
});

// Delete a journal entry
router.delete('/:id', checkJwt, async (req, res) => {
    const user = req.auth.sub;

    try {
        const deletedEntry = await JournalPage.findOneAndDelete({ _id: req.params.id, user });

        if (!deletedEntry) {
            return res.status(404).json({ message: 'Journal entry not found' });
        }

        res.json({ message: 'Journal entry deleted' });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        res.status(500).json({ message: 'Error deleting journal entry', error });
    }
});

export default router;
