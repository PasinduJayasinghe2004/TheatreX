// ============================================================================
// User Validation Middleware
// ============================================================================
// Reusable validation middleware for authentication routes
// Created by: M3 - Day 3 (User Validation Middleware)
//
// MIDDLEWARE:
// - validateRegister - Validates registration input
// - validateLogin - Validates login input
// ============================================================================

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid, message }
 */
const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    return { isValid: true, message: '' };
};

// ============================================================================
// MIDDLEWARE: Validate Registration Input
// ============================================================================
// Validates: name, email, password, role
// Returns 400 error if validation fails
// ============================================================================
export const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];

    // Validate name
    if (!name || name.trim().length === 0) {
        errors.push('Name is required');
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Validate email
    if (!email) {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Invalid email format');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        errors.push(passwordValidation.message);
    }

    // Validate role
    const allowedRoles = ['coordinator', 'admin', 'surgeon', 'nurse', 'anaesthetist', 'technician'];
    if (!role) {
        errors.push('Role is required');
    } else if (!allowedRoles.includes(role)) {
        errors.push(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Trim and sanitize input before passing to controller
    req.body.name = name.trim();
    req.body.email = email.toLowerCase().trim();

    next();
};

// ============================================================================
// MIDDLEWARE: Validate Login Input
// ============================================================================
// Validates: email, password
// Returns 400 error if validation fails
// ============================================================================
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Validate email
    if (!email) {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Invalid email format');
    }

    // Validate password
    if (!password) {
        errors.push('Password is required');
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Normalize email before passing to controller
    req.body.email = email.toLowerCase().trim();

    next();
};

// Export helper functions for reuse
export { isValidEmail, validatePassword };
