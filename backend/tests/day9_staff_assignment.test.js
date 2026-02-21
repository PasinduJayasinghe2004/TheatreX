import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';
import jwt from 'jsonwebtoken';

describe('Day 9 - Staff Assignment & Conflict Detection', () => {
    let token;
    let surgeonId, nurseId, anaesthetistId, theatreId;
    let surgeryId;

    // Helper to create a token
    const generateToken = (id, role) => {
        return jwt.sign({ id, role }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    };

    beforeAll(async () => {
        console.log('Starting beforeAll hook...');
        try {
            // 1. Create Test Users (Surgeon, Nurse, Anaesthetist)
            // Clean up first
            await pool.query("DELETE FROM users WHERE email IN ('testsurgeon@example.com', 'testnurse@example.com', 'testanaes@example.com')");
            console.log('Cleaned up old users');

            const surgeonRes = await pool.query(`
                INSERT INTO users (name, email, password, role, is_active)
                VALUES ('Test Surgeon', 'testsurgeon@example.com', 'hashedpass', 'surgeon', true)
                RETURNING id
            `);
            surgeonId = surgeonRes.rows[0].id;

            const nurseRes = await pool.query(`
                INSERT INTO users (name, email, password, role, is_active)
                VALUES ('Test Nurse', 'testnurse@example.com', 'hashedpass', 'nurse', true)
                RETURNING id
            `);
            nurseId = nurseRes.rows[0].id;

            const anaesRes = await pool.query(`
                INSERT INTO users (name, email, password, role, is_active)
                VALUES ('Test Anaesthetist', 'testanaes@example.com', 'hashedpass', 'anaesthetist', true)
                RETURNING id
            `);
            anaesthetistId = anaesRes.rows[0].id;
            console.log('Created test users');

            // 2. Get a Theatre
            const theatreRes = await pool.query("SELECT id FROM theatres LIMIT 1");
            if (theatreRes.rows.length === 0) {
                // Create dummy theatre if none
                const newTheatre = await pool.query(`
                    INSERT INTO theatres (name, location, capacity, type)
                    VALUES ('Test Theatre', 'Block A', 1, 'General')
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
                await pool.query('DELETE FROM surgeries WHERE id = $1', [surgeryId]);
            }
            await pool.query('DELETE FROM users WHERE id IN ($1, $2, $3)', [surgeonId, nurseId, anaesthetistId]);
            await pool.end();
            console.log('Cleanup finished');
        } catch (err) {
            console.error('Error in afterAll:', err);
        }
    }, 60000);

    test('Should detect nurse availability correctly', async () => {
        console.log('Running nurse availability test...');
        // 1. Verify nurse is available initially
        const date = '2026-06-01';
        const time = '10:00';
        const duration = 60;

        const res1 = await request(app)
            .get('/api/surgeries/nurses/available')
            .query({ date, time, duration })
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
                surgeon_id: surgeonId,
                nurse_id: nurseId,
                anaesthetist_id: anaesthetistId,
                theatre_id: theatreId,
                scheduled_date: date,
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
            .query({ date, time, duration })
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
        const date = '2026-06-01';
        const time = '10:00';
        const duration = 60;

        // Verify anaesthetist is UNAVAILABLE because of the surgery scheduled in previous test
        const res = await request(app)
            .get('/api/surgeries/anaesthetists/available')
            .query({ date, time, duration })
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        const busyAnaes = res.body.data.find(a => a.id === anaesthetistId);
        expect(busyAnaes).toBeDefined();
        expect(busyAnaes.available).toBe(false);
        expect(busyAnaes.conflict_reason).toMatch(/conflict/i);
    }, 60000);

    test('checkConflicts endpoint should detect all conflicts', async () => {
        console.log('Running conflict detection test...');
        const date = '2026-06-01';
        const time = '10:00'; // Same time as existing surgery
        const duration = 60;

        const res = await request(app)
            .post('/api/surgeries/check-conflicts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                scheduled_date: date,
                scheduled_time: time,
                duration_minutes: duration,
                theatre_id: theatreId,
                surgeon_id: surgeonId,
                nurse_id: nurseId,
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
