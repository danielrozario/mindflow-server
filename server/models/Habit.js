import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trackedDays: [{
        date: { type: Date, required: true }/*,
        completed: { type: Boolean, default: false }*/
    }]
}, { timestamps: true });

// Index for faster queries on specific dates within trackedDays
habitSchema.index({ "trackedDays.date": 1 });

export default mongoose.model('Habit', habitSchema);
