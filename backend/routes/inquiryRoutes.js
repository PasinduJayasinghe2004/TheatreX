import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

/**
 * @route   POST /api/inquiries/demo-request
 * @desc    Submit a new demo request from the landing page
 * @access  Public
 */
router.post('/demo-request', async (req, res) => {
    try {
        const { name, email, organization, role, phone, message } = req.body;

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        const query = `
            INSERT INTO inquiries (name, email, organization, role, phone, message)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, email, created_at
        `;

        const { rows } = await pool.query(query, [
            name, email, organization, role, phone, message
        ]);

        console.log(`📬 New demo request from ${email}`);

        res.status(201).json({
            success: true,
            message: 'Demo request received successfully',
            data: rows[0]
        });

    } catch (error) {
        console.error('❌ Error submitting demo request:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default router;
