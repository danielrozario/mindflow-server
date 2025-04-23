console.log('inside server.js');
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './config/db.js';
import usersRoutes from './routes/api/users.js';
import simpleJournalPagesRoutes from './routes/api/simpleJournalPages.js';
import habits from './routes/api/habits.js';
import journalPagesRoutes from './routes/api/journalPages.js';
import correlationRoutes from './routes/api/correlation.js';
import logger from './config/logger.js';
import healthRoutes from './routes/api/health.js';

const app = express();
const port = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    // Middleware
    app.use(express.json());

    // CORS setup
    const allowedOrigins = ['http://localhost:3000'];
    app.use(cors({
        // origin: allowedOrigins
    }));

    // Log incoming requests
    app.use((req, res, next) => {
        logger.http(`${req.method} ${req.url}`);
        next();
    });

    // Use routes
    app.use('/api/users', usersRoutes);
    app.use('/api/simplejournalpages', simpleJournalPagesRoutes);
    app.use('/api/habits', habits);
    app.use('/api/journalPages', journalPagesRoutes);
    app.use('/api/correlation', correlationRoutes);
    app.use('/health', healthRoutes);

    // Start the server
    app.listen(port, () => {
        logger.info(`Server started on port ${port}`);
    });

    // Global error handling
    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception: ', err);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection: ', reason);
    });
};

export default startServer;
