# TheatreX Setup Guide

**Developer:** M1 (Pasindu) | **Day:** 27

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up TheatreX, ensure you have:

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v12 or higher (or Neon Cloud account)
- **Git**: For version control

### Required Accounts
- **GitHub**: For repository access
- **Neon Cloud** (optional): For PostgreSQL cloud database
- **Email Service**: For email notifications (optional)

### System Requirements
- RAM: Minimum 4GB (8GB recommended)
- Disk Space: 2GB minimum
- CPU: Dual-core processor
- OS: Windows, macOS, or Linux

---

## Project Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/PasinduJayasinghe2004/SDGP-Project.git

# Navigate to project directory
cd SDGP-Project
```

### Step 2: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Return to root directory
cd ..
```

### Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Return to root directory
cd ..
```

---

## Database Setup

### Option A: Using Neon Cloud (Recommended)

1. **Create Neon Account**
   - Go to [https://neon.tech](https://neon.tech)
   - Sign up for free account
   - Create new project

2. **Copy Connection String**
   - In Neon console, copy the connection string
   - Keep it secure (contains credentials)

3. **Create Database**
   - Use the connection string in your `.env` file
   - Database migrations will run automatically on first server start

### Option B: Using Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   
   # macOS
   brew install postgresql
   
   # Linux
   sudo apt-get install postgresql
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE theatrex_db;
   
   # Create user (optional)
   CREATE USER theatrex_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE theatrex_db TO theatrex_user;
   ```

3. **Get Connection String**
   ```
   postgresql://theatrex_user:secure_password@localhost:5432/theatrex_db
   ```

---

## Environment Configuration

### Step 1: Backend Environment Variables

Create `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=30000

# Server
PORT=5000
NODE_ENV=development
SECRET_KEY=your-secret-key-change-in-production

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=1h
REFRESH_TOKEN_EXPIRE=7d

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:4173

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@theatrex.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
AUTH_RATE_LIMIT_MAX=30

# API Keys (optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Step 2: Frontend Environment Variables

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=TheatreX
VITE_APP_VERSION=1.0.0
```

### Step 3: Generate Secure Keys

```bash
# Generate JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate secret key (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Running the Application

### Step 1: Start Backend Server

```bash
# Open terminal 1
cd backend

# Install dependencies (if not done)
npm install

# Run migrations (first time)
npm run migrate

# Start development server
npm run dev

# Server should start on http://localhost:5000
```

### Step 2: Start Frontend Development Server

```bash
# Open terminal 2
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Frontend should open on http://localhost:5173
```

### Step 3: Verify Both Servers

- Backend: Visit `http://localhost:5000/` - Should see welcome message
- Frontend: Visit `http://localhost:5173/` - Should see login page

---

## Verification

### Check Backend Health

```bash
# Test API health endpoint
curl http://localhost:5000/

# Expected response:
# {
#   "success": true,
#   "message": "Welcome to TheatreX Backend API",
#   "version": "1.0.0"
# }
```

### Check Database Connection

```bash
# In backend directory
npm run test:db

# Should show successful database connection
```

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Create Test User

```bash
# Register via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345",
    "firstName": "Test",
    "lastName": "User",
    "role": "surgeon"
  }'

# Login via UI
# Visit http://localhost:5173/
# Click "Register" and fill the form
```

---

## Initial Data Setup

### Create Admin User (via API)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@theatrex.app",
    "password": "Admin@12345",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### Seed Initial Data (Optional)

```bash
cd backend

# Run seed script
npm run seed

# This will populate:
# - Sample surgeons, nurses, anaesthetists, technicians
# - Sample theatres with equipment
# - Sample patients
# - Sample surgeries
```

---

## Production Deployment

### Backend Deployment (Vercel/Railway)

1. **Set Environment Variables** in hosting platform
2. **Build for production**
   ```bash
   npm run build
   ```
3. **Start production server**
   ```bash
   npm start
   ```

### Frontend Deployment (Vercel)

1. **Build frontend**
   ```bash
   npm run build
   ```
2. **Deploy build directory**
3. **Configure environment variables**

### Database in Production

1. **Use Neon Cloud or managed PostgreSQL**
2. **Enable backups**
3. **Configure SSL/TLS**
4. **Set strong credentials**

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000 (Windows)
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Database Connection Failed

```bash
# Check connection string format
# postgresql://user:password@host:port/database

# Test connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Error:', err);
  else console.log('Connected:', res.rows[0]);
  pool.end();
});
"
```

### Dependency Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
npm install
```

### JWT Token Issues

```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in .env and restart server
```

### CORS Errors

```bash
# Ensure CORS_ORIGINS includes your frontend URL
CORS_ORIGINS=http://localhost:5173,http://localhost:4173

# Or allow all (development only)
CORS_ORIGINS=*
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Cannot connect to database | Check DATABASE_URL in .env |
| Port 5000 in use | Change PORT in .env or kill process |
| Build fails | Run `npm cache clean --force` and reinstall |
| CORS error | Update CORS_ORIGINS in backend .env |
| Login not working | Verify JWT_SECRET is set correctly |
| Emails not sending | Configure EMAIL_* variables or skip |

---

## Development Tools

### VSCode Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client / REST Client
- PostgreSQL Explorer
- Git Graph

### Useful Commands

```bash
# Format code
npm run format

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run dev

# Build
npm run build
```

---

## Performance Optimization

### Backend

1. **Database Indexing**: Already configured for common queries
2. **Connection Pooling**: Configured in DATABASE_POOL_SIZE
3. **Rate Limiting**: Enabled for auth endpoints
4. **Caching**: Implemented where beneficial

### Frontend

1. **Code Splitting**: Implemented with React Router
2. **Lazy Loading**: Components load on demand
3. **Image Optimization**: Use appropriate formats
4. **Build Optimization**: Configured in Vite

---

## Security Checklist

Before production deployment:

- [ ] Change all default passwords
- [ ] Update JWT_SECRET to strong value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup error logging
- [ ] Configure email service
- [ ] Run security audit: `npm audit`
- [ ] Review API permissions/roles
- [ ] Setup database backups
- [ ] Configure monitoring/alerts

---

## Next Steps

1. **Create your first surgery**
   - Navigate to Surgery List
   - Click "New Surgery"
   - Fill in details
   - Assign staff and theatre

2. **Configure theatres**
   - Set up operating theatres
   - Add equipment
   - Configure availability

3. **Add staff**
   - Register surgeons, nurses, etc.
   - Update qualifications
   - Set availability schedules

4. **Setup notifications** (optional)
   - Configure email service
   - Set notification preferences
   - Test notification delivery

---

## Getting Help

### Documentation
- **API Docs**: See `docs/api/` folder
- **Module READMEs**: See `docs/` folder
- **User Guides**: See `docs/user-manuals/` folder

### Community Support
- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share ideas
- Pull Requests: Contribute improvements

---

**Last Updated:** March 21, 2025
**Version:** 1.0.0
