import mongoose from 'mongoose';
import logger from '../config/logger.js'
const connectDB = async () => {
    try {
        console.log("MONGO_URI from .env:", process.env.MONGO_URI);

        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info('MongoDB connected');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('MongoDB connection error: ', error)
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;