# Production Environment Configuration

This file contains templates for production environment variables.

## Backend Production Environment (.env.production)

```env
# ════════════════════════════════════════════════════════
# TheatreX Backend - Production Environment
# ════════════════════════════════════════════════════════

# Node Environment
NODE_ENV=production
PORT=5000

# ════════════════════════════════════════════════════════
# Database Configuration
# ════════════════════════════════════════════════════════

# PostgreSQL Connection String (from Neon or Railway)
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@prod-db-host.neon.tech:5432/theatrex_prod

# Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000

# ════════════════════════════════════════════════════════
# Authentication & Security
# ════════════════════════════════════════════════════════

# JWT Secret (min 32 characters, use openssl rand -hex 16)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_production_jwt_secret_min_32_chars_very_secure

# Session Secret (another random string)
SESSION_SECRET=your_production_session_secret_very_secure

# Token expiration times
JWT_EXPIRE=24h
REFRESH_TOKEN_EXPIRE=7d

# ════════════════════════════════════════════════════════
# CORS Configuration
# ════════════════════════════════════════════════════════

# Allowed frontend origins (comma-separated)
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Allow credentials
CORS_CREDENTIALS=true

# ════════════════════════════════════════════════════════
# API Keys & External Services
# ════════════════════════════════════════════════════════

# Resend Email API (for sending emails)
RESEND_API_KEY=re_production_your_resend_api_key

# Google Gemini API (for AI Chatbot)
GEMINI_API_KEY=AIzaSyD_production_your_gemini_api_key

# ════════════════════════════════════════════════════════
# Logging & Monitoring
# ════════════════════════════════════════════════════════

# Log level: error, warn, info, debug
LOG_LEVEL=info

# Request logging
LOG_REQUESTS=true

# ════════════════════════════════════════════════════════
# Rate Limiting
# ════════════════════════════════════════════════════════

# Rate limit: requests per window
RATE_LIMIT_WINDOW=15 # minutes
RATE_LIMIT_MAX_REQUESTS=100 # per window per IP

# ════════════════════════════════════════════════════════
# Security
# ════════════════════════════════════════════════════════

# HTTPS/HSTS
HSTS_MAX_AGE=31536000 # 1 year

# Content Security Policy
CSP_ENABLED=true

# Enable security headers
SECURITY_HEADERS_ENABLED=true

```

## Frontend Production Environment (.env.production)

```env
# ════════════════════════════════════════════════════════
# TheatreX Frontend - Production Environment
# ════════════════════════════════════════════════════════

# Backend API URL
VITE_API_URL=https://your-backend-deployed-url.com

# Application Name
VITE_APP_NAME=TheatreX

# API Timeout (milliseconds)
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_CHARTS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_PRINT=true

# Analytics (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ANALYTICS_ID=

# Error Reporting (optional)
VITE_ENABLE_ERROR_REPORTING=false
VITE_ERROR_REPORTING_URL=

```

## Environment Variable Setup in Deployment Platforms

### Railway Console

1. Go to your Railway project
2. Select the service (Backend)
3. Go to "Variables" tab
4. Add each variable:
   - DATABASE_URL: [your connection string]
   - JWT_SECRET: [secure random string]
   - CORS_ORIGINS: [your frontend URL]
   - RESEND_API_KEY: [your API key]
   - GEMINI_API_KEY: [your API key]

### Vercel Console (Frontend)

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add variables:
   - VITE_API_URL: [your backend URL]
   - VITE_APP_NAME: TheatreX
4. Redeploy after changing variables

### Render Console

1. Go to your Render service
2. Settings → Environment
3. Add variables same as Railway

## Generating Secure Secrets

### Generate JWT Secret
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f
```

### Generate Session Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Security Checklist for Environment Variables

```
[ ] JWT_SECRET is at least 32 characters
[ ] JWT_SECRET is securely generated (not sequential)
[ ] SESSION_SECRET is secure and unique
[ ] DATABASE_URL only stored in production (not in code)
[ ] API keys are production keys (not development)
[ ] CORS_ORIGINS matches your frontend domain exactly
[ ] No secrets in git/GitHub (add to .gitignore)
[ ] All variables set in deployment platform
[ ] Variables not visible in deployment logs
[ ] Rotate secrets if compromised
```

## Local Development vs Production

```
┌─────────────────────────────────────────────────────────┐
│           Environment Variable Comparison               │
├─────────────────────────────────────────────────────────┤
│ Variable        │ Development     │ Production          │
├─────────────────────────────────────────────────────────┤
│ NODE_ENV        │ development     │ production          │
│ DATABASE        │ local/test      │ Neon/Railway        │
│ JWT_SECRET      │ dev_secret      │ secure_key_here     │
│ CORS_ORIGINS    │ localhost:3000  │ your-domain.com     │
│ LOG_LEVEL       │ debug           │ info                │
│ RATE_LIMITING   │ disabled        │ enabled             │
│ SSL/HTTPS       │ no              │ yes                 │
│ Error Details   │ full            │ minimal             │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting Environment Variables

### Backend doesn't connect to database
```
Check:
1. DATABASE_URL format is correct
2. PostgreSQL service is running
3. Database credentials are correct
4. Network access is allowed
5. Connection string doesn't have special characters (escape if needed)

Test:
psql [DATABASE_URL] -c "SELECT version();"
```

### Frontend API calls fail
```
Check:
1. VITE_API_URL points to deployed backend
2. Backend is running and accessible
3. CORS_ORIGINS includes frontend URL
4. HTTPS is used in production
5. Check browser console for exact error

Test:
curl -H "Origin: [FRONTEND_URL]" [BACKEND_URL]/health
```

### JWT authentication fails
```
Check:
1. JWT_SECRET matches between development and production
2. Token is being sent in Authorization header
3. Token hasn't expired
4. Middleware is correctly configured
5. No typos in secret

Test:
Check browser localStorage for token
Verify token expiration: jwt.io
```

## Security Best Practices

✅ **DO:**
- Use strong, random secrets (32+ bytes)
- Rotate secrets periodically
- Use HTTPS in production
- Enable HSTS (HTTP Strict Transport Security)
- Keep secrets out of version control
- Use different secrets for different environments
- Secure database backups

❌ **DO NOT:**
- Commit .env files to git
- Use simple/sequential secrets
- Hardcode API keys in code
- Share secrets via email/chat
- Use same secret for development and production
- Log secrets in error messages
- Execute untrusted code with secrets

## Post-Deployment Verification

After setting environment variables:

```bash
# Test backend health
curl https://your-backend-url/health

# Should return: { "status": "OK", ... }

# Test CORS
curl -H "Origin: https://your-frontend-url" https://your-backend-url/health

# Should have Access-Control-Allow-Origin header

# Test frontend loads
curl https://your-frontend-url

# Should return HTML page
```

---

**Last Updated:** March 21, 2026
