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

        // Query 5: Average surgery duration (minutes)
        const avgDurationQuery = `
            SELECT COALESCE(ROUND(AVG(duration_minutes))::int, 0) AS avg_duration
            FROM surgeries
            WHERE duration_minutes IS NOT NULL
        `;

        // Execute all queries in parallel
        const [
            totalResult,
            upcomingResult,
            statusResult,
            theatreResult,
            avgDurationResult
        ] = await Promise.all([
            pool.query(totalSurgeriesQuery),
            pool.query(upcomingSurgeriesQuery),
            pool.query(surgeriesByStatusQuery),
            pool.query(theatreStatusQuery),
            pool.query(avgDurationQuery)
        ]);

        // Process results
        const totalSurgeries = parseInt(totalResult.rows[0]?.total || 0);
        const upcomingSurgeries = parseInt(upcomingResult.rows[0]?.upcoming || 0);
        const avgDuration = parseInt(avgDurationResult.rows[0]?.avg_duration || 0);

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
                avgDuration,
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

// ============================================================================
// GET DASHBOARD SUMMARY (Coordinator Overview)
// ============================================================================
// @desc    Get a high-level summary for the coordinator dashboard
// @route   GET /api/dashboard/summary
// @access  Protected
// Created by: M5 (Inthusha) - Day 12
// ============================================================================
export const getDashboardSummary = async (req, res) => {
    try {
        // 1. Theatre status counts
        const theatreStatusQuery = `
            SELECT status, COUNT(*) as count
            FROM theatres
            WHERE is_active = TRUE
            GROUP BY status
        `;

        // 2. Overdue surgeries count
        // Overdue = in_progress AND (scheduled_time + duration < NOW)
        const overdueQuery = `
            SELECT COUNT(*) as count
            FROM surgeries
            WHERE status = 'in_progress'
            AND (scheduled_date + scheduled_time + (duration_minutes || ' minutes')::interval) < CURRENT_TIMESTAMP
        `;

        // 3. Today's total surgeries
        const todaySurgeriesQuery = `
            SELECT COUNT(*) as count
            FROM surgeries
            WHERE scheduled_date = CURRENT_DATE
        `;

        // 4. Staff on duty counts (simplified)
        const staffOnDutyQuery = `
            SELECT 
                (SELECT COUNT(*) FROM surgeons WHERE is_active = TRUE) as surgeons,
                (SELECT COUNT(*) FROM nurses WHERE is_active = TRUE) as nurses,
                (SELECT COUNT(*) FROM anaesthetists WHERE is_active = TRUE) as anaesthetists,
                (SELECT COUNT(*) FROM technicians WHERE is_active = TRUE) as technicians
        `;

        const [theatreResult, overdueResult, todayResult, staffResult] = await Promise.all([
            pool.query(theatreStatusQuery),
            pool.query(overdueQuery),
            pool.query(todaySurgeriesQuery),
            pool.query(staffOnDutyQuery)
        ]);

        // Process theatre counts
        const theatreStatus = {
            total: 0,
            available: 0,
            in_use: 0,
            maintenance: 0,
            cleaning: 0
        };

        theatreResult.rows.forEach(row => {
            const count = parseInt(row.count);
            theatreStatus[row.status] = count;
            theatreStatus.total += count;
        });

        // Calculate utilization
        const utilization_rate = theatreStatus.total > 0
            ? parseFloat(((theatreStatus.in_use / theatreStatus.total) * 100).toFixed(1))
            : 0;

        res.status(200).json({
            success: true,
            data: {
                theatre_summary: {
                    ...theatreStatus,
                    utilization_rate,
                    overdue_count: parseInt(overdueResult.rows[0]?.count || 0)
                },
                today_stats: {
                    total_surgeries: parseInt(todayResult.rows[0]?.count || 0),
                    staff_on_duty: {
                        surgeons: parseInt(staffResult.rows[0]?.surgeons || 0),
                        nurses: parseInt(staffResult.rows[0]?.nurses || 0),
                        anaesthetists: parseInt(staffResult.rows[0]?.anaesthetists || 0),
                        technicians: parseInt(staffResult.rows[0]?.technicians || 0),
                        total: Object.values(staffResult.rows[0] || {}).reduce((a, b) => parseInt(a) + parseInt(b), 0)
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard summary',
            error: error.message
        });
    }
};
