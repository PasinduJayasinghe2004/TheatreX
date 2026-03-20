import { ERROR_CODES } from '../constants/errorCodes.js';

const SENSITIVE_FIELDS = new Set([
    'password',
    'confirmPassword',
    'newPassword',
    'currentPassword',
    'token',
    'refreshToken'
]);

// Strip control/null bytes and basic HTML/script tags from user-supplied strings.
const sanitizeString = (value, keyName = '') => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.replace(/\0/g, '').trim();

    if (SENSITIVE_FIELDS.has(keyName)) {
        return trimmed;
    }

    return trimmed
        .replace(/<\/?script[^>]*>/gi, '')
        .replace(/[<>]/g, '');
};

const sanitizeDeep = (value, keyName = '') => {
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeDeep(item, keyName));
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [
                key,
                sanitizeDeep(nestedValue, key)
            ])
        );
    }

    return sanitizeString(value, keyName);
};

export const sanitizeRequest = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeDeep(req.body);
    }

    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeDeep(req.query);
    }

    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeDeep(req.params);
    }

    next();
};

export const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
};

export const createRateLimiter = ({
    windowMs = 60 * 1000,
    max = 60,
    message = 'Too many requests, please try again later.'
} = {}) => {
    const store = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';

        const current = store.get(key);

        if (!current || now > current.resetAt) {
            const nextWindow = { count: 1, resetAt: now + windowMs };
            store.set(key, nextWindow);

            res.setHeader('X-RateLimit-Limit', String(max));
            res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - nextWindow.count)));
            res.setHeader('X-RateLimit-Reset', String(Math.ceil(nextWindow.resetAt / 1000)));
            return next();
        }

        current.count += 1;

        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - current.count)));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(current.resetAt / 1000)));

        if (current.count > max) {
            return res.status(429).json({
                success: false,
                message,
                error_code: ERROR_CODES.RATE_LIMIT_EXCEEDED || 'RATE_LIMIT_EXCEEDED'
            });
        }

        return next();
    };
};
