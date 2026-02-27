// ============================================================================
// Authentication Service
// ============================================================================
// Handles all auth-related API calls and token management
// Created by: M5 (Inthusha) - Day 3
// Updated by: M5 (Inthusha) - Day 4 (Refresh token + Axios interceptors)
//
// FEATURES:
// - Login/Logout with token storage
// - Refresh token logic with automatic 401 retry
// - Axios request interceptor (attach access token)
// - Axios response interceptor (auto-refresh on 401)
// ============================================================================

import axios from 'axios';

// Base API URL - adjust if your backend runs on a different port
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ============================================================================
// REQUEST INTERCEPTOR: Attach Access Token
// ============================================================================
// Automatically adds the JWT access token to every outgoing request
// ============================================================================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================================================
// RESPONSE INTERCEPTOR: Handle 401 Errors + Auto-Refresh
// ============================================================================
// Created by: M5 (Inthusha) - Day 4
//
// When a request fails with 401 (Unauthorized):
// 1. Attempts to refresh the access token using the stored refresh token
// 2. If refresh succeeds, retries the original request with the new token
// 3. If refresh fails, clears auth data and redirects to login
//
// Uses a queue mechanism to prevent multiple simultaneous refresh calls
// when several requests fail with 401 at the same time
// ============================================================================
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    // Success handler - pass through successful responses
    (response) => response,

    // Error handler - intercept 401 errors
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors that haven't been retried yet
        // Skip refresh for the refresh endpoint itself (avoid infinite loop)
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/login')
        ) {
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            // Mark request as retried to prevent infinite loop
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const storedRefreshToken = localStorage.getItem('refreshToken');

                if (!storedRefreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh endpoint
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken: storedRefreshToken
                });

                if (response.data.success && response.data.token) {
                    const newToken = response.data.token;

                    // Store new access token
                    localStorage.setItem('token', newToken);

                    // Update the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    // Process queued requests
                    processQueue(null, newToken);

                    console.log('✅ Access token refreshed successfully');

                    // Retry the original request
                    return api(originalRequest);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (refreshError) {
                // Refresh failed - clear auth data
                processQueue(refreshError, null);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                console.error('❌ Token refresh failed, logging out');

                // Redirect to login page
                window.location.href = '/login';

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ============================================================================
// Authentication Service Object
// ============================================================================
const authService = {
    // ========================================
    // Login user
    // Updated by: M5 (Inthusha) - Day 4 (stores refresh token)
    // ========================================
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            // Store access token, refresh token, and user data in localStorage
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Store refresh token (new in Day 4)
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
            }

            return response.data;
        } catch (error) {
            // Extract error message from response
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Logout user
    // Updated by: M5 (Inthusha) - Day 4 (clears refresh token)
    // ========================================
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // ========================================
    // Refresh Access Token
    // Created by: M5 (Inthusha) - Day 4
    // ========================================
    refreshToken: async () => {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (!storedRefreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken: storedRefreshToken
            });

            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                return response.data;
            }

            throw new Error('Token refresh failed');
        } catch (error) {
            const message = error.response?.data?.message || 'Token refresh failed.';
            throw new Error(message);
        }
    },

    // Get current user from localStorage
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },

    // Get access token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Get refresh token
    getRefreshToken: () => {
        return localStorage.getItem('refreshToken');
    },

    // Forgot Password
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error sending password reset email.';
            throw new Error(message);
        }
    },

    // Reset Password
    resetPassword: async (email, token, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { email, token, newPassword });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error resetting password.';
            throw new Error(message);
        }
    },

    // Get User Profile
    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching profile.';
            throw new Error(message);
        }
    }
};

// Export the api instance for use in other services
export { api };
export default authService;

