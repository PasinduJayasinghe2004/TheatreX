import { pool } from './config/database.js';

async function checkTheatres() {
    try {
        const { rows } = await pool.query('SELECT * FROM theatres ORDER BY id');
        console.log(`Found ${rows.length} theatres.`);
        rows.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, Status: ${r.status}, Active: ${r.is_active}`));
        process.exit(0);
    } catch (error) {
        console.error('Error checking theatres:', error);
        process.exit(1);
    }
}

checkTheatres();
