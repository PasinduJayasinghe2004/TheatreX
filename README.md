# TheatreX Operating Theatre Management System

**Version:** 1.0.0 | **Status:** 🚀 Production Live | **Last Updated:** March 21, 2026

> A comprehensive operating theatre management system for hospitals to efficiently manage surgeries, theatre operations, staff scheduling, and patient records.

[![Frontend CI](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/backend-ci.yml)
[![Full CI Pipeline](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/full-ci.yml/badge.svg)](https://github.com/PasinduJayasinghe2004/SDGP-Project/actions/workflows/full-ci.yml)

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Architecture](#-architecture)
4. [Technology Stack](#-technology-stack)
5. [Documentation](#-documentation)
6. [Getting Started](#-getting-started)
7. [Project Structure](#-project-structure)
8. [API Endpoints](#-api-endpoints)
9. [CI/CD Pipeline](#-cicd-pipeline)
10. [Development Guide](#-development-guide)
11. [Deployment](#-deployment)
12. [Contributing](#-contributing)
13. [Support](#-support)

---

## 📋 Project Overview

**TheatreX** is an enterprise-grade Operating Theatre Management System designed to:

- ✅ **Schedule and Manage Surgeries** - Efficient scheduling with conflict detection
- ✅ **Optimize Theatre Resources** - Real-time availability tracking and allocation
- ✅ **Manage Staff Operations** - Schedule surgeons, nurses, anaesthetists, technicians
- ✅ **Maintain Patient Records** - Comprehensive medical histories with security
- ✅ **Automate Notifications** - Patient reminders and system alerts
- ✅ **Generate Analytics** - Performance metrics and compliance reports

### Target Users

- Hospital Administrators
- Theatre Managers
- Surgeons and Medical Staff
- Nurses and Technicians
- Patients
- Hospital Receptionists

---

## ⭐ Key Features

### Surgery Management
- Create and schedule surgeries with full conflict detection
- Automatic surgeon and theatre assignment
- Real-time status tracking
- Medical history integration for patient safety
- Emergency surgery prioritization
- Complete audit trail

### Theatre Operations
- Theatre status monitoring (Available/In Use/Cleaning/Maintenance)
- Equipment inventory management
- Preventive maintenance scheduling
- Cleaning record tracking
- Theatre utilization analytics
- Equipment status alerts

### Staff Management
- Manage surgeons, nurses, anaesthetists, technicians
- Schedule staff with conflict prevention
- Track qualifications and certifications
- Leave and availability management
- Performance analytics
- Role-based access control

### Patient Management
- Complete patient profiles with medical history
- Allergy and medication tracking
- Surgery history maintenance
- Data export capabilities
- HIPAA compliance
- Privacy protection

### Notification System
- Automated surgery reminders (24-48 hours)
- Multi-channel delivery (Email, SMS, In-app)
- Bulk notification capability
- Preference management
- Delivery tracking

### Analytics & Reporting
- Surgery statistics and trends
- Theatre utilization reports
- Staff performance metrics
- Equipment maintenance tracking
- System performance monitoring
- Custom report generation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)               │
│  ├── Authentication Pages                               │
│  ├── Surgery Management Dashboard                       │
│  ├── Theatre Operations Interface                       │
│  ├── Staff Management Module                            │
│  ├── Patient Records Interface                          │
│  ├── Analytics & Reports                                │
│  └── Settings & Configuration                           │
└───────────────────┬─────────────────────────────────────┘
                    │ REST API / Axios
┌───────────────────▼─────────────────────────────────────┐
│                Backend (Node.js + Express)              │
│  ├── Authentication API (JWT + 2FA)                     │
│  ├── Surgery Management API                             │
│  ├── Theatre Management API                             │
│  ├── Staff Management API (4 types)                     │
│  ├── Patient Management API                             │
│  ├── Notification Service                               │
│  ├── Analytics Engine                                   │
│  ├── Middleware (Auth, Security, Rate Limiting)         │
│  └── Error Handling & Validation                        │
└───────────────────┬─────────────────────────────────────┘
                    │ SQL Queries
┌───────────────────▼─────────────────────────────────────┐
│         Database (PostgreSQL + Neon)                    │
│  ├── Users & Sessions                                   │
│  ├── Surgeries & Schedules                              │
│  ├── Theatres & Equipment                               │
│  ├── Staff Records                                      │
│  ├── Patients & Medical History                         │
│  ├── Notifications                                      │
│  └── Audit Logs                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.0+ | UI Framework |
| Vite | 7.2.4+ | Build tool |
| React Router | 6.21.1+ | Navigation |
| Axios | 1.6.5+ | HTTP Client |
| Lucide React | Latest | Icon Library |
| Tailwind CSS | Latest | Styling |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18.0+ | Runtime |
| Express | 4.18.2+ | Web Framework |
| PostgreSQL | Latest | Database |
| Prisma | Latest | ORM |
| JWT | Latest | Authentication |
| bcryptjs | 2.4.3+ | Password Hashing |

### DevOps & Tools
| Technology | Purpose |
|-----------|---------|
| GitHub Actions | CI/CD Pipeline |
| Docker | Containerization |
| Vercel/Railway | Deployment |
| Neon | Managed PostgreSQL |

---

## 📚 Documentation

### User Documentation
- **[Complete User Guide](./docs/user-manuals/COMPLETE_USER_GUIDE.md)** - Comprehensive guide for all users
- **[Theatre User Manual](./docs/user-manuals/THEATRE_USER_MANUAL.md)** - Theatre operations guide
- **[Staff User Manual](./docs/user-manuals/STAFF_USER_MANUAL.md)** - Staff management guide
- **[Patient User Manual](./docs/user-manuals/PATIENT_USER_MANUAL.md)** - Patient management guide

### Developer Documentation
- **[Setup Guide](./docs/guides/SETUP_GUIDE.md)** - Complete setup instructions
- **[Feature Guide](./docs/guides/FEATURE_GUIDE.md)** - Feature overview and usage
- **[API Documentation](./docs/api/)** - Complete API reference
  - [Authentication API](./docs/api/AUTH_API.md)
  - [Surgery API](./docs/api/SURGERY_API.md)
  - [Theatre API](./docs/api/THEATRE_API.md)
  - [Staff API](./docs/api/STAFF_API.md)
  - [Patient & Notification API](./docs/api/PATIENT_NOTIFICATION_API.md)
- **[Postman Collection](./docs/api/POSTMAN_COLLECTION.json)** - Import to Postman

### Module Documentation
- **[Authentication Module](./docs/AUTH_PAGES_README.md)**
- **[Surgery Module](./docs/SURGERY_README.md)**
- **[Theatre Module](./docs/THEATRE_README.md)**
- **[Staff Module](./docs/STAFF_README.md)**
- **[Patient & Notification Module](./docs/PATIENT_NOTIFICATION_README.md)**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn
- PostgreSQL database
- Git

### Quick Start

**1. Clone Repository**
```bash
git clone https://github.com/PasinduJayasinghe2004/SDGP-Project.git
cd SDGP-Project
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env    # Update with your database credentials
npm run dev
```

**3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

**4. Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

> For detailed setup instructions, see [Setup Guide](./docs/guides/SETUP_GUIDE.md)

---

## 🏗️ Project Structure

```
SDGP-Project/
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── pages/                    # Page components
│   │   │   ├── AuthPages/            # Login, Register, Password Reset
│   │   │   ├── Surgery/              # Surgery management pages
│   │   │   ├── Theatre/              # Theatre management pages
│   │   │   ├── Staff/                # Staff management pages
│   │   │   ├── Patient/              # Patient management pages
│   │   │   └── Dashboard/            # Main dashboard
│   │   ├── components/               # Reusable components
│   │   ├── utils/                    # Utility functions
│   │   ├── styles/                   # CSS and styling
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Node.js + Express API
│   ├── controllers/                  # Request handlers
│   │   ├── authController.js
│   │   ├── surgeryController.js
│   │   ├── theatreController.js
│   │   ├── staffController.js
│   │   └── patientController.js
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js
│   │   ├── surgeryRoutes.js
│   │   ├── theatreRoutes.js
│   │   ├── staffRoutes.js
│   │   └── patientRoutes.js
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js
│   │   ├── security.js
│   │   └── errorHandler.js
│   ├── models/                       # Database models
│   ├── config/                       # Configuration
│   ├── constants/                    # Constants and enums
│   ├── server.js                     # Entry point
│   ├── package.json
│   └── .env.example
│
├── docs/                              # Documentation
│   ├── api/                          # API documentation
│   │   ├── AUTH_API.md
│   │   ├── SURGERY_API.md
│   │   ├── THEATRE_API.md
│   │   ├── STAFF_API.md
│   │   ├── PATIENT_NOTIFICATION_API.md
│   │   └── POSTMAN_COLLECTION.json
│   ├── guides/                       # Setup and feature guides
│   │   ├── SETUP_GUIDE.md
│   │   └── FEATURE_GUIDE.md
│   ├── user-manuals/                 # User guides
│   │   ├── COMPLETE_USER_GUIDE.md
│   │   ├── THEATRE_USER_MANUAL.md
│   │   ├── STAFF_USER_MANUAL.md
│   │   └── PATIENT_USER_MANUAL.md
│   └── module-readmes/               # Module documentation
│       ├── AUTH_PAGES_README.md
│       ├── SURGERY_README.md
│       ├── THEATRE_README.md
│       ├── STAFF_README.md
│       └── PATIENT_NOTIFICATION_README.md
│
├── .github/workflows/                 # CI/CD workflows
│   ├── frontend-ci.yml
│   ├── backend-ci.yml
│   └── full-ci.yml
│
├── README.md                          # This file
└── package.json
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication (16 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/profile` | Get current user profile |
| PUT | `/auth/profile` | Update user profile |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/sessions` | Get active sessions |
| POST | `/auth/logout-others` | Logout other sessions |
| POST | `/auth/2fa/enable` | Enable two-factor auth |
| POST | `/auth/2fa/verify` | Verify 2FA code |
| GET | `/auth/export-data` | Export user data |
| DELETE | `/auth/account` | Delete account |

### Surgery Management (18 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/surgeries` | Create surgery |
| GET | `/surgeries` | Get all surgeries |
| GET | `/surgeries/:id` | Get surgery details |
| PUT | `/surgeries/:id` | Update surgery |
| PATCH | `/surgeries/:id/status` | Update status |
| PATCH | `/surgeries/:id/assign-theatre` | Assign theatre |
| GET | `/surgeries/unassigned` | Get unassigned surgeries |
| GET | `/surgeries/history` | Get surgery history |
| GET | `/surgeries/calendar/events` | Get calendar events |
| POST | `/surgeries/check-conflicts` | Check scheduling conflicts |
| DELETE | `/surgeries/:id` | Delete surgery |

### Theatre Management (16 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/theatres` | Create theatre |
| GET | `/theatres` | Get all theatres |
| GET | `/theatres/:id` | Get theatre details |
| PUT | `/theatres/:id` | Update theatre |
| POST | `/theatres/:id/equipment` | Add equipment |
| PUT | `/theatres/:id/equipment/:equipId` | Update equipment |
| GET | `/theatres/:id/availability` | Check availability |
| GET | `/theatres/:id/schedule` | Get schedule |
| POST | `/theatres/:id/maintenance` | Schedule maintenance |
| POST | `/theatres/:id/cleaning` | Add cleaning record |
| GET | `/theatres/:id/statistics` | Get statistics |
| DELETE | `/theatres/:id` | Delete theatre |

### Staff Management (6 endpoints × 4 types = 24 endpoints)
**Types:** Surgeons, Nurses, Anaesthetists, Technicians

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/{type}` | Create staff member |
| GET | `/{type}` | Get all staff |
| GET | `/{type}/:id` | Get staff details |
| PUT | `/{type}/:id` | Update staff |
| GET | `/{type}/:id/schedule` | Get schedule |
| DELETE | `/{type}/:id` | Delete staff |

### Patient Management (10 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients` | Create patient |
| GET | `/patients` | Get all patients |
| GET | `/patients/:id` | Get patient details |
| PUT | `/patients/:id` | Update patient |
| POST | `/patients/:id/conditions` | Add condition |
| POST | `/patients/:id/allergies` | Add allergy |
| POST | `/patients/:id/medications` | Add medication |
| GET | `/patients/:id/surgeries` | Get surgery history |
| GET | `/patients/:id/export` | Export data |
| DELETE | `/patients/:id` | Delete patient |

### Notifications (9 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications` | Create notification |
| GET | `/notifications` | Get notifications |
| GET | `/notifications/:id` | Get notification |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/:id/archive` | Archive |
| GET | `/notifications/statistics` | Get stats |
| POST | `/notifications/bulk-send` | Bulk send |
| PUT | `/notifications/preferences` | Update preferences |
| DELETE | `/notifications/:id` | Delete notification |

**Total:** 99+ documented endpoints

> See [API Documentation](./docs/api/) for detailed endpoint specifications with request/response examples.

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflows

**Frontend CI Workflow**
- Runs on: Push/PR to main/develop branches (frontend changes)
- Steps:
  - Install dependencies
  - Run ESLint
  - Build production bundle
  - Run tests
  - Upload artifacts

**Backend CI Workflow**
- Runs on: Push/PR to main/develop branches (backend changes)
- Steps:
  - Install dependencies
  - Run tests
  - Security audit
  - Verify configuration

**Full CI Pipeline**
- Runs on: Any push/PR to main/develop
- Steps:
  - Run frontend CI
  - Run backend CI in parallel
  - Provide combined status

### Manual Workflow Triggers
1. Go to **Actions** tab in GitHub
2. Select workflow
3. Click **Run workflow**
4. Confirm branch and trigger

---

## 🛠️ Development Guide

### Frontend Development

**Start Development Server**
```bash
cd frontend
npm install
npm run dev
```

**Build for Production**
```bash
npm run build
```

**Run Linting**
```bash
npm run lint
```

### Backend Development

**Start Development Server**
```bash
cd backend
npm install
npm run dev          # With live reload (nodemon)
```

**Run Tests**
```bash
npm test
```

**Database Migrations**
```bash
npm run migrate      # Apply migrations
npm run seed         # Seed test data
```

### Code Standards

- ESLint configuration for JavaScript
- Prettier for code formatting
- Git hooks for pre-commit checks
- Conventional commit messages
- Branch naming: `feature/*`, `bugfix/*`, `hotfix/*`

---

## 📤 Deployment

> **STATUS:** ✅ LIVE IN PRODUCTION (Deployed Day 30, March 21, 2026)

### Live URLs

- **Frontend:** [TheatreX Application](https://theatrex-frontend.vercel.app)
- **Backend API:** [TheatreX API](https://theatrex-backend.railway.app)

### Quick Deploy

For detailed deployment instructions, see:
- 📖 **[Day 30 Deployment Guide](./DAY_30_DEPLOYMENT_GUIDE.md)** - Complete step-by-step guide
- ✅ **[Deployment Checklist](./DAY_30_DEPLOYMENT_CHECKLIST.md)** - Pre-launch verification checklist
- 🔧 **[Production Configuration](./PRODUCTION_CONFIG.md)** - Environment variables and setup

### Frontend Deployment

**Vercel Deployment (Recommended)**
```bash
# 1. Connect GitHub repository to Vercel
# 2. Configure environment variables
VITE_API_URL=https://your-backend-deployed-url.com
VITE_APP_NAME=TheatreX

# 3. Deploy from main branch
# Automatic on push or manual via dashboard
```

**Build & Preview**
```bash
cd frontend
npm install
npm run build  # Creates optimized dist/ folder
npm run preview  # Preview production build locally
```

### Backend Deployment

**Railway Deployment (Recommended)**
```bash
# 1. Create Railway project
# 2. Connect GitHub repository
# 3. Configure environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=<secure-32-character-string>
CORS_ORIGINS=https://your-frontend-domain.com
RESEND_API_KEY=your-api-key
GEMINI_API_KEY=your-api-key
NODE_ENV=production
PORT=5000

# 4. Deploy
# Automatic on push to main branch
```

**Test Deployment**
```bash
cd backend
npm install --production
npm start
# Server runs on http://localhost:5000
```

### Production Environment Variables

**Backend (.env.production)**
```env
# Core Configuration
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host/database

# Security
JWT_SECRET=your-secure-32-character-minimum-secret
SESSION_SECRET=another-secure-secret
CORS_ORIGINS=https://your-frontend.com

# External APIs
RESEND_API_KEY=your-resend-api-key
GEMINI_API_KEY=your-gemini-api-key

# Logging
LOG_LEVEL=info
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://your-backend-deployed-url.com
VITE_APP_NAME=TheatreX
VITE_ENABLE_CHARTS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true
```

### Post-Deployment Verification

```bash
# Run verification tests
node backend/scripts/verify-production.js https://backend-url https://frontend-url

# Expected output: ✅ ALL TESTS PASSED - DEPLOYMENT VERIFIED!
```

### Monitoring & Support

Once deployed:
- ✅ Monitor dashboard: Railway/Vercel dashboard
- ✅ Check logs: Platform-specific logging
- ✅ Health endpoints: `/health` and `/api/health`
- ✅ Performance: Monitor response times and error rates
- ✅ On-call support: See [Day 30 Launch Report](./DAY_30_LAUNCH_REPORT.md#-support--escalation)

---

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Review Process
- All PRs require review
- Maintain 80%+ test coverage
- Follow code standards
- Update documentation

### Reporting Issues
- Use GitHub Issues
- Include detailed description
- Provide reproduction steps
- Attach relevant logs/screenshots

---

## 💬 Support

### Getting Help

**Documentation**
- See [Setup Guide](./docs/guides/SETUP_GUIDE.md) for installation
- Check [API Documentation](./docs/api/) for endpoint details
- Review [Complete User Guide](./docs/user-manuals/COMPLETE_USER_GUIDE.md) for usage

**Contact Support**
- Email: support@theatrex.app
- GitHub Issues: Create an issue
- In-app Help: Click help icon in application

### FAQs

**Q: How do I get started?**
A: Follow the [Setup Guide](./docs/guides/SETUP_GUIDE.md) for step-by-step instructions.

**Q: Where is the API documentation?**
A: See [API Documentation](./docs/api/) folder with complete endpoint specs.

**Q: How do I report a bug?**
A: Create a GitHub Issue with details and reproduction steps.

**Q: Can I contribute?**
A: Yes! See Contributing section above.

---

## 📜 License

ISC License - See LICENSE file for details

---

## 👥 Team & Contributors

**Development Team:** SDGP Project Contributors

**Module Leads:**
- M1: Authentication & Setup
- M2: Surgery Management  
- M3: Theatre Management
- M4: Staff Management
- M5: Patient & Notifications
- M6: Integration & Documentation

---

## 🙏 Acknowledgments

- PostgreSQL & Neon for database
- Express.js community
- React community
- All contributors and supporters

---

**Last Updated:** March 21, 2025  
**Current Version:** 1.0.0  
**Status:** Active Development

For the latest updates, visit our [GitHub Repository](https://github.com/PasinduJayasinghe2004/SDGP-Project)

