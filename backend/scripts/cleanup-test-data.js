/**
 * ============================================================
 * TheatreX - Test Data Cleanup Script
 * ============================================================
 * Removes all E2E / test data from every table in the database.
 * 
 * Test data is identified by these name patterns:
 *   - Starts with 'E2E'
 *   - Starts with 'Test'
 *   - Named exactly 'Updated Name' or 'E2E Updated Name'
 *
 * Tables cleaned:
 *   - surgeons
 *   - nurses
 *   - anaesthetists
 *   - technicians
 *   - patients
 *   - theatres
 *   - users (test accounts)
 *   - surgeries (test surgeries linked to test data)
 *
 * Usage: node scripts/cleanup-test-data.js
 * ============================================================
 */

import { pool } from '../config/database.js';

const TEST_NAME_PATTERN_1 = 'E2E%';
const TEST_NAME_PATTERN_2 = 'Test%';
const TEST_EMAIL_PATTERN = '%@e2e%';
const TEST_EMAIL_PATTERN2 = '%test%@%';

async function cleanupTestData() {
    console.log('🧹 Starting TheatreX test data cleanup...\n');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // ─── 1. SURGEONS ─────────────────────────────────────────────────────
        const surgeons = await client.query(`
            DELETE FROM surgeons
            WHERE name ILIKE $1 OR name ILIKE $2 OR email ILIKE $3
            RETURNING id, name, email
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2, TEST_EMAIL_PATTERN]);
        console.log(`✅ Surgeons removed: ${surgeons.rowCount}`);
        if (surgeons.rows.length > 0) {
            surgeons.rows.forEach(r => console.log(`   - [${r.id}] ${r.name} (${r.email})`));
        }

        // ─── 2. NURSES ───────────────────────────────────────────────────────
        const nurses = await client.query(`
            DELETE FROM nurses
            WHERE name ILIKE $1 OR name ILIKE $2 OR email ILIKE $3
            RETURNING id, name, email
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2, TEST_EMAIL_PATTERN]);
        console.log(`\n✅ Nurses removed: ${nurses.rowCount}`);
        if (nurses.rows.length > 0) {
            nurses.rows.forEach(r => console.log(`   - [${r.id}] ${r.name} (${r.email})`));
        }

        // ─── 3. ANAESTHETISTS ─────────────────────────────────────────────────
        const anaesthetists = await client.query(`
            DELETE FROM anaesthetists
            WHERE name ILIKE $1 OR name ILIKE $2 OR email ILIKE $3
            RETURNING id, name, email
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2, TEST_EMAIL_PATTERN]);
        console.log(`\n✅ Anaesthetists removed: ${anaesthetists.rowCount}`);
        if (anaesthetists.rows.length > 0) {
            anaesthetists.rows.forEach(r => console.log(`   - [${r.id}] ${r.name} (${r.email})`));
        }

        // ─── 4. TECHNICIANS ───────────────────────────────────────────────────
        const technicians = await client.query(`
            DELETE FROM technicians
            WHERE name ILIKE $1 OR name ILIKE $2 OR email ILIKE $3
            RETURNING id, name, email
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2, TEST_EMAIL_PATTERN]);
        console.log(`\n✅ Technicians removed: ${technicians.rowCount}`);
        if (technicians.rows.length > 0) {
            technicians.rows.forEach(r => console.log(`   - [${r.id}] ${r.name} (${r.email})`));
        }

        // ─── 5. PATIENTS ──────────────────────────────────────────────────────
        const patients = await client.query(`
            DELETE FROM patients
            WHERE name ILIKE $1 OR name ILIKE $2
            RETURNING id, name
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2]);
        console.log(`\n✅ Patients removed: ${patients.rowCount}`);
        if (patients.rows.length > 0) {
            patients.rows.forEach(r => console.log(`   - [${r.id}] ${r.name}`));
        }

        // ─── 6. THEATRES ──────────────────────────────────────────────────────
        const theatres = await client.query(`
            DELETE FROM theatres
            WHERE name ILIKE $1 OR name ILIKE $2
            RETURNING id, name
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2]);
        console.log(`\n✅ Theatres removed: ${theatres.rowCount}`);
        if (theatres.rows.length > 0) {
            theatres.rows.forEach(r => console.log(`   - [${r.id}] ${r.name}`));
        }

        // ─── 7. USERS (test accounts) ─────────────────────────────────────────
        // First delete related sessions & settings to avoid FK violations
        const testUsers = await client.query(`
            SELECT id FROM users
            WHERE name ILIKE $1 OR name ILIKE $2 OR email ILIKE $3
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2, TEST_EMAIL_PATTERN]);

        if (testUsers.rows.length > 0) {
            const testUserIds = testUsers.rows.map(r => r.id);
            const idList = testUserIds.join(',');
            await client.query(`DELETE FROM auth_sessions WHERE user_id = ANY(ARRAY[${idList}]::int[])`).catch(() => { });
            await client.query(`DELETE FROM user_settings WHERE user_id = ANY(ARRAY[${idList}]::int[])`).catch(() => { });
            await client.query(`DELETE FROM user_settings_audit WHERE user_id = ANY(ARRAY[${idList}]::int[])`).catch(() => { });
        }

        const users = await client.query(`
            DELETE FROM users
            WHERE name ILIKE $1 OR name ILIKE $2 OR email ILIKE $3
            RETURNING id, name, email, role
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2, TEST_EMAIL_PATTERN]);
        console.log(`\n✅ Users removed: ${users.rowCount}`);
        if (users.rows.length > 0) {
            users.rows.forEach(r => console.log(`   - [${r.id}] ${r.name} (${r.role}) ${r.email}`));
        }

        // ─── 8. SURGERIES (orphaned test surgeries) ───────────────────────────
        const surgeries = await client.query(`
            DELETE FROM surgeries
            WHERE patient_name ILIKE $1 OR patient_name ILIKE $2
               OR surgery_type ILIKE $1 OR surgery_type ILIKE $2
            RETURNING id, patient_name, surgery_type
        `, [TEST_NAME_PATTERN_1, TEST_NAME_PATTERN_2]);
        console.log(`\n✅ Surgeries removed: ${surgeries.rowCount}`);
        if (surgeries.rows.length > 0) {
            surgeries.rows.forEach(r => console.log(`   - [${r.id}] ${r.surgery_type} for ${r.patient_name}`));
        }

        await client.query('COMMIT');

        console.log('\n✅ =============================================');
        console.log('   Cleanup completed successfully!');
        console.log('   Total records removed:');
        console.log(`   - Surgeons:      ${surgeons.rowCount}`);
        console.log(`   - Nurses:        ${nurses.rowCount}`);
        console.log(`   - Anaesthetists: ${anaesthetists.rowCount}`);
        console.log(`   - Technicians:   ${technicians.rowCount}`);
        console.log(`   - Patients:      ${patients.rowCount}`);
        console.log(`   - Theatres:      ${theatres.rowCount}`);
        console.log(`   - Users:         ${users.rowCount}`);
        console.log(`   - Surgeries:     ${surgeries.rowCount}`);
        console.log('✅ =============================================\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Cleanup failed! Transaction rolled back.');
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}

cleanupTestData();
