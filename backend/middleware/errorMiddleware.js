import { sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Centeralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('API Error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;

    return sendError(res, message, status, errorCode, err);
};

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.status = 404;
    error.errorCode = ERROR_CODES.NOT_FOUND;
    next(error);
};
