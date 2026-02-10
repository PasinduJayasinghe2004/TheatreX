// ============================================================================
// Authentication Routes
// ============================================================================
// This file defines all authentication-related API routes
// Created by: M1 (Pasindu) - Day 3 (Register) & M4 (Oneli) - Day 3 (Login)
// Updated by: M3 - Day 3 (Validation Middleware)
// Updated by: M2 (Chandeepa) & M4 (Oneli) - Day 4 (Profile endpoints)
//
// ROUTES:
// - POST /api/auth/register - User registration (with validation)
// - POST /api/auth/login - User login (with validation)
// - GET /api/auth/profile - Get user profile (protected)
// - PUT /api/auth/profile - Update user profile (protected)
// ============================================================================

import express from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validateUser.js';
import { protect } from '../middleware/authMiddleware.js';

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
// Returns: { success, message, token, user }
// ============================================================================
router.post('/login', validateLogin, login);

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
