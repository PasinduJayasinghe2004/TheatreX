// ============================================================================
// Authentication Service
// ============================================================================
// Handles all auth-related API calls and token management
// ============================================================================

import axios from 'axios';
import authStorage from '../utils/authStorage';

// Base API URL - reads from VITE_API_URL env variable (falls back to localhost for dev)
// Avoid double /api suffix if it is already provided in the environment variable
const VITE_API_URL_ENV = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = VITE_API_URL_ENV.endsWith('/api') ? VITE_API_URL_ENV : `${VITE_API_URL_ENV}/api`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ============================================================================
// REQUEST INTERCEPTOR: Attach JWT Token
// ============================================================================
api.interceptors.request.use(
    (config) => {
        const token = authStorage.getToken();
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
// RESPONSE INTERCEPTOR: Handle 401 Errors + Token Refresh
// ============================================================================
let isRefreshing = false;
let failedQueue = [];

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
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login')
        ) {
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

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const storedRefreshToken = authStorage.getRefreshToken();
                if (!storedRefreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken: storedRefreshToken
                });

                if (response.data.success && response.data.token) {
                    const newToken = response.data.token;
                    authStorage.setToken(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    processQueue(null, newToken);
                    return api(originalRequest);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                authStorage.clear();
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
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success && response.data.token) {
                authStorage.setToken(response.data.token);
                authStorage.setUser(response.data.user);

                if (response.data.refreshToken) {
                    authStorage.setRefreshToken(response.data.refreshToken);
                }
            }

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            throw new Error(message);
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed.';
            throw new Error(message);
        }
    },

    logout: () => {
        authStorage.clear();
    },

    getCurrentUser: () => {
        return authStorage.getUser();
    },

    isLoggedIn: () => {
        return !!authStorage.getToken();
    },

    getToken: () => {
        return authStorage.getToken();
    },

    getRefreshToken: () => {
        return authStorage.getRefreshToken();
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error sending password reset email.';
            throw new Error(message);
        }
    },

    resetPassword: async (email, token, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { email, token, newPassword });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error resetting password.';
            throw new Error(message);
        }
    },

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

export { api };
export default authService;
