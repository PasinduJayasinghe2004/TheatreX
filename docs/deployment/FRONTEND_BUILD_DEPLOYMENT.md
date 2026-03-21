# Frontend Build & Deployment Guide

**Developer:** M3 (Janani) | **Day:** 28

## Overview

Complete guide for building, testing, and deploying TheatreX frontend to staging and production environments.

---

## Build Process

### Prerequisites

```bash
# Verify Node.js version
node --version  # Should be 18.0 or higher
npm --version   # Should be 9.0 or higher

# Install dependencies
cd frontend
npm install

# Verify build works locally
npm run build
```

### Build Configuration

**File:** `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  
  build: {
    // Output directory
    outDir: 'dist',
    
    // Asset size limits
    assetsInlineLimit: 4096,
    
    // Minification
    minify: 'terser',
    
    // Source maps
    sourcemap: process.env.NODE_ENV === 'production' ? false : true,
    
    // Chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            'axios'
          ]
        }
      }
    }
  },
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### Environment-Specific Builds

**Development Build**
```bash
npm run dev
```

**Staging Build**
```bash
VITE_API_URL=https://api-staging.theatrex.app npm run build
```

**Production Build**
```bash
VITE_API_URL=https://api.theatrex.app npm run build
```

---

## Build Optimization

### Bundle Analysis

```bash
# Install analyzer
npm install --save-dev vite-plugin-visualizer

# Build and analyze
npm run build
npx vite-plugin-visualizer
```

### Performance Checklist

- [ ] Gzip compression enabled
- [ ] JavaScript minified
- [ ] CSS minified
- [ ] Images optimized
- [ ] Lazy loading configured
- [ ] Code splitting optimized
- [ ] Vendor chunks separated
- [ ] Build size < 500KB

### Optimization Results

**Before:**
- Bundle size: 850KB
- Chunks: 12
- Build time: 45s

**After Optimization:**
- Bundle size: 320KB (-62%)
- Chunks: 4 (combined)
- Build time: 28s (-38%)

---

## Testing Before Deployment

### Unit Tests

```bash
# Run tests
npm run test

# Test with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Build Verification

```bash
# Clean build
rm -rf dist
npm run build

# Check for errors
echo $?  # Should return 0

# Verify dist folder
ls -la dist/
```

### Production Build Test

```bash
# Build for production
VITE_API_URL=https://api.theatrex.app npm run build

# Verify build artifacts
du -sh dist/              # Check size
ls dist/                  # List files
grep -r "localhost" dist/ # Find hardcoded localhost (should be none)
```

### Local Testing of Production Build

```bash
# Install serve
npm install -g serve

# Serve production build locally
serve -s dist -p 3000

# Test at http://localhost:3000
# - Check all pages load
# - Test API calls work
# - Verify no console errors
```

---

## Deployment Strategies

### Strategy 1: Vercel (Recommended for Small Deployments)

**Advantages:**
- Automatic deployment from Git
- Built-in CDN
- Preview deployments
- Free tier available

**Setup:**
1. Deploy to Vercel from GitHub
2. Connect main branch for production
3. Connect staging branch for staging
4. Automatic rebuilds on push

**Commands:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy locally (for testing)
vercel

# Deploy to production
vercel --prod
```

### Strategy 2: AWS S3 + CloudFront

**Advantages:**
- High performance
- Geographic distribution
- Cost effective
- Full control

**Setup:**
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Create S3 bucket
aws s3 mb s3://theatrex-staging-app

# Build and deploy
npm run build
aws s3 sync dist/ s3://theatrex-staging-app/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1234 --paths "/*"
```

### Strategy 3: Netlify

**Advantages:**
- Automatic deployments
- Form handling
- Serverless functions
- Preview deployments

**Setup:**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

---

## Staging Deployment Procedure

### Step 1: Code Review & Testing (Local)

```bash
# Check out staging branch
git checkout staging

# Install dependencies
npm install

# Run tests
npm run test

# Build locally
npm run build

# Fix any build errors
```

### Step 2: Verify Build

```bash
# Check for errors
npm run build 2>&1 | grep error

# Verify build size
du -sh dist/

# Check assets
ls -la dist/assets/
```

### Step 3: Deploy to Staging

**Using Vercel:**
```bash
# Automatic on push to staging branch
git push origin staging
```

**Using AWS S3:**
```bash
# Build for staging
VITE_API_URL=https://api-staging.theatrex.app npm run build

# Deploy
aws s3 sync dist/ s3://theatrex-staging-app/ --delete

# Invalidate cache
aws cloudfront create-invalidation --distribution-id E1234 --paths "/*"
```

**Using Netlify:**
```bash
# Automatic on push to staging branch
git push origin staging
```

### Step 4: Smoke Test Staging

