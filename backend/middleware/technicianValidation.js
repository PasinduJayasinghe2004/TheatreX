import { sendError } from '../utils/responseHelper.js';

/**
 * Validation for Technician creation and updates
 */
export const validateTechnician = (req, res, next) => {
    const { name, specialization, email, phone, shift_preference } = req.body;
    const errors = [];

    if (!name || name.trim() === '') errors.push('Name is required');
    if (!specialization || specialization.trim() === '') errors.push('Specialization is required');
    if (!email || email.trim() === '') errors.push('Email is required');

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }
    }

    if (shift_preference) {
        const validShifts = ['morning', 'afternoon', 'night', 'flexible'];
        if (!validShifts.includes(shift_preference.toLowerCase())) {
            errors.push('Invalid shift preference');
        }
    }

    if (errors.length > 0) {
        return sendError(res, 'Validation failed', 400, { message: errors.join(', ') });
    }

    next();
};
