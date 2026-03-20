import { sendError } from '../utils/responseHelper.js';

/**
 * Centeralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('API Error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    return sendError(res, message, status, err);
};

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.status = 404;
    next(error);
};
