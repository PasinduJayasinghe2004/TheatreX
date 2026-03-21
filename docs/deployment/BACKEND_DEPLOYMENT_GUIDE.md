# Backend Deployment Guide

**Developer:** M6 (Dinil) | **Day:** 28

## Quick Start

```bash
# Pre-deployment verification
npm run deploy:verify

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod

# Rollback if needed
npm run deploy:rollback
```

---

## Pre-Deployment Checklist

### 1. Code Verification

```bash
# Ensure clean working directory
git status
# Should be: "nothing to commit, working tree clean"

# Check for uncommitted changes
git diff

# Verify branch is up to date
git pull origin main
```

### 2. Dependency Check

```bash
# Update dependencies
npm install

# Audit for vulnerabilities
npm audit

# Fix critical issues
npm audit fix

# Verify no issues
npm audit
```

### 3. Test Suite

```bash
# Run all tests
npm test

# Expected output:
# Tests: 0 failed, X passed
# Coverage: > 80%
```

### 4. Build Verification

```bash
# Clean build
npm run clean && npm run build

# Check build size
du -sh dist/
# Should be < 50MB

# Verify no build errors
npm run build:check
```

### 5. Environment Check

```bash
# Staging environment
cat .env.staging
# Verify all required variables present

# Production environment
cat .env.production
# Verify all required variables present

# Sensitive data NOT in repo check
grep -r "SECRET" .
grep -r "PASSWORD" .
grep -r "API_KEY" .
# Should return only .gitignored files
```

### 6. Database Migration Check

```bash
# List pending migrations
npm run migrate:status

# Verify current schema
npm run migrate:verify

# Test migrations locally
npm run migrate:test
```

### 7. Security Scan

```bash
# Check for hardcoded secrets
npm run security:scan

# OWASP dependency check
npm run security:owasp

# Code quality check
npm run lint

# Expected: 0 errors, < 10 warnings
```

---

## Staging Deployment

### Option 1: Railway Platform

**Step 1: Prepare Repository**

```bash
# Create railway.json in project root
cat > railway.json << 'EOF'
{
  "deploy": {
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 5
  }
}
EOF

git add railway.json
git commit -m "Add Railway configuration"
git push origin staging
```

**Step 2: Deploy via Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway account
railway login

# Create new project (if needed)
railway init

# Deploy application
railway up

# View deployment status
railway status

# Get logs
railway logs -f

# Get environment info
railway env
```

**Step 3: Configure Environment in Railway**

```bash
# Navigate to Railway dashboard > Project > Variables

# Add each variable:
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@host:5432/theatrex_staging
JWT_SECRET=$(openssl rand -hex 32)
API_URL=https://api-staging.theatrex.app
FRONTEND_URL=https://staging.theatrex.app
LOG_LEVEL=info
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SLACK_WEBHOOK=https://hooks.slack.com/...
```

**Step 4: Run Migrations**

```bash
# SSH into Railway container
railway shell

# Navigate to app directory
cd /app

# Run migrations
npm run migrate

# Verify migrations
npm run migrate:verify

# Seed test data
npm run db:seed

# Exit
exit
```

**Step 5: Verify Deployment**

```bash
# Check application is running
curl https://api-staging.theatrex.app/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-03-21T10:30:00Z",
#   "uptime": 45
# }

# Check database connectivity
curl https://api-staging.theatrex.app/health/db

# Check migrations
curl https://api-staging.theatrex.app/health/migrations

# View logs
railway logs -f
```

### Option 2: Heroku Platform

**Step 1: Setup Heroku**

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create Heroku app
heroku create theatrex-staging-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 -a theatrex-staging-api

# View addons
heroku addons -a theatrex-staging-api
```

**Step 2: Deploy Application**

```bash
# Add Heroku remote to git
heroku git:remote -a theatrex-staging-api

# Verify remote added
git remote -v

# Deploy to Heroku
git push heroku staging:main

# Watch deployment
heroku logs --tail
```

**Step 3: Configure Environment Variables**

```bash
# Set via CLI
heroku config:set NODE_ENV=staging -a theatrex-staging-api
heroku config:set JWT_SECRET=$(openssl rand -hex 32) -a theatrex-staging-api
heroku config:set API_URL=https://api-staging.theatrex.app -a theatrex-staging-api
heroku config:set FRONTEND_URL=https://staging.theatrex.app -a theatrex-staging-api
heroku config:set LOG_LEVEL=info -a theatrex-staging-api
heroku config:set REDIS_URL=redis://localhost:6379 -a theatrex-staging-api
heroku config:set SMTP_HOST=smtp.gmail.com -a theatrex-staging-api
heroku config:set SMTP_PORT=587 -a theatrex-staging-api
heroku config:set SMTP_USER=your-email@gmail.com -a theatrex-staging-api
heroku config:set SMTP_PASSWORD=your-app-password -a theatrex-staging-api

# Verify config
heroku config -a theatrex-staging-api
```

