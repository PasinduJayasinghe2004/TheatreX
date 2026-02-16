// ============================================================================
// Dashboard Controller
// ============================================================================
// Created by: M4 (Oneli) - Day 7
// 
// Handles dashboard statistics and analytics requests.
// Provides aggregated data for the dashboard view.
//
// EXPORTS:
// - getDashboardStats: GET /api/dashboard/stats - Get dashboard statistics
// ============================================================================

import { pool } from '../config/database.js';

// ============================================================================
// GET DASHBOARD STATISTICS
// ============================================================================
// @desc    Get dashboard statistics including surgery counts and theatre status
// @route   GET /api/dashboard/stats
// @access  Protected
// Created by: M4 (Oneli) - Day 7
// ============================================================================
export const getDashboardStats = async (req, res) => {
    try {
        // Query 1: Total surgeries count
        const totalSurgeriesQuery = `
            SELECT COUNT(*) as total
            FROM surgeries
        `;

        // Query 2: Upcoming surgeries (today or future, not completed/cancelled)
        const upcomingSurgeriesQuery = `
            SELECT COUNT(*) as upcoming
            FROM surgeries
            WHERE scheduled_date >= CURRENT_DATE
            AND status IN ('scheduled', 'in_progress')
        `;

        // Query 3: Surgeries grouped by status
        const surgeriesByStatusQuery = `
            SELECT 
                status,
                COUNT(*) as count
            FROM surgeries
            GROUP BY status
        `;

        // Query 4: Theatre status summary
        const theatreStatusQuery = `
            SELECT 
                status,
                COUNT(*) as count
            FROM theatres
            WHERE is_active = true
            GROUP BY status
        `;

        // Execute all queries in parallel
        const [
            totalResult,
            upcomingResult,
            statusResult,
            theatreResult
        ] = await Promise.all([
            pool.query(totalSurgeriesQuery),
            pool.query(upcomingSurgeriesQuery),
            pool.query(surgeriesByStatusQuery),
            pool.query(theatreStatusQuery)
        ]);

        // Process results
        const totalSurgeries = parseInt(totalResult.rows[0]?.total || 0);
        const upcomingSurgeries = parseInt(upcomingResult.rows[0]?.upcoming || 0);

        // Convert surgeries by status array to object
        const surgeriesByStatus = {
            scheduled: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0
        };

        statusResult.rows.forEach(row => {
            surgeriesByStatus[row.status] = parseInt(row.count);
        });

        // Convert theatre status array to object
        const theatreStatusSummary = {
            available: 0,
            in_use: 0,
            maintenance: 0,
            cleaning: 0
        };

        theatreResult.rows.forEach(row => {
            theatreStatusSummary[row.status] = parseInt(row.count);
        });

        // Calculate total active theatres
        const totalTheatres = Object.values(theatreStatusSummary).reduce((sum, count) => sum + count, 0);

        // Send response
        res.status(200).json({
            success: true,
            data: {
                totalSurgeries,
                upcomingSurgeries,
                surgeriesByStatus,
                theatreStatusSummary,
                totalTheatres
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};
