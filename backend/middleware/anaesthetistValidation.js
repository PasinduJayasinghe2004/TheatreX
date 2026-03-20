import { sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ── Validate Create Anaesthetist body (all required fields) ───────────────
export const validateAnaesthetist = (req, res, next) => {
    const { name, email, specialization, license_number } = req.body;
    const errors = [];

    if (!name || !name.trim()) errors.push('name is required');
    if (!email || !email.trim()) {
        errors.push('email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) errors.push('email must be a valid email address');
    }
    if (!specialization || !specialization.trim()) errors.push('specialization is required');
    if (!license_number || !license_number.trim()) errors.push('license_number is required');

    if (errors.length > 0) {
        return sendError(res, 'Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, { message: errors });
    }

    next();
};

// ── Validate Update Anaesthetist body (partial — all fields optional) ─────
export const validateAnaesthetistUpdate = (req, res, next) => {
    const { email, years_of_experience, shift_preference } = req.body;

    const errors = [];

    // Email format (only if provided)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== undefined && email !== null && email !== '') {
        if (!emailRegex.test(email)) {
            errors.push('email must be a valid email address');
        }
    }

    // years_of_experience (only if provided)
    if (years_of_experience !== undefined && years_of_experience !== null && years_of_experience !== '') {
        const yoe = Number(years_of_experience);
        if (isNaN(yoe) || yoe < 0 || !Number.isInteger(yoe)) {
            errors.push('years_of_experience must be a non-negative integer');
        }
    }

    // shift_preference (only if provided)
    const validShifts = ['morning', 'afternoon', 'night', 'flexible'];
    if (shift_preference !== undefined && shift_preference !== null && shift_preference !== '') {
        if (!validShifts.includes(shift_preference)) {
            errors.push(`shift_preference must be one of: ${validShifts.join(', ')}`);
        }
    }

    if (errors.length > 0) {
        return sendError(res, 'Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, { message: errors });
    }

    next();
};
