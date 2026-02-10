// ============================================================================
// Test Routes for RBAC Verification
// ============================================================================
// Created by: M4 (Oneli) - Day 4
// 
// These routes are for testing RBAC functionality during development
// They can be removed or disabled in production
//
// ROUTES:
// - GET /api/test/admin-only - Requires admin role
// - GET /api/test/coordinator-only - Requires coordinator role
// - GET /api/test/staff - Requires surgeon, nurse, or anaesthetist role
// - GET /api/test/any-authenticated - Requires any authenticated user
// ============================================================================

import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/test/admin-only
// ============================================================================
// Test route that only admins can access
// Used to verify RBAC is working correctly
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ Admin access granted!',
        user: {
            id: req.user.id,
            name: req.user.name,
            role: req.user.role
        },
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// ROUTE: GET /api/test/coordinator-only
// ============================================================================
// Test route that only coordinators can access
router.get('/coordinator-only', protect, authorize('coordinator'), (req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ Coordinator access granted!',
        user: {
            id: req.user.id,
            name: req.user.name,
            role: req.user.role
        },
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// ROUTE: GET /api/test/staff
// ============================================================================
// Test route that staff members (surgeon, nurse, anaesthetist) can access
router.get('/staff', protect, authorize('surgeon', 'nurse', 'anaesthetist', 'technician'), (req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ Staff access granted!',
        user: {
            id: req.user.id,
            name: req.user.name,
            role: req.user.role
        },
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// ROUTE: GET /api/test/any-authenticated
// ============================================================================
// Test route that any authenticated user can access
// Only uses protect middleware, no role restriction
router.get('/any-authenticated', protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ Authentication verified!',
        user: {
            id: req.user.id,
            name: req.user.name,
            role: req.user.role,
            email: req.user.email
        },
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// ROUTE: GET /api/test/public
// ============================================================================
// Public test route (no authentication required)
router.get('/public', (req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ Public route - no authentication required',
        timestamp: new Date().toISOString()
    });
});

export default router;
