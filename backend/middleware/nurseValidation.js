// ============================================================================
// Nurse Validation Middleware
// ============================================================================
// Created by: M3 (Janani) - Day 13
//
// Validates incoming nurse data before the controller processes it.
// Ensures all required fields are present and correctly formatted.
// ============================================================================

// ── Validate Create Nurse body ───────────────────────────────────────────────
export const validateNurse = (req, res, next) => {
    const {
        name,
        specialization,
        license_number,
        phone,
        email,
        years_of_experience,
        shift_preference,
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

    // 4. shift_preference (optional) – must be one of the valid options
    const validShifts = ['morning', 'afternoon', 'night', 'flexible'];
    if (shift_preference && !validShifts.includes(shift_preference)) {
        errors.push(`shift_preference must be one of: ${validShifts.join(', ')}`);
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    next();
};
