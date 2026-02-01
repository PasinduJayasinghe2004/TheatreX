/**
 * TheatreX Backend Server - Main Entry Point
 * 
 * This is the main server file for the TheatreX application backend.
 * It sets up the Express server, configures middleware, defines routes,
 * and handles database initialization.
 * 
 * @module server
 * @requires express - Web framework for Node.js
 * @requires cors - Cross-Origin Resource Sharing middleware
 * @requires dotenv - Environment variable loader
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { initializeTables } from './models/userModel.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables from .env file
// This must be called before accessing any process.env variables
dotenv.config();

// Initialize Express application instance
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS (Cross-Origin Resource Sharing) for frontend communication
// Allows requests from different origins (e.g., React frontend on port 3000)
app.use(cors());

// Parse incoming JSON payloads in request body
// Makes req.body available for JSON data
app.use(express.json());

// Parse URL-encoded data (form submissions)
// extended: true allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

// ============================================
// API ROUTES
// ============================================

// Mount user-related routes at /api/users endpoint
// All routes in userRoutes will be prefixed with /api/users
app.use('/api/users', userRoutes);

// Health check endpoint
// Used to verify that the API server is running and responsive
// Returns: 200 OK with server status and current timestamp
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'TheatreX API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint - API information
// Provides welcome message and available API endpoints
// Useful for API discovery and documentation
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to TheatreX API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            users: '/api/users'
        }
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Not Found handler
// Catches all requests to undefined routes
// Must be placed after all other route definitions
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handling middleware
// Catches any errors thrown in the application
// In development mode, returns detailed error messages for debugging
// In production mode, hides error details for security
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        // Only expose error details in development environment
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// SERVER INITIALIZATION
// ============================================

// Get port from environment variables or use default port 5000
const PORT = process.env.PORT || 5000;

/**
 * Start the Express server with database initialization
 * 
 * This function performs the following steps:
 * 1. Tests the database connection
 * 2. Initializes database tables (creates if not exists)
 * 3. Starts the Express server on the specified port
 * 
 * If any step fails, the process exits with code 1
 */
const startServer = async () => {
    try {
        // Step 1: Test database connection
        // Ensures we can connect to MySQL before starting the server
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your configuration.');
            process.exit(1); // Exit with error code
        }

        // Step 2: Initialize database tables
        // Creates the users table if it doesn't exist
        await initializeTables();

        // Step 3: Start the Express server
        // Begin listening for incoming HTTP requests
        app.listen(PORT, () => {
            console.log('');
            console.log('🚀 ================================');
            console.log(`🎭 TheatreX Backend Server`);
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
            console.log('🚀 ================================');
            console.log('');
        });
    } catch (error) {
        // Handle any unexpected errors during server startup
        console.error('❌ Failed to start server:', error.message);
        process.exit(1); // Exit with error code
    }
};

// Execute the server startup function
startServer();
