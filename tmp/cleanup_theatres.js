import { pool } from '../backend/config/database.js';

async function cleanupTheatres() {
    try {
        console.log('Starting theatre name cleanup...');
        
        // Use LPAD to ensure Theatre 01, Theatre 02 etc.
        const query = `
            UPDATE theatres 
            SET name = 'Theatre ' || LPAD(id::text, 2, '0')
            WHERE id IS NOT NULL
            RETURNING id, name;
        `;
        
        const { rows } = await pool.query(query);
        
        console.log(`Successfully updated ${rows.length} theatres.`);
        rows.forEach(row => {
            console.log(`ID: ${row.id} -> Name: ${row.name}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning up theatres:', error);
        process.exit(1);
    }
}

cleanupTheatres();
