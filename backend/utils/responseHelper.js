/**
 * Standardize API responses
 */

export const sendSuccess = (res, data, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

export const sendError = (res, message = 'Error', status = 500, error = null) => {
    const response = {
        success: false,
        message
    };

    if (error) {
        response.error = process.env.NODE_ENV === 'development' ? error.message || error : undefined;
    }

    return res.status(status).json(response);
};
