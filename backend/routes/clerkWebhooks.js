import express from 'express';
import { Webhook } from 'svix';
import { pool } from '../config/database.js';

const router = express.Router();

// Clerk Webhook Secret from dashboard
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const payload = req.body;
        const headers = req.headers;

        // Verify webhook signature
        const wh = new Webhook(CLERK_WEBHOOK_SECRET);
        let evt;
        try {
            evt = wh.verify(payload, headers);
        } catch (err) {
            console.error('Webhook verification failed:', err.message);
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const { id, ...attributes } = evt.data;
        const eventType = evt.type;

        if (eventType === 'user.created' || eventType === 'user.updated') {
            const email = attributes.email_addresses[0].email_address;
            const firstName = attributes.first_name;
            const lastName = attributes.last_name;
            const name = `${firstName} ${lastName}`;

            // Upsert user into local DB
            await pool.query(
                `INSERT INTO users (clerk_id, email, name, role, is_active) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE 
         SET clerk_id = $1, name = $3`,
                [id, email, name, attributes.public_metadata?.role || 'staff', true]
            );

            console.log(`✅ User ${id} synced to local DB`);
        }

        if (eventType === 'user.deleted') {
            await pool.query('UPDATE users SET is_active = false WHERE clerk_id = $1', [id]);
            console.log(`❌ User ${id} deactivated in local DB`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Webhook processing error:', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

export default router;
