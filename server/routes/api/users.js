import express from 'express';
import User from '../../models/User.js';

const router = express.Router();

// @route   GET api/users
// @desc    Check if a user exists by email
console.log('inside user.js');

router.get('/', async (req, res) => {
    try {
        console.log('checking if user exists')
        const email = req.query.email;

        // Find user by email
        const user = await User.findOne({ email });

        if (user) {
            return res.json({ exists: true, user });
        } else {
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users
// @desc    Create a user

// Create a new user
router.post('/', async (req, res) => {
    const { name, email, auth0Id } = req.body;  // Add auth0Id to the request body

    try {
        console.log('tried to create new user')
        let user = await User.findOne({ email });

        if (user) {

            console.log('user does  exist')
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
console.log('user does not exist')

        user = new User({
            name,
            email,
            auth0Id  // Store the Auth0 ID for reference
        });

        await user.save();

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


export default router;