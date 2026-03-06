// ============================================================================
// Anaesthetist Validation Middleware
// ============================================================================
// Created by: M3 (Janani) - Day 14
//
// Validates incoming anaesthetist data before the controller processes it.
// ============================================================================

// ── Validate Update Anaesthetist body (partial — all fields optional) ─────
export const validateAnaesthetistUpdate = (req, res, next) => {
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

    // shift_preference (only if provided)
    const { shift_preference } = req.body;
    const validShifts = ['morning', 'afternoon', 'night', 'flexible'];
    if (shift_preference !== undefined && shift_preference !== null && shift_preference !== '') {
        if (!validShifts.includes(shift_preference)) {
            errors.push(`shift_preference must be one of: ${validShifts.join(', ')}`);
        }
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
