import winston from 'winston';

// Create the logger instance
const logger = winston.createLogger({
    level: 'info', // Default level
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(), // Log to console
        new winston.transports.File({ filename: 'logs/app.log', level: 'info' }), // Info+ logs
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Error logs
    ],
});

// Simplified dev console output
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default logger;
