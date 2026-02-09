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

// Add token to requests if it exists
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

// Authentication Service
const authService = {
    // Login user
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            // Store token and user data in localStorage
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            // Extract error message from response
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            throw new Error(message);
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

    // Get token
    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default authService;
