/**
 * ============================================================
 * Hard Purge Test Users & Data Script
 * ============================================================
 * Removes ~850 junk test/mock accounts from the database.
 * Preserves real users based on name, email, and clerk_id.
 * 
 * Usage: node scripts/hard-purge-test-users.js
 * ============================================================
 */

import { pool } from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

// REAL USERS TO EXEMPT (PROTECT)
const PROTECTED_EMAILS = [
    'pasindu.20241670@iit.ac.lk',
    'chandeepapriyadarsh@gmail.com',
    'samadhi@gmail.com',
    'madubashap98@gmail.com'
];

async function hardPurge() {
    console.log('🚮 Starting deep purge of 850+ test users...\n');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Identify users to DELETE
        const { rows: doomedUsers } = await client.query(`
            SELECT id, name, email FROM users
            WHERE (
                name ILIKE '%Test%' OR 
                name ILIKE '%E2E%' OR 
                name ILIKE '%Mock%' OR
                name = 'Updated Name' OR
                email ILIKE '%@example.com' OR
                email ILIKE '%@rbac.test' OR
                email ILIKE '%@e2e.test' OR
                email ILIKE '%@theatrex.com' OR -- ALL theatrex.com emails are considered mock/development labels
                (email LIKE '%\\_%@%' ESCAPE '\\') -- Matches numeric patterns or odd underscores
            )
            AND email NOT IN (SELECT unnest($1::text[]))
            AND email NOT ILIKE '%@iit.ac.lk' -- Protect all university accounts
            AND clerk_id IS NULL -- Protect anyone who has actually logged in with Clerk
        `, [PROTECTED_EMAILS]);

        console.log(`🔍 Found ${doomedUsers.length} test users to remove.`);

        if (doomedUsers.length === 0) {
            console.log('✅ No test users found to purge.');
            await client.query('COMMIT');
            return;
        }

        const doomedIds = doomedUsers.map(u => u.id);

        // 2. Cascade cleanup (Delete associated test data first)
        // Note: In some schemas, these might already be cascade deleted, but we'll be thorough.
        
        // Surgeries
        const { rowCount: surgeriesRemoved } = await client.query(`
            DELETE FROM surgeries 
            WHERE patient_name ILIKE '%Test%' 
               OR patient_name ILIKE '%E2E%'
               OR theatre_id IN (SELECT id FROM theatres WHERE name ILIKE '%Test%' OR name ILIKE '%E2E%')
        `);
        console.log(`🗑️  Surgeries removed: ${surgeriesRemoved}`);

        // Surgeons/Nurses/Staff (if they are test data)
        await client.query("DELETE FROM surgeons WHERE name ILIKE '%Test%' OR name ILIKE '%E2E%'").catch(() => {});
        await client.query("DELETE FROM nurses WHERE name ILIKE '%Test%' OR name ILIKE '%E2E%'").catch(() => {});
        await client.query("DELETE FROM anaesthetists WHERE name ILIKE '%Test%' OR name ILIKE '%E2E%'").catch(() => {});
        await client.query("DELETE FROM technicians WHERE name ILIKE '%Test%' OR name ILIKE '%E2E%'").catch(() => {});
        
        // Patients
        await client.query("DELETE FROM patients WHERE name ILIKE '%Test%' OR name ILIKE '%E2E%'").catch(() => {});

        // 3. Delete the users themselves
        const { rowCount: usersRemoved } = await client.query(`
            DELETE FROM users 
            WHERE id = ANY($1::int[])
        `, [doomedIds]);

        console.log(`✅ Users permanently purged: ${usersRemoved}\n`);

        await client.query('COMMIT');

        // Verify remaining
        const { rows: remaining } = await client.query('SELECT COUNT(*) FROM users');
        console.log(`📊 Final User Count: ${remaining[0].count}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Purge failed! Transaction rolled back.');
        console.error('Error:', error.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

hardPurge();
