// ============================================================================
// Analytics Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
//
// Handles analytics and statistics endpoints.
// Provides aggregated data for the analytics dashboard.
//
// EXPORTS:
// - getSurgeriesPerDay: GET /api/analytics/surgeries-per-day
// ============================================================================

import { pool } from '../config/database.js';

// ============================================================================
// GET SURGERIES PER DAY (Last 7 Days)
// ============================================================================
// @desc    Get surgery count per day for the last 7 days
// @route   GET /api/analytics/surgeries-per-day
// @access  Protected
// Created by: M1 (Pasindu) - Day 18
// ============================================================================
export const getSurgeriesPerDay = async (req, res) => {
    try {
        // Generate a series of the last 7 days and LEFT JOIN with surgeries
        // This ensures days with 0 surgeries still appear in the result
        const query = `
            SELECT
                d.date::date AS date,
                TO_CHAR(d.date, 'Dy') AS day,
                COALESCE(COUNT(s.id), 0)::int AS count
            FROM generate_series(
                CURRENT_DATE - INTERVAL '6 days',
                CURRENT_DATE,
                '1 day'::interval
            ) AS d(date)
            LEFT JOIN surgeries s
                ON s.scheduled_date = d.date::date
            GROUP BY d.date
            ORDER BY d.date ASC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            data: result.rows.map(row => ({
                date: row.date,
                day: row.day,
                count: row.count
            }))
        });

    } catch (error) {
        console.error('Error fetching surgeries per day:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching surgeries per day statistics',
            error: error.message
        });
    }
};
