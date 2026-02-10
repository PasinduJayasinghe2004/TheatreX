# SDGP-Project
TheatreX - Operating Theatre Management System

[![Frontend CI](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/backend-ci.yml)
[![Full CI Pipeline](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/full-ci.yml/badge.svg)](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/full-ci.yml)

## 📋 Project Overview

TheatreX is a comprehensive Operating Theatre Management System designed to streamline hospital surgery operations, scheduling, and resource management.

## 🏗️ Project Structure

```
SDGP-Project/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express backend API
├── landing-page/      # Marketing landing page
└── .github/           # GitHub Actions CI/CD workflows
```

## 🚀 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. Three workflows are configured:

### Workflows

1. **Frontend CI** (`frontend-ci.yml`)
   - Triggers on push/PR to `main` or `develop` branches (frontend changes only)
   - Runs ESLint for code quality
   - Builds production bundle
   - Runs tests (if available)
   - Uploads build artifacts

2. **Backend CI** (`backend-ci.yml`)
   - Triggers on push/PR to `main` or `develop` branches (backend changes only)
   - Installs dependencies
   - Runs tests (if available)
   - Performs security audit
   - Verifies server configuration

3. **Full CI Pipeline** (`full-ci.yml`)
   - Triggers on any push/PR to `main` or `develop` branches
   - Runs frontend and backend CI jobs in parallel
   - Provides combined status check

### Manual Workflow Triggers

You can manually trigger any workflow from the GitHub Actions tab:
1. Go to the **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## 🛠️ Development Setup

### Frontend

```bash
cd frontend
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend

```bash
cd backend
npm install
npm run dev          # Start with nodemon
npm start            # Start production server
```

## 📦 Technology Stack

### Frontend
- React 19.2.0
- Vite 7.2.4
- React Router DOM 6.21.1
- Axios 1.6.5
- Lucide React (icons)

### Backend
- Node.js + Express 4.18.2
- MySQL2 3.6.5
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

## 👥 Team

TheatreX Team

## 📄 License

ISC

