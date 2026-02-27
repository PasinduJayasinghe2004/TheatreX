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
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import { initializeTables } from './models/userModel.js';
import { createNotificationsTable } from './models/notificationModel.js';
import { createAnaesthetistsTable } from './models/anaesthetistModel.js';
import { createSurgeonsTable } from './models/surgeonModel.js';
import { createNursesTable } from './models/nurseModel.js';
import { createTechniciansTable } from './models/technicianModel.js';
import { createTheatresTable } from './models/theatreModel.js'; // M2 - Day 8
import { createSurgeryNursesTable } from './models/surgeryNurseModel.js'; // M2 - Day 9
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import surgeryRoutes from './routes/surgeryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'; // M4 - Day 7
import theatreRoutes from './routes/theatreRoutes.js'; // M2 - Day 8
import surgeonRoutes from './routes/surgeonRoutes.js'; // M1 - Day 13
import nurseRoutes from './routes/nurseRoutes.js'; // M3 - Day 13
import anaesthetistRoutes from './routes/anaesthetistRoutes.js'; // M6 - Day 13

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());

// Parse incoming JSON payloads in request body
// Makes req.body available for JSON data
app.use(express.json());

// Parse URL-encoded data (form submissions)
// extended: true allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes); // RBAC test routes - M4 Day 4
app.use('/api/surgeries', surgeryRoutes); // Surgery routes - M1 Day 5
app.use('/api/dashboard', dashboardRoutes); // Dashboard routes - M4 Day 7
app.use('/api/theatres', theatreRoutes); // Theatre routes - M2 Day 8
app.use('/api/surgeons', surgeonRoutes); // Surgeon routes - M1 Day 13
app.use('/api/nurses', nurseRoutes); // Nurse routes - M3 Day 13
app.use('/api/anaesthetists', anaesthetistRoutes); // Anaesthetist routes - M6 Day 13

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'TheatreX API is running',
        timestamp: new Date().toISOString()
    });
});

// Root route
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        // Only expose error details in development environment
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
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
    let dbConnected = false;

    try {
        // Test database connection
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('Database connection failed. Running in limited mode.');
        } else {
            await initializeTables();
            await createNotificationsTable();
            await createAnaesthetistsTable();
            await createSurgeonsTable();
            await createNursesTable();
            await createTechniciansTable();
            await createTheatresTable(); // M2 - Day 8
            await createSurgeryNursesTable(); // M2 - Day 9
        }

        // Start listening
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
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Export app for testing
export default app;

// Start server only if run directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    startServer();
}