**Step 4: Run Migrations**

```bash
# Run migrations on Heroku Postgres
heroku run npm run migrate -a theatrex-staging-api

# Verify migrations
heroku run npm run migrate:verify -a theatrex-staging-api

# Seed data
heroku run npm run db:seed -a theatrex-staging-api
```

**Step 5: Verify Deployment**

```bash
# Open application
heroku open -a theatrex-staging-api

# Check logs
heroku logs --tail -a theatrex-staging-api

# Test API
curl https://api-staging.theatrex.app/health
```

### Option 3: AWS Elastic Beanstalk

**Step 1: Install EB CLI**

```bash
# Install AWS CLI
pip install awscli

# Install EB CLI
pip install awsebcli

# Configure AWS credentials
aws configure
```

**Step 2: Initialize EB Environment**

```bash
# Initialize EB application
eb init -p node.js-18 theatrex-api-staging

# Create environment
eb create theatrex-staging

# View environment status
eb status
```

**Step 3: Deploy Application**

```bash
# Deploy to EB
eb deploy

# View environment
eb open

# Check logs
eb logs
```

**Step 4: Configure Environment**

```bash
# Set environment properties
eb setenv NODE_ENV=staging
eb setenv JWT_SECRET=$(openssl rand -hex 32)
eb setenv DATABASE_URL=postgresql://...
eb setenv API_URL=https://api-staging.theatrex.app
eb setenv FRONTEND_URL=https://staging.theatrex.app
eb setenv LOG_LEVEL=info
eb setenv REDIS_URL=redis://localhost:6379
eb setenv SMTP_HOST=smtp.gmail.com
eb setenv SMTP_PORT=587
eb setenv SMTP_USER=your-email@gmail.com
eb setenv SMTP_PASSWORD=your-app-password

# Verify environment properties
eb printenv
```

**Step 5: Run Migrations**

```bash
# SSH into EB instance
eb ssh

# Navigate to app
cd /var/app/current

# Run migrations
npm run migrate

# Exit
exit
```

---

## Production Deployment

### Pre-Production Verification

```bash
# IMPORTANT: These checks are critical for production

# 1. Verify all tests pass
npm test

# Expected: 0 failures

# 2. Verify no debug code
grep -r "console.log" src/
grep -r "debugger" src/
grep -r "TODO" src/

# Should return nothing

# 3. Verify security
npm audit
# Should have 0 vulnerabilities

# 4. Verify database backups
npm run backup:verify

# 5. Verify monitoring configured
# Check DataDog/NewRelic dashboard

# 6. Test rollback procedure
npm run rollback:test
```

### Production Deployment Steps

**Step 1: Create Release Tag**

```bash
# Update version
npm version major|minor|patch
# Creates git tag automatically

# Push tag to repository
git push origin main
git push origin --tags

# Verify tag created
git tag -l
```

**Step 2: Deploy to Production**

```bash
# Option A: Using CI/CD Pipeline
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions automatically deploys on tag push

# Option B: Manual deployment
git checkout v1.0.0
railway deploy --prod
# OR
heroku git:push heroku main:main -a theatrex-api
```

**Step 3: Run Production Migrations**

```bash
# IMPORTANT: Backup database first
npm run backup:prod

# Run migrations
# SSH into production server
# npm run migrate

# Verify migrations
# npm run migrate:verify
```

**Step 4: Health Checks**

```bash
# Wait 2 minutes for containers to start

# Check API is responding
curl https://api.theatrex.app/health

# Check database
curl https://api.theatrex.app/health/db

# Check migrations
curl https://api.theatrex.app/health/migrations

# Check monitoring
# View DataDog/NewRelic dashboard

# Monitor log errors
# Check error tracking (Sentry)
```

**Step 5: Post-Deployment Monitoring (1 hour)**

```bash
# Monitor:
- Error rate (should be < 0.1%)
- Request latency (p95 < 500ms)
- Database performance
- Memory usage
- CPU usage
- Active connections

# If issues, proceed to rollback
```

---

## Verification Procedures

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

