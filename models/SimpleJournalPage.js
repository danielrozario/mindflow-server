import mongoose from "mongoose";

const simpleJournalPageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model('SimpleJournalPage', simpleJournalPageSchema)