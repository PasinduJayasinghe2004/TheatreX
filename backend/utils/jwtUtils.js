
// JWT Utilities

// This file contains reusable JWT (JSON Web Token) utility functions
// Created by: M5 (Inthusha) - Day 3
// 
// PURPOSE:
// - Centralize all JWT operations in one place
// - Make token generation/verification reusable across the application
// - Improve code maintainability and testability
//
// FUNCTIONS:
// - generateToken(payload) - Create a new JWT token
// - verifyToken(token) - Verify and decode a JWT token
// - decodeToken(token) - Decode token without verification (for debugging)


import jwt from 'jsonwebtoken';


// FUNCTION: Generate JWT Token

// Creates a signed JWT token with the provided payload
//
// PARAMETERS:
// @param {Object} payload - Data to encode in the token
//   - id: User ID (required)
//   - email: User email (required)
//   - role: User role (required)
//
// RETURNS:
// @returns {String} - Signed JWT token
//
// EXAMPLE:
// const token = generateToken({ 
//   id: 1, 
//   email: 'user@example.com', 
//   role: 'coordinator' 
// });
// // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
//
// ENVIRONMENT VARIABLES USED:
// - JWT_SECRET: Secret key for signing tokens (required)
// - JWT_EXPIRE: Token expiration time (default: '7d')

export const generateToken = (payload) => {
    try {
        // Validate that JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        // Validate payload has required fields
        if (!payload.id || !payload.email || !payload.role) {
            throw new Error('Token payload must include id, email, and role');
        }

        // Generate and sign the token
        // jwt.sign() creates a token with:
        // - Header: Algorithm and token type
        // - Payload: User data (id, email, role)
        // - Signature: Encrypted using JWT_SECRET
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || '7d',
                // issuer: 'TheatreX', // Optional: Add issuer claim
                // audience: 'TheatreX-Users' // Optional: Add audience claim
            }
        );

        return token;

    } catch (error) {
        console.error('Error generating JWT token:', error.message);
        throw error;
    }
};


// FUNCTION: Verify JWT Token

// Verifies the token signature and decodes the payload
//
// PARAMETERS:
// @param {String} token - JWT token to verify
//
// RETURNS:
// @returns {Object} - Decoded token payload containing user data
//   - id: User ID
//   - email: User email
//   - role: User role
//   - iat: Issued at timestamp
//   - exp: Expiration timestamp
//
// THROWS:
// - JsonWebTokenError: If token is invalid or malformed
// - TokenExpiredError: If token has expired
// - NotBeforeError: If token is not yet valid
//
// EXAMPLE:
// try {
//   const decoded = verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
//   console.log(decoded.id); // 1
//   console.log(decoded.email); // 'user@example.com'
// } catch (error) {
//   console.error('Invalid token:', error.message);
// }

export const verifyToken = (token) => {
    try {
        // Validate that JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        // Validate token is provided
        if (!token) {
            throw new Error('No token provided');
        }

        // Verify and decode the token
        // jwt.verify() will:
        // 1. Check if signature is valid
        // 2. Check if token has expired
        // 3. Return decoded payload if valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return decoded;

    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Token not yet valid');
        }

        // Re-throw other errors
        throw error;
    }
};


// FUNCTION: Decode JWT Token (Without Verification)

// Decodes a JWT token WITHOUT verifying its signature
//
// ⚠️ WARNING: This function does NOT verify the token's authenticity!
// Use this ONLY for debugging or when you need to inspect token contents
// without validation. For authentication, ALWAYS use verifyToken()
//
// PARAMETERS:
// @param {String} token - JWT token to decode
//
// RETURNS:
// @returns {Object|null} - Decoded token payload or null if invalid
//   - header: Token header (algorithm, type)
//   - payload: Token payload (user data)
//   - signature: Token signature (encrypted)
//
// EXAMPLE:
// const tokenInfo = decodeToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
// console.log(tokenInfo.payload.email); // 'user@example.com'
// console.log(tokenInfo.payload.exp); // 1234567890
//
// USE CASES:
// - Debugging token contents
// - Checking token expiration without verification
// - Inspecting token structure

