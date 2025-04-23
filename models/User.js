import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    auth0Id: {
        type: String,
        required: true,
        unique: true
    },
    journalPages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalPage' }],
    habits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Habit' }]
});

export default mongoose.model('User', userSchema);
