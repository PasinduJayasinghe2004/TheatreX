// ============================================================================
// Surgery Validation Middleware
// ============================================================================
// Created by: M4 (Oneli) - Day 5
// 
// Validates incoming surgery data before processing
// Ensures data integrity and correct types
// ============================================================================

export const validateSurgery = (req, res, next) => {
    const {
        surgery_type,
        scheduled_date,
        scheduled_time,
        duration_minutes,
        status,
        priority,
        patient_id,
        patient_name,
        patient_age,
        patient_gender
    } = req.body;

    const errors = [];

    // 1. Required Core Fields
    if (!surgery_type) errors.push('Surgery type is required');
    if (!scheduled_date) errors.push('Scheduled date is required');
    if (!scheduled_time) errors.push('Scheduled time is required');
    if (!duration_minutes) errors.push('Duration is required');

    // 1a. Date and Time Format & Logical Validation
    if (scheduled_date) {
        const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateFormatRegex.test(scheduled_date)) {
            errors.push('Scheduled date must be in YYYY-MM-DD format');
        } else {
            const parsedDate = new Date(scheduled_date);
            if (isNaN(parsedDate.getTime())) {
                errors.push('Scheduled date must be a valid calendar date');
            }
        }
    }

    if (scheduled_time) {
        const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeFormatRegex.test(scheduled_time)) {
            errors.push('Scheduled time must be in HH:MM 24-hour format');
        }
    }

    if (scheduled_date && scheduled_time) {
        const dateTimeString = `${scheduled_date}T${scheduled_time}:00`;
        const scheduledDateTime = new Date(dateTimeString);
        if (isNaN(scheduledDateTime.getTime())) {
            errors.push('Scheduled date and time must form a valid datetime');
        } else {
            const now = new Date();
            if (scheduledDateTime < now) {
                errors.push('Scheduled date and time cannot be in the past');
            }
        }
    }
    // 2. Patient Validation (Either ID or Manual Details)
    if (!patient_id) {
        // If no ID, require manual details
        if (!patient_name) errors.push('Patient name is required (if no ID provided)');
        if (!patient_age) errors.push('Patient age is required (if no ID provided)');
        if (!patient_gender) errors.push('Patient gender is required (if no ID provided)');
    }

    // 3. Enum Validation
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
        errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const validPriorities = ['routine', 'urgent', 'emergency'];
    if (priority && !validPriorities.includes(priority)) {
        errors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    // 4. Data Type Validation
    if (duration_minutes) {
        const durationValue = Number(duration_minutes);
        if (Number.isNaN(durationValue) || durationValue <= 0 || !Number.isInteger(durationValue)) {
            errors.push('Duration must be a positive integer number of minutes');
        }
    }

    if (patient_age && (isNaN(patient_age) || patient_age < 0 || patient_age > 150)) {
        errors.push('Patient age must be a valid number between 0 and 150');
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};
