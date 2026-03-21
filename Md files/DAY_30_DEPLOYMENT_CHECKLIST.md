# 🎯 DAY 30 - Production Deployment Checklist

**Date:** March 21, 2026  
**Project:** TheatreX Operating Theatre Management System  
**Status:** FINAL DEPLOYMENT

---

## Overview

This checklist ensures all critical items are verified before launching TheatreX to production. Complete all items systematically.

---

## PRE-DEPLOYMENT VERIFICATION (Day 29)

### Code Quality

- [ ] All tests passing
  ```bash
  cd backend && npm test
  cd ../frontend && npm test
  ```
- [ ] No critical security vulnerabilities
  ```bash
  npm audit
  ```
- [ ] Linting passes
  ```bash
  npm run lint
  ```
- [ ] No console.error in production build
- [ ] All console.log removed (or wrapped in conditional)
- [ ] No hardcoded sensitive data in code

### Build Verification

- [ ] **Backend**
  - [ ] `npm start` runs without errors
  - [ ] Server listens on correct port
  - [ ] Health endpoint responds
  
- [ ] **Frontend**
  - [ ] `npm run build` completes successfully
  - [ ] `dist/` folder created with all assets
  - [ ] `npm run preview` loads app
  - [ ] All routes accessible
  - [ ] API calls use environment variable (not hardcoded)

### Git & Version Control

- [ ] All changes committed
  ```bash
  git status  # Should show clean working directory
  ```
- [ ] Latest changes pushed to main
  ```bash
  git push origin main
  ```
- [ ] Release tag created
  ```bash
  git tag -a v1.0.0 -m "TheatreX Production Release"
  git push origin v1.0.0
  ```
- [ ] Branch protection rules enabled
  - [ ] Require pull request reviews
  - [ ] Require status checks to pass
  - [ ] Require branches to be up to date

---

## INFRASTRUCTURE SETUP (Morning - M1-M5)

### M1: Production Server Setup

