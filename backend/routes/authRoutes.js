// ============================================================================
// Authentication Routes
// ============================================================================
// This file defines all authentication-related API routes
// Created by: M1 (Pasindu) - Day 3 (Register) & M4 (Oneli) - Day 3 (Login)
// Updated by: M3 - Day 3 (Validation Middleware)
// Updated by: M2 (Chandeepa) & M4 (Oneli) - Day 4 (Profile endpoints)
// Updated by: M5 (Inthusha) - Day 4 (Refresh token endpoint)
//
// ROUTES:
// - POST /api/auth/register - User registration (with validation)
// - POST /api/auth/login - User login (with validation)
// - POST /api/auth/refresh - Refresh access token
// - GET /api/auth/profile - Get user profile (protected)
// - PUT /api/auth/profile - Update user profile (protected)
// ============================================================================

import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    refreshTokenHandler,
    getSettings,
    updateSettings,
    getSettingsAuditHistory,
    changePassword,
    getActiveSessions,
    logoutOtherSessions,
    exportMyData,
    deactivateAccount,
    deleteAccount,
} from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validateUser.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

// Configure multer for profile image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_images/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
});

// Create a new router instance
const router = express.Router();

// ============================================================================
// ROUTE: POST /api/auth/register
// ============================================================================
// Handles user registration
// Middleware: validateRegister (validates name, email, password, role)
// Expects: { name, email, password, role }
// Returns: { success, message, user }
// ============================================================================
router.post('/register', validateRegister, register);

// ============================================================================
// ROUTE: POST /api/auth/login
// ============================================================================
// Handles user login
// Middleware: validateLogin (validates email, password)
// Expects: { email, password }
// Returns: { success, message, token, refreshToken, user }
// ============================================================================
router.post('/login', validateLogin, login);

// ============================================================================
// ROUTE: POST /api/auth/refresh
// ============================================================================
// Refreshes the access token using a valid refresh token
// Created by: M5 (Inthusha) - Day 4
// Expects: { refreshToken }
// Returns: { success, message, token }
// ============================================================================
router.post('/refresh', refreshTokenHandler);

// ============================================================================
// ROUTE: GET /api/auth/profile
// ============================================================================
// Get current user's profile
// Created by: M2 (Chandeepa) & M4 (Oneli) - Day 4
// Middleware: protect (requires valid JWT token)
// Returns: { success, user }
// ============================================================================
router.get('/profile', protect, getProfile);

// ============================================================================
// ROUTE: PUT /api/auth/profile
// ============================================================================
// Update current user's profile
// Created by: M4 (Oneli) - Day 4
// Middleware: protect (requires valid JWT token)
// Expects: { name?, phone?, password? }
// Returns: { success, message, user }
// ============================================================================
router.put('/profile', protect, updateProfile);

router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);
router.get('/settings/history', protect, getSettingsAuditHistory);

router.post('/change-password', protect, changePassword);

router.get('/sessions', protect, getActiveSessions);
router.post('/sessions/logout-others', protect, logoutOtherSessions);

router.get('/export-data', protect, exportMyData);
router.post('/deactivate', protect, deactivateAccount);
router.delete('/account', protect, deleteAccount);

// ============================================================================
// ROUTE: POST /api/auth/profile-image
// ============================================================================
// Upload profile image
// Created by: AI - Profile Image Task
// Middleware: protect, multer
// Returns: { success, message, imageUrl }
// ============================================================================
router.post('/profile-image', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const imageUrl = `/uploads/profile_images/${req.file.filename}`;
    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: imageUrl
    });
});

// ============================================================================
// ROUTE: POST /api/auth/forgot-password
// ============================================================================
router.post('/forgot-password', forgotPassword);

// ============================================================================
// ROUTE: POST /api/auth/reset-password
// ============================================================================
router.post('/reset-password', resetPassword);

// Export the router to be used in server.js
export default router;