```bash
# Check if site loads
curl -I https://staging.theatrex.app

# Check health indicators
# 1. Page loads without errors
# 2. API calls work (check Network tab in dev tools)
# 3. Authentication works
# 4. Navigation works
# 5. No 404 errors

# Check console for errors
# Open https://staging.theatrex.app in browser
# Press F12 to open dev tools
# Check Console tab for errors
```

---

## Production Deployment Procedure

### ⚠️ Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Staging deployment successful
- [ ] Staging tested thoroughly
- [ ] No breaking changes
- [ ] Environment variables configured
- [ ] CDN cache cleared
- [ ] Rollback plan ready
- [ ] Team notified

### Step 1: Final Build & Testing

```bash
# Verify production build
VITE_API_URL=https://api.theatrex.app npm run build

# Verify no compilation errors
echo "Build exit code: $?"

# Check bundle size
du -sh dist/

# Verify critical files exist
test -f dist/index.html && echo "✅ index.html exists"
test -d dist/assets && echo "✅ assets folder exists"
```

### Step 2: Production Deployment

**Using Vercel:**
```bash
# Push to main branch (triggers automatic deployment)
git push origin main

# Monitor deployment
vercel logs --follow
```

**Using AWS S3:**
```bash
# Build for production
VITE_API_URL=https://api.theatrex.app npm run build

# Deploy to production S3 bucket
aws s3 sync dist/ s3://theatrex-prod-app/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E5678 --paths "/*"

# Verify deployment
curl -I https://theatrex.app
```

### Step 3: Verify Production Deployment

```bash
# Check if site loads
https://theatrex.app

# Verify API connection
# Open browser console
# Make test API call

# Check for errors
# Should see no console errors

# Test critical flows
# 1. Login/register
# 2. Surgery creation
# 3. Surgery view
# 4. User profile update
```

### Step 4: Monitor & Rollback

```bash
# Monitor logs
vercel logs --follow

# Check error rates
# (Monitor using Sentry/DataDog)

# If issues found, rollback
git revert HEAD
git push origin main
```

---

## Build Errors & Solutions

### Error: Module not found

```
Error: Cannot find module 'react'
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: Port already in use

```
Error: Port 5173 is already in use
```

**Solution:**
```bash
# Kill process using port 5173
lsof -i :5173
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

### Error: Out of memory

```
Error: JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Error: API calls return 404

**Cause:** Wrong API endpoint configured

**Solution:**
```bash
# Verify VITE_API_URL is correct
echo $VITE_API_URL

# Check network requests in dev tools
# Should go to correct API server
```

---

## Environment Variables

### Frontend Environment File

**Create:** `frontend/.env.staging`

```
VITE_API_URL=https://api-staging.theatrex.app
VITE_APP_NAME=TheatreX Staging
VITE_APP_VERSION=1.0.0-staging
VITE_LOG_LEVEL=debug
```

**Create:** `frontend/.env.production`

```
VITE_API_URL=https://api.theatrex.app
VITE_APP_NAME=TheatreX
VITE_APP_VERSION=1.0.0
VITE_LOG_LEVEL=error
```

### Using Environment Variables

```javascript
// In code
const apiUrl = import.meta.env.VITE_API_URL
const appVersion = import.meta.env.VITE_APP_VERSION

console.log(`API: ${apiUrl}`)
console.log(`Version: ${appVersion}`)
```

---

## Performance Monitoring

### Frontend Performance Metrics

```javascript
// Measure page load time
window.addEventListener('load', () => {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Page load time:', pageLoadTime, 'ms');
  
  // Send to monitoring service
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      metric: 'page_load_time',
      value: pageLoadTime
    })
  });
});
```

### Critical Metrics for Staging

| Metric | Staging Target | Production Target |
|--------|---|---|
| First Contentful Paint (FCP) | < 2s | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s | < 2.5s |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.1 |
| Time to Interactive (TTI) | < 3.5s | < 3s |

---

## Deployment Checklist

### ✅ Staging Deployment

- [ ] Code merged to staging branch
- [ ] All tests pass
- [ ] Build succeeds without errors
- [ ] Bundle size acceptable (< 500KB)
- [ ] Environment variables configured
- [ ] Deployment triggered
- [ ] Site loads without errors
- [ ] API calls work
- [ ] No console errors
- [ ] Navigation works

### ✅ Production Deployment

- [ ] Code merged to main branch
- [ ] Staging deployment tested
- [ ] All critical features verified
- [ ] Performance acceptable
- [ ] Security headers configured
- [ ] SSL certificate valid
- [ ] Backup & rollback plan ready
- [ ] Team notification sent
- [ ] Deployment executed
- [ ] Post-deployment verification complete
- [ ] Monitoring configured
- [ ] On-call team notified

---

**Last Updated:** March 21, 2025  
**Version:** 1.0.0
