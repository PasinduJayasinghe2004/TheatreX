// ============================================================================
// Analytics Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
// Updated by: M2 (Chandeepa) - Day 18
//
// Handles analytics and statistics endpoints.
// Provides aggregated data for the analytics dashboard.
//
// EXPORTS:
// - getSurgeriesPerDay: GET /api/analytics/surgeries-per-day
// - getSurgeryStatusCounts: GET /api/analytics/surgery-status-counts
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

// ============================================================================
// GET SURGERY STATUS COUNTS
// ============================================================================
// @desc    Get count of surgeries grouped by status
// @route   GET /api/analytics/surgery-status-counts
// @access  Protected
// Created by: M2 (Chandeepa) - Day 18
// ============================================================================
export const getSurgeryStatusCounts = async (req, res) => {
    try {
        const query = `
            SELECT
                status,
                COUNT(*)::int AS count
            FROM surgeries
            GROUP BY status
            ORDER BY count DESC
        `;

        const result = await pool.query(query);

        // Build a complete status map with 0-defaults for missing statuses
        const statusDefaults = {
            scheduled: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0
        };

        for (const row of result.rows) {
            if (row.status in statusDefaults) {
                statusDefaults[row.status] = row.count;
            }
        }

        const total = Object.values(statusDefaults).reduce((sum, c) => sum + c, 0);

        res.status(200).json({
            success: true,
            data: {
                counts: statusDefaults,
                total,
                breakdown: Object.entries(statusDefaults).map(([status, count]) => ({
                    status,
                    count,
                    percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching surgery status counts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching surgery status counts',
            error: error.message
        });
    }
};
