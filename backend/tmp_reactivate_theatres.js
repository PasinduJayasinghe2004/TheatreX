import { pool } from './config/database.js';

async function reactivateTheatres() {
    try {
        const { rowCount } = await pool.query('UPDATE theatres SET is_active = TRUE WHERE id <= 15');
        console.log(`Successfully reactivated ${rowCount} theatres.`);
        process.exit(0);
    } catch (error) {
        console.error('Error reactivating theatres:', error);
        process.exit(1);
    }
}

reactivateTheatres();
