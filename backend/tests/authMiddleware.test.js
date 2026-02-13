
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { verifyToken } from '../utils/jwtUtils.js';
import { pool } from '../config/database.js';

// Mock dependencies
jest.mock('../utils/jwtUtils.js');
jest.mock('../config/database.js', () => ({
    pool: {
        query: jest.fn()
    }
}));

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            user: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('protect middleware', () => {
        it('should call next if token is valid and user exists', async () => {
            const token = 'valid.token.here';
            const decoded = { id: 1, role: 'surgeon' };
            const user = { id: 1, name: 'Dr. Smith', role: 'surgeon', is_active: true };

            req.headers.authorization = `Bearer ${token}`;
            verifyToken.mockReturnValue(decoded);
            pool.query.mockResolvedValue({ rows: [user] });

            await protect(req, res, next);

            expect(verifyToken).toHaveBeenCalledWith(token);
            expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [decoded.id]);
            expect(req.user).toEqual(user);
            expect(next).toHaveBeenCalled();
        });

        it('should return 401 if no token provided', async () => {
            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Not authorized, no token provided' }));
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', async () => {
            req.headers.authorization = 'Bearer invalid.token';
            verifyToken.mockImplementation(() => { throw new Error('Invalid token'); });

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Not authorized, token failed' }));
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if user not found', async () => {
            const token = 'valid.token';
            const decoded = { id: 999 };

            req.headers.authorization = `Bearer ${token}`;
            verifyToken.mockReturnValue(decoded);
            pool.query.mockResolvedValue({ rows: [] }); // No user found

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User no longer exists' }));
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if user is deactivated', async () => {
            const token = 'valid.token';
            const decoded = { id: 1 };
            const user = { id: 1, is_active: false };

            req.headers.authorization = `Bearer ${token}`;
            verifyToken.mockReturnValue(decoded);
            pool.query.mockResolvedValue({ rows: [user] });

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Account is deactivated' }));
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('authorize middleware (RBAC)', () => {
        it('should call next if user has allowed role', () => {
            req.user = { role: 'admin' };
            const middleware = authorize('admin', 'surgeon');

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should return 403 if user has unauthorized role', () => {
            req.user = { role: 'nurse' };
            const middleware = authorize('admin', 'surgeon');

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('not authorized') }));
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if user is not authenticated (req.user missing)', () => {
            const middleware = authorize('admin');

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User not authenticated' }));
            expect(next).not.toHaveBeenCalled();
        });
    });
});
