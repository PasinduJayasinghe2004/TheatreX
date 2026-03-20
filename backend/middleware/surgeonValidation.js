import { sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ── Validate Create Surgeon body ─────────────────────────────────────────────
export const validateSurgeon = (req, res, next) => {
    const {
        name,
        specialization,
        license_number,
        phone,
        email,
        years_of_experience,
    } = req.body;

    const errors = [];

    // 1. Required fields
    if (!name || !name.toString().trim())
        errors.push('name is required');
    if (!specialization || !specialization.toString().trim())
        errors.push('specialization is required');
    if (!license_number || !license_number.toString().trim())
        errors.push('license_number is required');
    if (!phone || !phone.toString().trim())
        errors.push('phone is required');
    if (!email || !email.toString().trim())
        errors.push('email is required');

    // 2. Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push('email must be a valid email address');
    }

    // 3. years_of_experience (optional) – must be a non-negative integer if provided
    if (years_of_experience !== undefined && years_of_experience !== null && years_of_experience !== '') {
        const yoe = Number(years_of_experience);
        if (isNaN(yoe) || yoe < 0 || !Number.isInteger(yoe)) {
            errors.push('years_of_experience must be a non-negative integer');
        }
    }

    if (errors.length > 0) {
        return sendError(res, 'Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, { message: errors });
    }

    next();
};

// ── Validate Update Surgeon body (partial — all fields optional) ──────────────
// Created by: M1 (Pasindu) - Day 14
export const validateSurgeonUpdate = (req, res, next) => {
    const { email, years_of_experience } = req.body;

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

    if (errors.length > 0) {
        return sendError(res, 'Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, { message: errors });
    }

    next();
};
