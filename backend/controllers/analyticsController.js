// ============================================================================
// Analytics Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
// Updated by: M2 (Chandeepa) - Day 18
// Updated by: M3 (Janani) - Day 18 (Patient demographics API)
//
// Handles analytics and statistics endpoints.
// Provides aggregated data for the analytics dashboard.
//
// EXPORTS:
// - getPatientDemographics: GET /api/analytics/patient-demographics
// - getStaffCountsByRole: GET /api/analytics/staff-counts
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

// ============================================================================
// GET PATIENT DEMOGRAPHICS
// ============================================================================
// @desc    Get patient demographic breakdown (gender, blood type, age groups)
// @route   GET /api/analytics/patient-demographics
// @access  Protected
// Created by: M3 (Janani) - Day 18
// ============================================================================
export const getPatientDemographics = async (req, res) => {
    try {
        // Gender distribution
        const genderQuery = `
            SELECT
                gender,
                COUNT(*)::int AS count
            FROM patients
            WHERE is_active = true
            GROUP BY gender
            ORDER BY count DESC
        `;

        // Blood type distribution
        const bloodTypeQuery = `
            SELECT
                COALESCE(blood_type, 'Unknown') AS blood_type,
                COUNT(*)::int AS count
            FROM patients
            WHERE is_active = true
            GROUP BY blood_type
            ORDER BY count DESC
        `;

        // Age group distribution
        const ageGroupQuery = `
            SELECT
                CASE
                    WHEN age IS NULL THEN 'Unknown'
                    WHEN age < 18 THEN '0-17'
                    WHEN age BETWEEN 18 AND 30 THEN '18-30'
                    WHEN age BETWEEN 31 AND 45 THEN '31-45'
                    WHEN age BETWEEN 46 AND 60 THEN '46-60'
                    ELSE '60+'
                END AS age_group,
                COUNT(*)::int AS count
            FROM patients
            WHERE is_active = true
            GROUP BY age_group
            ORDER BY
                CASE age_group
                    WHEN '0-17' THEN 1
                    WHEN '18-30' THEN 2
                    WHEN '31-45' THEN 3
                    WHEN '46-60' THEN 4
                    WHEN '60+' THEN 5
                    ELSE 6
                END
        `;

        // Total active patients
        const totalQuery = `
            SELECT COUNT(*)::int AS total
            FROM patients
            WHERE is_active = true
        `;

        const [genderResult, bloodTypeResult, ageGroupResult, totalResult] = await Promise.all([
            pool.query(genderQuery),
            pool.query(bloodTypeQuery),
            pool.query(ageGroupQuery),
            pool.query(totalQuery)
        ]);

        const total = totalResult.rows[0]?.total || 0;

        res.status(200).json({
            success: true,
            data: {
                total,
                gender: genderResult.rows.map(row => ({
                    gender: row.gender,
                    count: row.count,
                    percentage: total > 0 ? parseFloat(((row.count / total) * 100).toFixed(1)) : 0
                })),
                bloodType: bloodTypeResult.rows.map(row => ({
                    bloodType: row.blood_type,
                    count: row.count,
                    percentage: total > 0 ? parseFloat(((row.count / total) * 100).toFixed(1)) : 0
                })),
                ageGroups: ageGroupResult.rows.map(row => ({
                    ageGroup: row.age_group,
                    count: row.count,
                    percentage: total > 0 ? parseFloat(((row.count / total) * 100).toFixed(1)) : 0
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching patient demographics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient demographics',
            error: error.message
        });
    }
};

// ============================================================================
// GET STAFF COUNTS BY ROLE
// ============================================================================
// @desc    Get count of staff members grouped by role
// @route   GET /api/analytics/staff-counts
// @access  Protected
// Created by: M4 (Oneli) - Day 18
// ============================================================================
export const getStaffCountsByRole = async (req, res) => {
    try {
        const surgeonsQuery = 'SELECT COUNT(*)::int AS count FROM surgeons WHERE is_active = true';
        const nursesQuery = 'SELECT COUNT(*)::int AS count FROM nurses WHERE is_active = true';
        const anaesthetistsQuery = 'SELECT COUNT(*)::int AS count FROM anaesthetists WHERE is_active = true';
        const techniciansQuery = 'SELECT COUNT(*)::int AS count FROM technicians WHERE is_active = true';

        const [surgeonsResult, nursesResult, anaesthetistsResult, techniciansResult] = await Promise.all([
            pool.query(surgeonsQuery),
            pool.query(nursesQuery),
            pool.query(anaesthetistsQuery),
            pool.query(techniciansQuery)
        ]);

        const counts = {
            surgeons: surgeonsResult.rows[0].count,
            nurses: nursesResult.rows[0].count,
            anaesthetists: anaesthetistsResult.rows[0].count,
            technicians: techniciansResult.rows[0].count
        };

        const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

        res.status(200).json({
            success: true,
            data: {
                counts,
                total,
                breakdown: [
                    { role: 'Surgeons', count: counts.surgeons, color: '#3b82f6' },
                    { role: 'Nurses', count: counts.nurses, color: '#10b981' },
                    { role: 'Anaesthetists', count: counts.anaesthetists, color: '#f59e0b' },
                    { role: 'Technicians', count: counts.technicians, color: '#8b5cf6' }
                ]
            }
        });

    } catch (error) {
        console.error('Error fetching staff counts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching staff counts',
            error: error.message
        });
    }
};
