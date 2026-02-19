import { pool } from '../config/database.js';

/**
 * Surgery-Nurses Junction Table Model
 * Handles the many-to-many relationship between surgeries and nurses
 * A surgery can have up to 3 nurses assigned
 * Created by: M2 (Chandeepa) - Day 9
 */

// Create surgery_nurses junction table
const createSurgeryNursesTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS surgery_nurses (
            id SERIAL PRIMARY KEY,
            surgery_id INT NOT NULL,
            nurse_id INT NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Unique constraint: same nurse can't be assigned twice to same surgery
            CONSTRAINT uq_surgery_nurse UNIQUE (surgery_id, nurse_id)
        );
    `;

    const createIndexes = `
        CREATE INDEX IF NOT EXISTS idx_surgery_nurses_surgery_id ON surgery_nurses (surgery_id);
        CREATE INDEX IF NOT EXISTS idx_surgery_nurses_nurse_id ON surgery_nurses (nurse_id);
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(createIndexes);
        console.log('✅ Surgery_nurses junction table created/verified successfully');
    } catch (error) {
        console.error('❌ Error creating surgery_nurses table:', error.message);
        throw error;
    }
};

// Get nurses assigned to a surgery
const getNursesBySurgeryId = async (surgeryId) => {
    try {
        const { rows } = await pool.query(
            `SELECT n.id, n.name, n.email, n.specialization, n.phone
             FROM surgery_nurses sn
             JOIN nurses n ON sn.nurse_id = n.id
             WHERE sn.surgery_id = $1
             ORDER BY n.name ASC`,
            [surgeryId]
        );
        return rows;
    } catch (error) {
        console.error('❌ Error fetching nurses for surgery:', error.message);
        throw error;
    }
};

// Assign nurses to a surgery (replaces existing assignments)
const assignNursesToSurgery = async (surgeryId, nurseIds) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Remove existing nurse assignments for this surgery
        await client.query('DELETE FROM surgery_nurses WHERE surgery_id = $1', [surgeryId]);

        // Insert new nurse assignments (up to 3)
        const limitedIds = nurseIds.slice(0, 3);
        for (const nurseId of limitedIds) {
            await client.query(
                'INSERT INTO surgery_nurses (surgery_id, nurse_id) VALUES ($1, $2)',
                [surgeryId, nurseId]
            );
        }

        await client.query('COMMIT');
        return limitedIds;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error assigning nurses to surgery:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

// Remove all nurse assignments for a surgery
const removeNursesFromSurgery = async (surgeryId) => {
    try {
        const result = await pool.query(
            'DELETE FROM surgery_nurses WHERE surgery_id = $1',
            [surgeryId]
        );
        return result.rowCount;
    } catch (error) {
        console.error('❌ Error removing nurses from surgery:', error.message);
        throw error;
    }
};

export {
    createSurgeryNursesTable,
    getNursesBySurgeryId,
    assignNursesToSurgery,
    removeNursesFromSurgery
};
