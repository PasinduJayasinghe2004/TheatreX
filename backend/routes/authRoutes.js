// ============================================================================
// Authentication Routes
// ============================================================================
// This file defines all authentication-related API routes
// Created by: M1 (Pasindu) - Day 3
//
// ROUTES:
// - POST /api/auth/register - User registration
// - POST /api/auth/login - User login (Day 4)
// ============================================================================

import express from 'express';
import { register, login } from '../controllers/authController.js';

// Create a new router instance
const router = express.Router();

// ============================================================================
// ROUTE: POST /api/auth/register
// ============================================================================
// Handles user registration
// Expects: { name, email, password, role }
// Returns: { success, message, user }
// ============================================================================
router.post('/register', register);

// ============================================================================
// ROUTE: POST /api/auth/login
// ============================================================================
// Handles user login (Day 4 implementation)
// Expects: { email, password }
// Returns: { success, message, token, user }
// ============================================================================
router.post('/login', login);

// Export the router to be used in server.js
export default router;
