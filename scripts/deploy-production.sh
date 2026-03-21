#!/bin/bash

# TheatreX Production Deployment Script
# This script deploys both backend and frontend to production

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════"
echo "🚀 TheatreX Production Deployment Script"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run from project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-Deployment Checklist${NC}"
echo ""

# Check Node version
NODE_VERSION=$(node -v)
echo -e "✅ Node version: ${GREEN}${NODE_VERSION}${NC}"

# Check if git is clean
if [ -z "$(git status --porcelain)" ]; then
    echo -e "✅ Git working directory: ${GREEN}Clean${NC}"
else
    echo -e "${YELLOW}⚠️  Git has uncommitted changes:${NC}"
    git status --porcelain | head -n 5
    echo -e "${YELLOW}Recommend committing changes before deployment.${NC}"
fi

echo ""
echo -e "${YELLOW}🔄 Building Backend${NC}"
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install --production

# Run tests (optional - remove if tests are flaky)
# echo "Running backend tests..."
# npm test

echo -e "${GREEN}✅ Backend build complete${NC}"
cd ..

echo ""
echo -e "${YELLOW}🔄 Building Frontend${NC}"
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build production bundle
echo "Building production bundle..."
npm run build

echo -e "${GREEN}✅ Frontend build complete${NC}"
cd ..

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Build successful!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}📤 Next Steps:${NC}"
echo ""
echo "1. Backend Deployment (via Railway/Render):"
echo "   - Push main branch: git push origin main"
echo "   - Or manually deploy in Railway/Render dashboard"
echo ""
echo "2. Frontend Deployment (via Vercel):"
echo "   - Push main branch: git push origin main"
echo "   - Or deploy via Vercel dashboard"
echo ""
echo "3. Verification:"
echo "   - Wait for deployments to complete (5-10 minutes)"
echo "   - Run: node backend/scripts/verify-production.js <backend-url> <frontend-url>"
echo ""
echo "4. Configuration:"
echo "   - Ensure environment variables are set in production"
echo "   - Verify CORS_ORIGINS configuration"
echo "   - Check database connection"
echo ""
echo -e "${GREEN}🎉 Deployment ready!${NC}"
