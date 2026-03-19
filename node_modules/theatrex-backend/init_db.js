import { initializeTables } from './models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        console.log('Starting DB initialization...');
        await initializeTables();
        console.log('✅ DB initialization complete');
        process.exit(0);
    } catch (e) {
        console.error('❌ DB initialization failed:', e);
        process.exit(1);
    }
}

run();
