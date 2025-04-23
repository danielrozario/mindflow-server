import mongoose from "mongoose";

const journalPageSchema = new mongoose.Schema({
    date: { type: Date, required: true }, // Date field to associate each entry with a specific day
    goalsForTheDay: { type: String, required: false },
    reflections: { type: String, required: false },
    gratitude: { type: String, required: false },
    dailyAccomplishments: { type: String, required: false },
    freewriting: { type: String, required: false },
    sentiment: {
        neg: { type: Number },     // Negative sentiment score
        neu: { type: Number },     // Neutral sentiment score
        pos: { type: Number },     // Positive sentiment score
        compound: { type: Number } // Overall sentiment score
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model('JournalPage', journalPageSchema);