- [ ] Deployment platform account created (Railway/Render)
- [ ] Project created in platform
- [ ] GitHub repository connected
- [ ] Service created for backend
- [ ] Build command configured: `npm run build` or `npm install`
- [ ] Start command configured: `npm start`
- [ ] Auto-deploy on push enabled
- [ ] Deployment logs visible and monitored
- [ ] Server URL obtained (e.g., https://theatrex-prod.railway.app)

### M2: Frontend Build & Deployment

- [ ] Vercel account created (or Render/Railway)
- [ ] Project connected to GitHub
- [ ] Frontend folder specified as root
- [ ] Build command set: `npm run build`
- [ ] Output directory set: `dist`
- [ ] Environment variables configured (VITE_API_URL)
- [ ] Deployment successful
- [ ] Frontend URL obtained (e.g., https://theatrex-prod.vercel.app)
- [ ] Build preview working

### M3: Production Database Setup

- [ ] Production PostgreSQL created (Neon/Railway)
- [ ] Credentials securely stored
- [ ] Connection string obtained
- [ ] Database initialized with schema
  ```bash
  # Run database initialization script
  psql [CONNECTION_STRING] < init-schema.sql
  ```
- [ ] All tables created
- [ ] Indexes created
- [ ] Backups enabled
- [ ] Connection tested
  ```bash
  psql [CONNECTION_STRING] -c "SELECT version();"
  ```

### M4: DNS & Domain Configuration

- [ ] Custom domain registered (optional)
  - [ ] Domain registrar selected (GoDaddy, Namecheap, etc.)
  - [ ] Domain purchased and registered
  - [ ] DNS management access obtained

- [ ] Domain pointed to deployment
  - [ ] CNAME records configured (if using custom domain)
  - [ ] DNS propagation verified (24-48 hours)
  - [ ] SSL certificate auto-generated
  - [ ] HTTPS working

- [ ] Or use platform-provided domain
  - [ ] Railway URL: `https://code-railway.app`
  - [ ] Vercel URL: `https://theatrex-prod.vercel.app`

### M5: SSL Certificate & Security

- [ ] HTTPS enabled
  - [ ] SSL certificate issued (auto via Let's Encrypt/platform)
  - [ ] Green lock appears in browser
  - [ ] Mixed content warnings resolved

- [ ] Security headers configured
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Strict-Transport-Security (HSTS)
  - [ ] Content-Security-Policy

- [ ] CORS configured correctly
  - [ ] CORS_ORIGINS set to actual frontend domain
  - [ ] Credentials allowed: `Access-Control-Allow-Credentials: true`
  - [ ] Proper methods allowed

---

## ENVIRONMENT CONFIGURATION (Morning)

### Backend Environment Variables

```bash
# Verify all variables set in production
```

- [ ] NODE_ENV=production
- [ ] PORT=5000
- [ ] DATABASE_URL=correct_production_db_url
- [ ] JWT_SECRET=secure_32_char_minimum
- [ ] SESSION_SECRET=secure_secret
- [ ] CORS_ORIGINS=https://frontend-domain.com
- [ ] RESEND_API_KEY=production_key
- [ ] GEMINI_API_KEY=production_key
- [ ] LOG_LEVEL=info
- [ ] RATE_LIMIT config set

**Verification:**
```bash
# In Railway/Render dashboard: Services → Backend → Variables
# Verify all required variables present
```

### Frontend Environment Variables

```bash
# Verify all variables set in production
```

- [ ] VITE_API_URL=https://backend-deployed-url.com
- [ ] VITE_APP_NAME=TheatreX
- [ ] VITE_ENABLE_CHARTS=true
- [ ] VITE_ENABLE_NOTIFICATIONS=true
- [ ] VITE_ENABLE_EXPORT=true

**Verification:**
```bash
# In Vercel/Railway dashboard: Settings → Environment
# Verify all required variables present
```

---

## DEPLOYMENT EXECUTION (Afternoon - M1-M2)

### M1: Backend Deployment

**Automatic Deployment (preferred):**
```bash
# Just push to main - platform auto-deploys
git push origin main

# Monitor in platform dashboard:
# - Build log should show "Build successful"
# - Deployment should complete in 2-5 minutes
# - Server should start successfully
```

**Deployment Checklist:**
- [ ] Latest commit visible in deployment
- [ ] Build status: ✅ Successful
- [ ] Build time noted (should be < 5 minutes)
- [ ] Deployment logs show no errors
- [ ] Server status: ✅ Running
- [ ] Health endpoint responds
- [ ] Backend URL working: `curl https://backend-url/health`

**Post-Deployment:**
```bash
# Test backend endpoints
curl https://backend-url/health
curl https://backend-url/api/surgeries  # May return 401, that's OK
curl https://backend-url/api/health
```

- [ ] Status code: 200
- [ ] Response is valid JSON
- [ ] CORS headers present
- [ ] Response time < 500ms

### M2: Frontend Deployment

**Automatic Deployment (preferred):**
```bash
# Push to main - Vercel auto-deploys
git push origin main

# Monitor in Vercel dashboard:
# - Build should complete in 2-10 minutes
# - Production deployment badge should show ✅
```

**Before Frontend Deployment:**
- [ ] Backend URL finalized
- [ ] VITE_API_URL updated in Vercel environment
- [ ] Frontend rebuild triggered (or pushed new commit)

**Deployment Checklist:**
- [ ] Build status: ✅ Successful
- [ ] Build time noted
- [ ] Preview URL working
- [ ] Production URL working: `https://frontend-url`
- [ ] App loads in browser
- [ ] No 404 errors
- [ ] No console errors

**Post-Deployment:**
```bash
# Test frontend
curl https://frontend-url
# Should return HTML content
```

---

## POST-DEPLOYMENT VERIFICATION (Afternoon - M3-M5)

### M3: Verify Deployment Completeness

```bash
# 1. Backend Health Check
curl https://backend-url/health
# Expect: { "status": "OK", ... }

# 2. Database Connection
curl https://backend-url/api/surgeries
# Expect: 401 (unauthorized) or array of surgeries

# 3. CORS Headers
curl -H "Origin: https://frontend-url" https://backend-url
# Expect: Access-Control-Allow-Origin header

# 4. Database Direct Check (if CLI available)
psql [DATABASE_URL] -c "SELECT COUNT(*) FROM users;"
# Expect: (1 row) with count value
```

**Verification Checklist:**
- [ ] Backend is online and responsive
- [ ] Database is connected
- [ ] CORS is properly configured
- [ ] Health endpoints return 200
- [ ] All tables exist in database
- [ ] No error messages in logs

### M4: Test User Journeys

**Test 1: Guest Access**
- [ ] Visit https://frontend-url ✅ Page loads
- [ ] See landing page ✅
- [ ] Can see public content ✅
- [ ] Navigation works ✅

**Test 2: User Registration**
- [ ] Click "Register" ✅
- [ ] Fill registration form ✅
- [ ] Submit registration ✅
- [ ] Success message appears ✅
- [ ] Redirect to login ✅
- [ ] Verify in database:
  ```bash
  psql [DATABASE_URL] -c "SELECT email FROM users ORDER BY created_at DESC LIMIT 1;"
  ```
- [ ] User record exists ✅

**Test 3: User Login**
- [ ] Click "Login" ✅
- [ ] Enter credentials ✅
- [ ] Submit login ✅
- [ ] Redirect to dashboard ✅
- [ ] Token in browser localStorage ✅
- [ ] User name displayed ✅

**Test 4: Create Surgery**
- [ ] Login as doctor/surgeon ✅
- [ ] Navigate to "Create Surgery" ✅
- [ ] Fill surgery form ✅
- [ ] Submit form ✅
- [ ] Success notification ✅
- [ ] Surgery in list ✅
- [ ] Verify in database:
  ```bash
  psql [DATABASE_URL] -c "SELECT id, title FROM surgeries ORDER BY created_at DESC LIMIT 1;"
  ```

**Test 5: View Analytics**
- [ ] Login as admin ✅
- [ ] Navigate to Dashboard ✅
- [ ] Charts load correctly ✅
- [ ] Data displays properly ✅
- [ ] Update real-time (if applicable) ✅

**Test 6: Search & Filter**
- [ ] Use search functionality ✅
- [ ] Apply filters ✅
- [ ] Results update correctly ✅
- [ ] Clear filters works ✅

**Test 7: Export Functionality**
- [ ] Click export button (if available) ✅
- [ ] Select export format ✅
- [ ] File downloads successfully ✅
- [ ] File is readable ✅

**Test 8: Responsive Design**
- [ ] Test on mobile (DevTools) ✅
- [ ] Test on tablet (DevTools) ✅
- [ ] Test on desktop ✅
- [ ] All elements visible ✅
- [ ] Touch interactions work ✅

### M5: Performance & Load Testing

**Response Time Checks:**
```bash
# Repeat each query 5 times and average

# Backend health
time curl https://backend-url/health
# Should be: < 200ms

# API request
time curl https://backend-url/api/surgeries
# Should be: < 500ms

# Frontend load
time curl https://frontend-url
# Should be: < 1000ms
```

**Performance Checklist:**
- [ ] Backend responds in < 500ms ✅
- [ ] Frontend loads in < 3 seconds ✅
- [ ] Database queries < 100ms ✅
- [ ] No timeout errors ✅
- [ ] Memory usage stable ✅
- [ ] CPU usage reasonable ✅

**Load Testing (simple):**
```bash
# If Apache Bench available:
ab -n 100 -c 10 https://backend-url/api/surgeries

# Should show:
# - No failed requests (0 failures)
# - Average response time < 500ms
# - Requests per second > 50
```

---

## MONITORING SETUP (Afternoon - M5-M6)

### Monitoring Dashboard

- [ ] Railway/Render dashboard accessible
  - [ ] Can view deployment logs
  - [ ] Can view metrics (CPU, memory)
  - [ ] Can view recent deployments
  - [ ] Can restart service if needed

- [ ] Vercel dashboard accessible
  - [ ] Can view build logs
  - [ ] Can view analytics
  - [ ] Can view deployments
  - [ ] Can trigger redeploy

### Logging Configuration

- [ ] Backend logs accessible
  - [ ] Error logs visible
  - [ ] Request logs visible
  - [ ] Debug logs visible (if enabled)
  - [ ] Can filter by date/level

- [ ] Frontend errors tracked
  - [ ] Console errors visible
  - [ ] API failures logged
  - [ ] User actions tracked (optional)

### Alert Configuration (Optional)

- [ ] Set up alerts for:
  - [ ] Server down (5xx errors)
  - [ ] High CPU (> 80%)
  - [ ] High memory (> 500MB)
  - [ ] Database unavailable
  - [ ] Long response times (> 1s)

### Team Notification

- [ ] Escalation contacts defined
  - [ ] M1: Backend issues
  - [ ] M2: Frontend issues
  - [ ] M3: Database issues
  - [ ] M4-M5: Infrastructure issues
  - [ ] M6: Incident coordination

---

## SECURITY VERIFICATION (M6)

### API Security

- [ ] Authentication required for protected endpoints
  ```bash
  curl https://backend-url/api/admin  # Should return 401
  ```
- [ ] JWT tokens validated
- [ ] RBAC working (different roles have different access)
- [ ] Input validation working (test invalid input)
- [ ] Rate limiting active (test rapid requests)

### Database Security

- [ ] Connection uses SSL/TLS
- [ ] No default credentials
- [ ] Regular backups scheduled
- [ ] Backup verification working
- [ ] Restore procedure documented

### Code Security

- [ ] No secrets exposed in code
  ```bash
  grep -r "password\|secret\|key" . --include="*.js" --include="*.env" | grep -v node_modules
  """
  ```
- [ ] Dependencies checked for vulnerabilities
  ```bash
  npm audit
  ```
- [ ] Environment-specific configs used

### Network Security

- [ ] HTTPS enforced
- [ ] HSTS enabled
- [ ] CSP headers set
- [ ] X-Frame-Options set (clickjacking prevention)

---

## DOCUMENTATION (M6)

### README Updated

- [ ] Features listed
- [ ] Architecture documented
- [ ] Technology stack specified
- [ ] Setup instructions complete
- [ ] Deployment instructions complete
- [ ] API documentation linked
- [ ] Contributing guidelines present

### API Documentation

- [ ] All endpoints documented
- [ ] Request/response examples provided
- [ ] Authentication requirements specified
- [ ] Error codes documented
- [ ] Rate limits documented

### Deployment Documentation

- [ ] Deployment guide created (✅ DAY_30_DEPLOYMENT_GUIDE.md)
- [ ] Environment variables documented (✅ PRODUCTION_CONFIG.md)
- [ ] Troubleshooting guide included
- [ ] Incident response procedure documented
- [ ] Backup and restore documented

### Team Documentation

- [ ] Team members and roles listed
- [ ] On-call rotation documented
- [ ] Escalation procedures documented
- [ ] Post-launch tasks documented

---

## FINAL VERIFICATION (Evening - M6)

### Pre-Launch Checklist

```
BACKEND:
  ✅ [ ] Deployed and running
  ✅ [ ] Health check passing
  ✅ [ ] Database connected
  ✅ [ ] All endpoints tested
  ✅ [ ] Error handling working
  ✅ [ ] Logging active
  ✅ [ ] Monitoring enabled

FRONTEND:
  ✅ [ ] Deployed and running
  ✅ [ ] All pages accessible
  ✅ [ ] API integration working
  ✅ [ ] Authentication working
  ✅ [ ] Responsive design verified
  ✅ [ ] No console errors
  ✅ [ ] Performance acceptable

INFRASTRUCTURE:
  ✅ [ ] Domain/URL working
  ✅ [ ] HTTPS enabled
  ✅ [ ] SSL certificate valid
  ✅ [ ] Security headers present
  ✅ [ ] CORS configured
  ✅ [ ] Database backed up
  ✅ [ ] Monitoring active

DOCUMENTATION:
  ✅ [ ] README complete
  ✅ [ ] API docs complete
  ✅ [ ] Deployment guide complete
  ✅ [ ] Team trained
  ✅ [ ] Incident procedures ready

SECURITY:
  ✅ [ ] No hardcoded secrets
  ✅ [ ] Environment vars secured
  ✅ [ ] Database credentials safe
  ✅ [ ] Audit logging enabled
  ✅ [ ] Backups encrypted (optional)
```

---

## 🎉 LAUNCH APPROVAL

### Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| M1 - Backend Lead | | | |
| M2 - Frontend Lead | | | |
| M3 - Database Lead | | | |
| M4 - Infrastructure | | | |
| M5 - Monitoring | | | |
| M6 - Project Manager | | | |

### Approval Status

- [ ] All checklist items complete
- [ ] All tests passing
- [ ] Team has reviewed deployment
- [ ] Stakeholders notified
- [ ] Users ready for launch

### Launch Decision

```
[ ] APPROVED - Go live now! 🚀
[ ] PENDING - Need to fix issues (document blockers)
[ ] CANCELLED - Not proceeding (document reasons)
```

### Launch Time

**Scheduled Time:** 20:00  
**Time Zone:** UTC  
**Expected Duration:** 30 minutes for final verification

---

## POST-LAUNCH TASKS (Day 31+)

- [ ] Monitor application 24/7 for 48 hours
- [ ] Be on-call for urgent issues
- [ ] Collect initial user feedback
- [ ] Fix any bugs discovered
- [ ] Optimize performance based on real usage
- [ ] Plan Phase 2 improvements
- [ ] Document lessons learned
- [ ] Schedule post-launch retrospective

---

## Deployment Verification Script

```bash
# Run comprehensive post-deployment verification
cd backend
npm install axios  # If not already installed
node scripts/verify-production.js https://backend-url https://frontend-url

# Expected output:
# ✅ ALL TESTS PASSED - DEPLOYMENT VERIFIED!
```

---

## Emergency Rollback Procedure

**If critical issues discovered:**

```bash
# 1. Identify issue
# 2. Document issue and reproduction steps
# 3. Contact on-call engineer
# 4. Prepare rollback

# Rollback Backend (Railway):
# - Go to Railway dashboard
# - Select previous successful build
# - Click "Deploy"
# - Wait for redeploy (2-5 minutes)
# - Verify rollback successful

# Rollback Frontend (Vercel):
# - Go to Vercel dashboard
# - Click previous successful deployment
# - Click "Promote to Production"
# - Wait for deployment (1-2 minutes)
# - Verify rollback successful

# 4. Notify team and stakeholders
# 5. Begin investigation
# 6. Plan re-deployment after fix
```

---

## Resources

- 📖 **Deployment Guide:** [DAY_30_DEPLOYMENT_GUIDE.md](DAY_30_DEPLOYMENT_GUIDE.md)
- 🔧 **Configuration:** [PRODUCTION_CONFIG.md](PRODUCTION_CONFIG.md)
- 🧪 **Verification Script:** `backend/scripts/verify-production.js`
- 📊 **Deployment Scripts:** `scripts/deploy-production.sh` (Linux/Mac) or `.bat` (Windows)

---

**Status: READY FOR DEPLOYMENT** ✅

*Last Updated: March 21, 2026*
