
import dotenv from 'dotenv';
dotenv.config(); // load .env first

const { default: startServer } = await import('./server.js'); //  lazy import
await startServer(); // run after env ready

