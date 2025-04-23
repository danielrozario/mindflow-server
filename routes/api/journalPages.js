import express from 'express';
import { exec } from 'child_process';
import JournalPage from '../../models/JournalPage.js'; // Adjust the path as needed

const router = express.Router();

// Create a new journal page entry with sentiment analysis
router.post('/', async (req, res) => {
    const { date, goalsForTheDay, reflections, gratitude, dailyAccomplishments, freewriting, user } = req.body;

    // Combine all journal sections to analyze the overall sentiment
    const journalEntryText = `${goalsForTheDay} ${reflections} ${gratitude} ${dailyAccomplishments} ${freewriting}`;

    try {

        // Run the Python sentiment analysis script
        exec(`python ./scripts/sentiment_analysis.py "${journalEntryText}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).json({ message: 'Error analyzing sentiment', error });
            }

            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).json({ message: 'Sentiment analysis error', error });
            }

            // Parse sentiment analysis result
            const sentiment = JSON.parse(stdout);
            console.log('sentiment is '+ sentiment);

            // Create and save the new journal entry with sentiment scores
            const newEntry = new JournalPage({
                date: date || new Date(), // Defaults to current date if not provided
                goalsForTheDay,
                reflections,
                gratitude,
                dailyAccomplishments,
                freewriting,
                sentiment, // Store sentiment analysis results
                user: user
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
router.get('/', async (req, res) => {
    const { date, user } = req.query;

    if (!date || !user) {
        return res.status(400).json({ message: 'Date and User ID are required' });
    }

    try {
        // Convert date to start and end of the day
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Find journal entries within the date range for the user
        const entries = await JournalPage.find({
            user: user,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        res.json(entries);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Error fetching journal entries', error });
    }
});

//Get journal entries for a specific user within a date range
router.get('/range', async (req, res) => {
    const { user, startDate, endDate } = req.query;

    if (!startDate || !endDate || !user) {
        return res.status(400).json({ message: 'User ID, start date, and end date are required' });
    }

    try {
        // Find journal entries within the date range for the user
        const journalEntries = await JournalPage.find({
            user: user,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });

        res.json(journalEntries);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Error fetching journal entries', error });
    }
});

// Update a journal page entry with sentiment analysis
router.put('/:id', async (req, res) => {
    const { date, goalsForTheDay, reflections, gratitude, dailyAccomplishments, freewriting } = req.body;

    // Combine all journal sections to analyze the overall sentiment
    const journalEntryText = `${goalsForTheDay} ${reflections} ${gratitude} ${dailyAccomplishments} ${freewriting}`;

    try {
        // Run the Python sentiment analysis script
        exec(`python ./scripts/sentiment_analysis.py "${journalEntryText}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).json({ message: 'Error analyzing sentiment', error });
            }

            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).json({ message: 'Sentiment analysis error', error });
            }

            // Parse sentiment analysis result
            const sentiment = JSON.parse(stdout);
        console.log('sentiment for put ' + sentiment)
            // Update the journal entry with new text and sentiment scores
            const updatedEntry = await JournalPage.findByIdAndUpdate(
                req.params.id,
                {
                    date,
                    goalsForTheDay,
                    reflections,
                    gratitude,
                    dailyAccomplishments,
                    freewriting,
                    sentiment,  // Update sentiment analysis results
                    updatedAt: Date.now(),
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

// Delete a journal page entry
router.delete('/:id', async (req, res) => {
    try {
        const deletedEntry = await JournalPage.findByIdAndDelete(req.params.id);

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
