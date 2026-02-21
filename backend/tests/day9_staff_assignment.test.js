import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';
import jwt from 'jsonwebtoken';

describe('Day 9 - Staff Assignment & Conflict Detection', () => {
    let token;
    let surgeonId, nurseId, anaesthetistId, theatreId;
    let surgeryId;
    let testDate; // Shared test date

    // Helper to create a token
    const generateToken = (id, role) => {
        return jwt.sign({ id, role }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    };

    beforeAll(async () => {
        console.log('Starting beforeAll hook...');
        try {
            // 1. Create Test Staff in their respective tables (not users table)
            // Clean up first
            await pool.query("DELETE FROM surgeons WHERE email = 'testsurgeon@example.com'");
            await pool.query("DELETE FROM nurses WHERE email = 'testnurse@example.com'");
            await pool.query("DELETE FROM anaesthetists WHERE email = 'testanaes@example.com'");
            console.log('Cleaned up old staff');

            const surgeonRes = await pool.query(`
                INSERT INTO surgeons (name, email, phone, specialization, license_number, is_active)
                VALUES ('Test Surgeon', 'testsurgeon@example.com', '1234567890', 'General', 'LIC-SURG-001', true)
                RETURNING id
            `);
            surgeonId = surgeonRes.rows[0].id;

            const nurseRes = await pool.query(`
                INSERT INTO nurses (name, email, phone, specialization, is_active)
                VALUES ('Test Nurse', 'testnurse@example.com', '1234567891', 'General', true)
                RETURNING id
            `);
            nurseId = nurseRes.rows[0].id;

            const anaesRes = await pool.query(`
                INSERT INTO anaesthetists (name, email, phone, specialization, is_active)
                VALUES ('Test Anaesthetist', 'testanaes@example.com', '1234567892', 'General', true)
                RETURNING id
            `);
            anaesthetistId = anaesRes.rows[0].id;
            console.log('Created test staff');

            // 2. Get a Theatre
            const theatreRes = await pool.query("SELECT id FROM theatres LIMIT 1");
            if (theatreRes.rows.length === 0) {
                // Create dummy theatre if none
                const newTheatre = await pool.query(`
                    INSERT INTO theatres (name, location, capacity, theatre_type)
                    VALUES ('Test Theatre', 'Block A', 1, 'general')
                    RETURNING id
                `);
                theatreId = newTheatre.rows[0].id;
            } else {
                theatreId = theatreRes.rows[0].id;
            }
            console.log('Got theatre ID:', theatreId);

            // Generate Admin Token
            token = generateToken(1, 'admin');
            console.log('Generated token');
        } catch (err) {
            console.error('Error in beforeAll:', err);
            throw err;
        }
    }, 60000);

    afterAll(async () => {
        console.log('Starting afterAll hook...');
        try {
            // Cleanup
            if (surgeryId) {
                await pool.query('DELETE FROM surgery_nurses WHERE surgery_id = $1', [surgeryId]);
                await pool.query('DELETE FROM surgeries WHERE id = $1', [surgeryId]);
            }
            await pool.query('DELETE FROM surgeons WHERE id = $1', [surgeonId]);
            await pool.query('DELETE FROM nurses WHERE id = $1', [nurseId]);
            await pool.query('DELETE FROM anaesthetists WHERE id = $1', [anaesthetistId]);
            await pool.end();
            console.log('Cleanup finished');
        } catch (err) {
            console.error('Error in afterAll:', err);
        }
    }, 60000);

    test('Should detect nurse availability correctly', async () => {
        console.log('Running nurse availability test...');
        // 1. Verify nurse is available initially
        // Use tomorrow's date to ensure it's in the future
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        testDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD - store for other tests
        const time = '10:00';
        const duration = 60;

        const res1 = await request(app)
            .get('/api/surgeries/nurses/available')
            .query({ date: testDate, time, duration })
            .set('Authorization', `Bearer ${token}`);

        expect(res1.statusCode).toBe(200);
        const nurse = res1.body.data.find(n => n.id === nurseId);
        expect(nurse).toBeDefined();
        expect(nurse.available).toBe(true);

        // 2. Schedule a surgery for this nurse
        const scheduleRes = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${token}`)
            .send({
                surgery_type: 'Test Surgery',
                patient_name: 'Test Patient',
                patient_age: 35,
                patient_gender: 'male',
                surgeon_id: surgeonId,
                nurse_ids: [nurseId],  // Array of nurse IDs (M2 Day 9)
                anaesthetist_id: anaesthetistId,
                theatre_id: theatreId,
                scheduled_date: testDate,
                scheduled_time: time,
                duration_minutes: duration,
                status: 'scheduled',
                priority: 'routine'
            });

        expect(scheduleRes.statusCode).toBe(201);
        surgeryId = scheduleRes.body.data.id;

        // 3. Verify nurse is now UNAVAILABLE for overlapping time
        const res2 = await request(app)
            .get('/api/surgeries/nurses/available')
            .query({ date: testDate, time, duration })
            .set('Authorization', `Bearer ${token}`);

        expect(res2.statusCode).toBe(200);
        const busyNurse = res2.body.data.find(n => n.id === nurseId);
        expect(busyNurse).toBeDefined();
        expect(busyNurse.available).toBe(false);
        expect(busyNurse.conflict_reason).toMatch(/conflict/i);
    }, 60000);

    test('Should detect anaesthetist availability correctly', async () => {
        console.log('Running anaesthetist availability test...');
        // Using same date/time as above where api/surgeries was just called
        const time = '10:00';
        const duration = 60;

        // Verify anaesthetist is UNAVAILABLE because of the surgery scheduled in previous test
        const res = await request(app)
            .get('/api/surgeries/anaesthetists/available')
            .query({ date: testDate, time, duration })
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        const busyAnaes = res.body.data.find(a => a.id === anaesthetistId);
        expect(busyAnaes).toBeDefined();
        expect(busyAnaes.available).toBe(false);
        expect(busyAnaes.conflict_reason).toMatch(/conflict/i);
    }, 60000);

    test('checkConflicts endpoint should detect all conflicts', async () => {
        console.log('Running conflict detection test...');
        const time = '10:00'; // Same time as existing surgery
        const duration = 60;

        const res = await request(app)
            .post('/api/surgeries/check-conflicts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                scheduled_date: testDate,
                scheduled_time: time,
                duration_minutes: duration,
                theatre_id: theatreId,
                surgeon_id: surgeonId,
                nurse_ids: [nurseId],  // Array of nurse IDs
                anaesthetist_id: anaesthetistId
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.has_conflicts).toBe(true);
        expect(res.body.conflict_count).toBeGreaterThanOrEqual(3);

        const types = res.body.conflicts.map(c => c.type);
        expect(types).toContain('surgeon');
        expect(types).toContain('nurse');
        expect(types).toContain('anaesthetist');
    }, 60000);
});
