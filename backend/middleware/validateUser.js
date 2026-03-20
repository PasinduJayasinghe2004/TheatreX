import { sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Validate email format using regex
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
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
        return sendError(res, 'Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, { message: errors });
    }

    // Trim and sanitize input before passing to controller
    req.body.name = name.trim();
    req.body.email = email.toLowerCase().trim();

    next();
};

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
        return sendError(res, 'Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, { message: errors });
    }

    // Normalize email before passing to controller
    req.body.email = email.toLowerCase().trim();

    next();
};

export { isValidEmail, validatePassword };