API_URL=${1:-https://api.theatrex.app}

echo "🔍 Checking API health..."

# Check 1: API response
echo -n "✓ API responsive: "
curl -s -o /dev/null -w "%{http_code}" $API_URL/health
echo

# Check 2: Database
echo -n "✓ Database connected: "
curl -s -o /dev/null -w "%{http_code}" $API_URL/health/db
echo

# Check 3: Migrations
echo -n "✓ Migrations applied: "
curl -s -o /dev/null -w "%{http_code}" $API_URL/health/migrations
echo

# Check 4: Redis (optional)
echo -n "✓ Cache available: "
curl -s -o /dev/null -w "%{http_code}" $API_URL/health/redis
echo

echo "✅ All health checks passed!"
```

**Run verification:**

```bash
chmod +x health-check.sh
./health-check.sh https://api-staging.theatrex.app
./health-check.sh https://api.theatrex.app
```

### Performance Verification

```bash
# Response time check
time curl https://api.theatrex.app/api/surgeries

# Should be < 200ms

# Load test (optional)
ab -n 100 -c 10 https://api.theatrex.app/api/surgeries

# Expected:
# - Requests/second > 100
# - Failed requests: 0
```

---

## Monitoring & Alerting

### Application Monitoring

**Use DataDog or New Relic:**

1. Install agent in application:
```bash
npm install dd-trace
# or
npm install newrelic
```

2. Configure in server.js:
```javascript
if (process.env.NODE_ENV === 'production') {
  require('dd-trace').init();
  // or
  require('newrelic');
}
```

3. Monitor metrics:
- Request count
- Error rate
- Response time (p50, p95, p99)
- Database query time
- Memory usage
- CPU usage

### Error Tracking

**Use Sentry:**

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Alerting

```
Alert on:
- Error rate > 1%
- Response time p95 > 1s
- Database query time > 500ms
- Out of memory warning
- Pod restart > 3 in 30 min

Send alerts to:
- Slack #alerts channel
- Email oncall@theatrex.app
- PagerDuty (for critical issues)
```

---

## Rollback Procedures

### Quick Rollback (Emergency)

```bash
# If deployment causes critical issues:

# Option 1: Heroku
heroku releases -a theatrex-api
heroku rollback -a theatrex-api

# Option 2: Railway
railway rollback <previous-deployment-id>

# Option 3: Kubernetes
kubectl rollout undo deployment/theatrex-api

# Verify rollback
curl https://api.theatrex.app/health
```

### Database Rollback

```bash
# If migrations cause issues:

# Create backup of current state
npm run backup:prod

# List applied migrations
npm run migrate:status

# Rollback specific migration
npm run migrate:rollback --migration=<name>

# Verify schema
npm run migrate:verify
```

### Step-by-Step Rollback

```bash
# 1. Stop deployments
kubectl scale deployment theatrex-api --replicas=0

# 2. Identify issues
# Check logs, errors, monitoring

# 3. Prepare rollback
# Test rollback on staging
npm run migrate:rollback --staging

# 4. Execute rollback
npm run migrate:rollback --prod

# 5. Restart application
kubectl scale deployment theatrex-api --replicas=3

# 6. Verify
curl https://api.theatrex.app/health

# 7. Notify team
# Post rollback notification in Slack
```

---

## Post-Deployment Checklist

### 1. Monitor for 24 hours

- [ ] Error rate stable (< 0.1%)
- [ ] Response times normal (p95 < 500ms)
- [ ] Database performance good
- [ ] No memory leaks
- [ ] No spike in CPU usage
- [ ] All scheduled jobs running

### 2. Verify Data Integrity

- [ ] User accounts working
- [ ] All surgeries accessible
- [ ] Notifications sending
- [ ] Reports generating
- [ ] Exports working

### 3. Check External Services

- [ ] Email sending
- [ ] SMS notifications
- [ ] Payment processing (if applicable)
- [ ] Third-party integrations
- [ ] API keys valid

### 4. Update Documentation

- [ ] Update version number
- [ ] Document deployment procedure
- [ ] Update runbook
- [ ] Record deployment time
- [ ] Note any issues encountered

### 5. Team Communication

- [ ] Notify team of deployment
- [ ] Share deployment notes
- [ ] Answer questions
- [ ] Document lessons learned
- [ ] Schedule post-mortom if issues

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 502 Bad Gateway | App not responding | Check app logs, restart container |
| Database connection timeout | Wrong credentials | Verify DATABASE_URL in environment |
| Migration failed | Schema conflict | Backup, rollback, investigate |
| Out of memory | Memory leak | Check for circular references, restart |
| High response time | DB indexes missing | Create missing indexes, optimize queries |
| Slack alerts failing | Wrong webhook URL | Update SLACK_WEBHOOK environment variable |

---

## Deployment Checklist Template

```markdown
# Deployment Checklist - [VERSION]

**Date:** YYYY-MM-DD
**Deployer:** [Name]
**Environment:** [staging/production]

## Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Database backups created
- [ ] Monitoring configured
- [ ] Team notified

## Deployment
- [ ] Code deployed
- [ ] Migrations applied
- [ ] Environment variables verified
- [ ] Health checks passing
- [ ] Logs reviewed

## Post-Deployment
- [ ] Error rates normal
- [ ] Performance metrics good
- [ ] External services working
- [ ] Documentation updated
- [ ] Team debriefing completed

**Status:** ✅ SUCCESSFUL
```

---

**Last Updated:** March 21, 2025  
**Next Review:** April 18, 2025  
**Maintained By:** DevOps Team

