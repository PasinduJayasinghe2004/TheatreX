# Environment Variables Configuration Guide

**Developer:** M1 (Pasindu) | **Day:** 28

## Overview

This guide explains all environment variables used in TheatreX and how to configure them for different environments (development, staging, production).

## Directory Structure

```
backend/
├── .env.example           # Template for all variables (tracked in git)
├── .env                   # Local development (NOT in git)
├── .env.staging           # Staging environment config
├── .env.production        # Production environment config (very secure)
└── config/
    ├── database.js        # Database configuration
    ├── email.js           # Email service config
    ├── auth.js            # Authentication config
    └── logging.js         # Logging configuration
```

---

## Environment-Based Configuration

### Development Environment

**File:** `.env` (local, not in git)

```
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:pass@localhost:5432/theatrex_dev
```

**Characteristics:**
- Full logging and debugging enabled
- Mock email service
- Development database with test data
- CORS allows localhost:5173
- Rate limiting disabled for testing

### Staging Environment

**File:** `.env.staging` (in git, with placeholder passwords)

```
NODE_ENV=staging
PORT=5000
API_URL=https://api-staging.theatrex.app
FRONTEND_URL=https://staging.theatrex.app
DATABASE_URL=postgresql://user:pass@staging-db.neon.tech/theatrex_staging
```

**Characteristics:**
- Production-like configuration
- Real database on Neon Cloud
- Real email service enabled
- SSL enabled
- CORS configured for staging domain
- Rate limiting enabled

### Production Environment

**File:** `.env.production` (NEVER in git)

```
NODE_ENV=production
PORT=5000
API_URL=https://api.theatrex.app
FRONTEND_URL=https://theatrex.app
DATABASE_URL=postgresql://user:pass@prod-db.neon.tech/theatrex_prod
```

**Characteristics:**
- Minimal logging (only errors)
- All security measures enabled
- SSL/TLS required
- Database backups enabled
- Monitoring and alerting configured
- Rate limiting strict

---

## Critical Variables by Category

### 🔐 Security Variables

| Variable | Development | Staging | Production | Notes |
|----------|-------------|---------|------------|-------|
| `JWT_SECRET` | Any 32+ char string | Strong random | 🔒 Secret manager | Access token secret |
| `JWT_REFRESH_SECRET` | Any 32+ char string | Strong random | 🔒 Secret manager | Refresh token secret |
| `ENCRYPTION_KEY` | Test key | Prod key | 🔒 Secret manager | Data encryption |
| `PASSWORD_MIN_LENGTH` | 6 | 8 | 8 | Enforce strong passwords |

**How to generate secure keys:**
```bash
# Generate random 32-character key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 🗄️ Database Variables

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `DATABASE_URL` | Local PostgreSQL | Neon staging | Neon production |
| `DB_POOL_MIN` | 2 | 5 | 10 |
| `DB_POOL_MAX` | 10 | 20 | 50 |
| `DB_QUERY_TIMEOUT` | 30000 | 30000 | 30000 |

**Connection string format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

### 📧 Email Variables

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `EMAIL_SERVICE` | mock | smtp/sendgrid | smtp/sendgrid |
| `MAIL_FROM_ADDRESS` | dev@test.local | noreply@staging.theatrex.app | noreply@theatrex.app |
| `SMTP_HOST` | (not used) | smtp.gmail.com | smtp.gmail.com |

**Setup Options:**
1. **Gmail (recommended for small volume)**:
   - Account: noreply@theatrex.app
   - Use "App Password" (not regular password)
   - Set: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587

2. **SendGrid (recommended for production)**:
   - Sign up at sendgrid.com
   - Get API key
   - Set: SENDGRID_API_KEY=your_api_key

### 📊 Logging Variables

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `LOG_LEVEL` | debug | info | warn |
| `LOG_FORMAT` | simple | json | json |
| `LOG_MAX_DAYS` | 7 | 30 | 90 |

---

## Setup Instructions by Environment

### 1. Local Development Setup

**Step 1: Create `.env` file**
```bash
cd backend
cp .env.example .env
```

**Step 2: Edit `.env` with local values**
```
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/theatrex_dev
JWT_SECRET=dev-secret-key-at-least-32-chars-long
```

**Step 3: Test connection**
```bash
npm run test:db  # Tests database connection
```

### 2. Staging Environment Setup

**Step 1: Create staging config**
```bash
cp .env.example .env.staging
```

**Step 2: Configure for staging**

Get values for:
- Production PostgreSQL connection on Neon
- SendGrid API key
- JWT secrets (from secure storage)
- Email credentials

**Step 3: Load staging env variables**
```bash
# Option 1: Manually before running
export $(cat .env.staging | grep -v '#' | xargs)
npm start

