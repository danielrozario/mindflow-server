import mongoose from 'mongoose';


const habitSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true }, // good: stores Auth0 sub as string
    trackedDays: [{
        date: { type: Date, required: true }
        // You can re-enable `completed` if needed
    }]
}, { timestamps: true });

habitSchema.index({ "trackedDays.date": 1 });

export default mongoose.model('Habit', habitSchema);