export const decodeToken = (token) => {
    try {
        // Validate token is provided
        if (!token) {
            console.warn('No token provided to decode');
            return null;
        }

        // Decode without verification
        // jwt.decode() returns the payload without checking signature
        // This is useful for debugging but NOT for authentication
        const decoded = jwt.decode(token, { complete: true });

        if (!decoded) {
            console.warn('Failed to decode token - token may be malformed');
            return null;
        }

        return decoded;

    } catch (error) {
        console.error('Error decoding token:', error.message);
        return null;
    }
};


// HELPER FUNCTION: Check if Token is Expired

// Checks if a token has expired without verifying signature
//
// PARAMETERS:
// @param {String} token - JWT token to check
//
// RETURNS:
// @returns {Boolean} - true if expired, false if still valid
//
// EXAMPLE:
// if (isTokenExpired(token)) {
//   console.log('Token has expired, please login again');
// }

export const isTokenExpired = (token) => {
    try {
        const decoded = decodeToken(token);

        if (!decoded || !decoded.payload || !decoded.payload.exp) {
            return true; // Consider invalid tokens as expired
        }

        // exp is in seconds, Date.now() is in milliseconds
        const currentTime = Math.floor(Date.now() / 1000);

        return decoded.payload.exp < currentTime;

    } catch (error) {
        console.error('Error checking token expiration:', error.message);
        return true; // Consider errored tokens as expired
    }
};

// ============================================================================
// FUNCTION: Generate Refresh Token
// ============================================================================
// Creates a long-lived refresh token used to obtain new access tokens
// without requiring the user to re-enter their credentials.
//
// Created by: M5 (Inthusha) - Day 4
//
// PARAMETERS:
// @param {Object} payload - Data to encode in the token
//   - id: User ID (required)
//   - email: User email (required)
//   - role: User role (required)
//
// RETURNS:
// @returns {String} - Signed JWT refresh token
//
// ENVIRONMENT VARIABLES USED:
// - JWT_REFRESH_SECRET: Separate secret for refresh tokens (required)
// - JWT_REFRESH_EXPIRE: Refresh token expiration time (default: '30d')
//
// 
// ============================================================================
export const generateRefreshToken = (payload) => {
    try {
        // Validate that JWT_REFRESH_SECRET exists
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
        }

        // Validate payload has required fields
        if (!payload.id || !payload.email || !payload.role) {
            throw new Error('Token payload must include id, email, and role');
        }

        // Generate refresh token with separate secret and longer expiry
        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
            }
        );

        return refreshToken;

    } catch (error) {
        console.error('Error generating refresh token:', error.message);
        throw error;
    }
};

// ============================================================================
// FUNCTION: Verify Refresh Token
// ============================================================================
// Verifies a refresh token's signature and decodes the payload.
// Uses the separate JWT_REFRESH_SECRET to ensure refresh tokens
// cannot be used as access tokens and vice versa.
//
// Created by: M5 (Inthusha) - Day 4
//
// PARAMETERS:
// @param {String} token - Refresh token to verify
//
// RETURNS:
// @returns {Object} - Decoded token payload containing user data
//
// THROWS:
// - Error if token is expired, invalid, or JWT_REFRESH_SECRET is missing
//
// EXAMPLE:
// try {
//   const decoded = verifyRefreshToken(refreshToken);
//   // Generate a new access token using decoded.id, decoded.email, decoded.role
// } catch (error) {
//   console.error('Refresh token invalid:', error.message);
// }
// ============================================================================
export const verifyRefreshToken = (token) => {
    try {
        // Validate that JWT_REFRESH_SECRET exists
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
        }

        // Validate token is provided
        if (!token) {
            throw new Error('No refresh token provided');
        }

        // Verify and decode the refresh token
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        return decoded;

    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid refresh token');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Refresh token not yet valid');
        }

        // Re-throw other errors
        throw error;
    }
};

// ============================================================================
// Export all functions as default object (alternative import style)
// ============================================================================
export default {
    generateToken,
    verifyToken,
    decodeToken,
    isTokenExpired,
    generateRefreshToken,
    verifyRefreshToken
};
