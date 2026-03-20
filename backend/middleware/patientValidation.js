import { sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Validation for Patient creation and updates
 */
export const validatePatient = (req, res, next) => {
    const { name, age, gender, phone, email, blood_type } = req.body;
    const errors = [];

    if (!name || name.trim() === '') errors.push('Name is required');
    
    if (age !== undefined) {
        const ageNum = Number(age);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
            errors.push('Age must be a valid number between 0 and 150');
        }
    }

    if (gender) {
        const validGenders = ['male', 'female', 'other'];
        if (!validGenders.includes(gender.toLowerCase())) {
            errors.push('Gender must be one of: male, female, other');
        }
    }

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }
    }

    if (blood_type) {
        const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodTypes.includes(blood_type.toUpperCase())) {
            errors.push('Invalid blood type');
        }
    }

    if (errors.length > 0) {
        return sendError(res, 'Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, { message: errors });
    }

    next();
};
