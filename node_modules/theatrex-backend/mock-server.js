import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const SECRET = 'mock-secret';

// Mock User
const MOCK_USER = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    phone: '1234567890'
};

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'test@example.com' && password === 'password123') {
        const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: '1d' });
        return res.json({
            success: true,
            token,
            user: MOCK_USER
        });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Register
app.post('/api/auth/register', (req, res) => {
    return res.json({ success: true, message: 'Mock registration successful' });
});

// Profile (Protected)
app.get('/api/auth/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token' });
    }
    return res.json({ success: true, user: MOCK_USER });
});

app.listen(PORT, () => {
    console.log(`🎭 Mock Server running on http://localhost:${PORT}`);
    console.log(`👉 Use 'test@example.com' / 'password123' to login`);
});