# Option 2: Create deployment script
npm run deploy:staging
```

### 3. Production Environment Setup

**⚠️ PRODUCTION SECURITY CHECKLIST**

- [ ] All secrets stored in secure storage (AWS Secrets Manager, Vault, etc.)
- [ ] `.env.production` file NOT in git repository
- [ ] Database backups configured
- [ ] SSL/TLS certificates valid
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Logging to persistent storage

**Step 1: Use CI/CD secrets**

In GitHub Actions:
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
```

**Step 2: Server-side secrets management**
```bash
# Using environment variables directly (recommended)
export DATABASE_URL=xxx
export JWT_SECRET=xxx

npm start
```

---

## Configuration File Examples

### `config/database.js`

```javascript
const config = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'theatrex_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    pool: {
      min: 2,
      max: 10,
      idle: 10000,
      acquire: 30000
    }
  },
  staging: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      min: 5,
      max: 20,
      idle: 10000
    }
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      min: 10,
      max: 50,
      idle: 10000,
      acquire: 20000,
      evictionRunIntervalMillis: 10000,
      numTestsPerEvictionRun: 10,
      softIdleTimeoutMillis: 30000,
      idleTimeoutMillis: 60000
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

### `config/email.js`

```javascript
function getEmailConfig() {
  const service = process.env.EMAIL_SERVICE || 'mock';

  if (service === 'sendgrid') {
    return {
      service: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.MAIL_FROM_ADDRESS
    };
  }

  if (service === 'smtp') {
    return {
      service: 'smtp',
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      from: process.env.MAIL_FROM_ADDRESS
    };
  }

  return {
    service: 'mock',
    debug: true
  };
}

module.exports = getEmailConfig();
```

---

## Validation & Testing

### Validate Environment Variables

**Create `config/validate-env.js`:**
```javascript
function validateEnvironment() {
  const required = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  console.log('✓ All required environment variables present');
}

module.exports = validateEnvironment;
```

**Use in `server.js`:**
```javascript
const validateEnvironment = require('./config/validate-env');

validateEnvironment();
```

### Test Environment Variables

```bash
# Check all required variables are set
npm run check:env

# Load .env and validate
node -e "require('dotenv').config(); require('./config/validate-env')()"
```

---

## Common Issues & Solutions

### Issue: Database connection fails

**Error:** `connect ECONNREFUSED`

**Solutions:**
1. Check DATABASE_URL format
2. Verify PostgreSQL is running
3. Verify host, port, credentials
4. For Neon: Ensure SSL mode is correct

### Issue: JWT authentication fails

**Error:** `JsonWebTokenError: invalid signature`

**Solutions:**
1. Verify JWT_SECRET is same across all instances
2. Check token not expired
3. Ensure token generated with same secret

### Issue: Email not sending

**Error:** `Invalid login` or `Authentication failed`

**Solutions:**
1. Verify SMTP credentials
2. For Gmail: Use App Password, not account password
3. For SendGrid: Use full API key
4. Check firewall/port 587 is open

---

## Security Best Practices

### 1. Never Commit Secrets

```bash
# ✅ Good
git add .env.example     # Only template
git add .env.staging     # With placeholder values

# ❌ Bad
git add .env             # Local secrets
git add .env.production  # Production secrets
```

### 2. Rotate Secrets Regularly

- JWT secrets: Every 6 months
- Database passwords: Every 3 months
- API keys: Every 6 months
- SSL certificates: Annually (before expiry)

### 3. Use Secure Storage

```
Development: .env file (local, not in git)
Staging: Environment variables + CI/CD secrets
Production: AWS Secrets Manager / Vault / LastPass
```

### 4. Audit Access

- Log all environment variable changes
- Monitor access to secrets
- Review who has access
- Implement least privilege

---

## Environment Variable Checklists

### ✅ Pre-Staging Checklist

- [ ] All variables in `.env.staging` defined
- [ ] Database connection tested
- [ ] Email service configured
- [ ] JWT secrets generated securely
- [ ] CORS origins configured
- [ ] Logging configured
- [ ] Rate limiting configured

### ✅ Pre-Production Checklist

- [ ] Production database created
- [ ] `.env.production` NOT in git
- [ ] Secrets in secure storage (not as env vars)
- [ ] SSL certificates valid
- [ ] Database backups enabled
- [ ] Monitoring configured
- [ ] Log rotation configured
- [ ] Alert rules configured

---

## Quick Reference

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Load environment variables
export $(cat .env.staging | grep -v '#' | xargs)

# Validate environment
npm run validate:env

# Test database connection
npm run test:db

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

---

**Last Updated:** March 21, 2025  
**Version:** 1.0.0
