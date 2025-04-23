// start.js
import dotenv from 'dotenv';
dotenv.config(); // ✅ load .env first

console.log("MONGO_URI:", process.env.MONGO_URI);

const { default: startServer } = await import('./server.js'); // ✅ lazy import
await startServer(); // ✅ run it after env is ready

console.log("App bootstrapped");
