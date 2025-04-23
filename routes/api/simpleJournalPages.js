import express from 'express';
import SimpleJournalPage from '../../models/SimpleJournalPage.js';
import User from "../../models/User.js";

const router = express.Router();
console.log('inside simplejournalpages route')


// Create a new simple journal page for a user
router.post('/', async (req, res) => {
    try {
        console.log('inside sjp post try')
        //66c63537171e1bea8b14e46b
        const { content, userId } = req.body;

        // Create a new journal page
        const newSimpleJournalPage = new SimpleJournalPage({
            content,
            user: userId
        });

        const savedSimpleJournalPage = await newSimpleJournalPage.save();

        console.log('check userID before calling user ' +userId)
        console.log('saved journal page id: ' +savedSimpleJournalPage._id)
        // Update the user document by pushing the new journal page ID
        const user = await User.findByIdAndUpdate(userId, {
            $push: { journalPages: savedSimpleJournalPage._id }
        });
        res.status(201).json(savedSimpleJournalPage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all simple journal pages for a user
router.get('/user/:userId', async (req, res) => {
    try {
        console.log('all')
        const simpleJournalPages = await SimpleJournalPage.find({ user: req.params.userId }).populate('user','name');
        res.json(simpleJournalPages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get a specific simple journal page
router.get('/:id', async (req, res) => {
    try {
        const simpleJournalPage = await SimpleJournalPage.findById(req.params.id);

        if (!simpleJournalPage) {
            return res.status(404).json({ message: 'Simple Journal Page not found' });
        }

        res.json(simpleJournalPage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update a simple journal page
router.put('/:id', async (req, res) => {
    try {
        const { content } = req.body;
        const updatedSimpleJournalPage = await SimpleJournalPage.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true }
        );

        if (!updatedSimpleJournalPage) {
            return res.status(404).json({ message: 'Simple Journal Page not found' });
        }

        res.json(updatedSimpleJournalPage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete a simple journal page
router.delete('/:id', async (req, res) => {
    try {
        const deletedSimpleJournalPage = await SimpleJournalPage.findByIdAndDelete(req.params.id);

        if (!deletedSimpleJournalPage) {
            return res.status(404).json({ message: 'Simple Journal Page not found' });
        }

        res.json({ message: 'Simple Journal Page deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;