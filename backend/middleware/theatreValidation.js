import { sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import {
    isValidTheatreStatus,
    isValidTheatreType,
    VALID_THEATRE_STATUSES,
    VALID_THEATRE_TYPES
} from '../utils/theatreConstants.js';

export const validateTheatreStatus = (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return sendError(res, 'Status is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    if (!isValidTheatreStatus(status)) {
        return sendError(res, `Invalid status '${status}'. Must be one of: ${VALID_THEATRE_STATUSES.join(', ')}`, 400, ERROR_CODES.VALIDATION_ERROR);
    }

    next();
};

export const validateTheatreFilters = (req, res, next) => {
    const { status, type } = req.query;

    if (status && !isValidTheatreStatus(status)) {
        return sendError(res, `Invalid status filter '${status}'. Must be one of: ${VALID_THEATRE_STATUSES.join(', ')}`, 400, ERROR_CODES.VALIDATION_ERROR);
    }

    if (type && !isValidTheatreType(type)) {
        return sendError(res, `Invalid type filter '${type}'. Must be one of: ${VALID_THEATRE_TYPES.join(', ')}`, 400, ERROR_CODES.VALIDATION_ERROR);
    }

    next();
};
