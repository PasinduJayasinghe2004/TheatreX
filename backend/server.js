import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { initializeTables } from './models/userModel.js';
import { createNotificationsTable } from './models/notificationModel.js';
import { createAnaesthetistsTable } from './models/anaesthetistModel.js';
import { createSurgeonsTable } from './models/surgeonModel.js';
import { createNursesTable } from './models/nurseModel.js';
import { createTechniciansTable } from './models/technicianModel.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'TheatreX API is running',
        timestamp: new Date().toISOString()
    });
});

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

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    let dbConnected = false;

    try {
        dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('Database connection failed. Running in limited mode.');
        } else {
            await initializeTables();
            await createNotificationsTable();
            await createAnaesthetistsTable();
            await createSurgeonsTable();
            await createNursesTable();
            await createTechniciansTable();
        }
    } catch (error) {
        console.warn('Database error:', error.message);
    }

    app.listen(PORT, () => {
        console.log('TheatreX Backend Server running on port ' + PORT);
        console.log('API URL: http://localhost:' + PORT);
        console.log('Database: ' + (dbConnected ? 'Connected' : 'Not connected'));
    });
};

startServer();
