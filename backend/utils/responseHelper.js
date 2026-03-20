/**
 * Standardize API responses
 */

export const sendSuccess = (res, data, message = 'Success', status = 200, meta = null) => {
    const response = {
        success: true,
        message,
        data
    };

    if (Array.isArray(data)) {
        response.count = data.length;
    }

    if (meta && typeof meta === 'object') {
        response.meta = meta;
    }

    return res.status(status).json(response);
};

export const sendError = (res, message = 'Error', status = 500, errorCode = 'INTERNAL_SERVER_ERROR', error = null) => {
    const response = {
        success: false,
        message,
        error_code: errorCode
    };

    if (error) {
        // Handle validation errors specifically for test compatibility
        if (Array.isArray(error)) {
            response.errors = error;
        } else if (error.errors && Array.isArray(error.errors)) {
            response.errors = error.errors;
        } else if (error.message && Array.isArray(error.message)) {
            // Support the way some middlewares pass { message: [errors] }
            response.errors = error.message;
        }

        // Include details for developers
        response.details = process.env.NODE_ENV === 'development' ? (error.message || error) : undefined;
    }

    return res.status(status).json(response);
};
