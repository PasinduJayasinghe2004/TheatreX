# TheatreX - 30-Day Full-Stack Plan 🚀
## Every Member Works on Frontend + Backend Daily

---

## ⚡ Core Principle

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   EVERY MEMBER = FULL-STACK DEVELOPER                              │
│                                                                    │
│   Morning   →  Backend Tasks (Node.js + Express + MySQL)           │
│   Afternoon →  Frontend Tasks (React + TailwindCSS)                │
│   Evening   →  Integration + Testing + Bug Fixes                   │
│                                                                    │
│   NO SPECIALISTS - EVERYONE LEARNS EVERYTHING                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Team Members

| ID | Member | Role |
|----|--------|------|
| **M1** | Pasindu | Full-Stack + Team Coordination |
| **M2** | Chandeepa | Full-Stack Developer |
| **M3** | Janani | Full-Stack Developer |
| **M4** | Oneli | Full-Stack Developer |
| **M5** | Inthusha | Full-Stack Developer |
| **M6** | Dinil | Full-Stack + QA/Docs |

---

## 🗓️ 30-Day Overview

| Week | Days | Focus |
|------|------|-------|
| **Week 1** | 1-7 | Setup + Authentication + Surgery CRUD |
| **Week 2** | 8-14 | Emergency Booking + Theatre + Staff |
| **Week 3** | 15-21 | Patients + Notifications + Analytics |
| **Week 4** | 22-30 | History + Testing + Polish + Deploy |

---

## 📋 WEEK 1: Foundation + Auth + Surgery (Days 1-7)

---

### 📅 DAY 1 - Project Setup

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Create GitHub repo + branch rules | Initialize React + Vite project | Verify FE runs |
| **M2** | Initialize Express server | Setup React Router (routes file) | Verify BE runs |
| **M3** | Setup MySQL connection | Setup TailwindCSS + config | Test DB connection |
| **M4** | Create `users` table | Create `Button` component | Test component |
| **M5** | Create `surgeries` table | Create `Input` component | Test component |
| **M6** | Create `theatres` table | Create `Card` component | Setup CI/CD |

**End of Day 1 Checklist:**
- [ ] GitHub repo with branch protection ✓
- [ ] React app running on localhost:5173 ✓
- [ ] Express server running on localhost:5000 ✓
- [ ] MySQL database created with 3 tables ✓
- [ ] 3 base UI components ready ✓

---

### 📅 DAY 2 - Database + Components

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Create `patients` table | Create `Modal` component | Test modal |
| **M2** | Create `notifications` table | Create `Select` dropdown | Test select |
| **M3** | Create `surgeons` table | Create `DatePicker` component | Test datepicker |
| **M4** | Create `nurses` table | Create `Header` component | Test header |
| **M5** | Create `anaesthetists` table | Create `Sidebar` component | Test sidebar |
| **M6** | Create `technicians` table | Create `Layout` wrapper | Test layout |

**End of Day 2 Checklist:**
- [ ] All 10 database tables created ✓
- [ ] All base UI components ready ✓
- [ ] Layout (Header + Sidebar + Main) working ✓

---

### 📅 DAY 3 - Authentication (Part 1)

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `POST /api/auth/register` endpoint | Register page layout | Connect register form |
| **M2** | Password hashing with bcrypt | Register form component | Form validation |
| **M3** | User validation middleware | Login page layout | Style login page |
| **M4** | `POST /api/auth/login` endpoint | Login form component | Connect login form |
| **M5** | JWT token generation utility | Auth Context provider | Token storage |
| **M6** | Test auth endpoints (Postman) | Test auth UI flows | Write auth tests |

**End of Day 3 Checklist:**
- [ ] Register API working ✓
- [ ] Login API working ✓
- [ ] Register page UI complete ✓
- [ ] Login page UI complete ✓

---

### 📅 DAY 4 - Authentication (Part 2) + RBAC

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | JWT verification middleware | Protected Route component | Test protected routes |
| **M2** | `GET /api/auth/profile` endpoint | Profile page layout | Connect profile API |
| **M3** | `PUT /api/auth/profile` endpoint | Profile edit form | Test profile update |
| **M4** | RBAC middleware (role check) | Role-based UI rendering | Test role access |
| **M5** | Refresh token logic | Axios interceptors (401) | Test token refresh |
| **M6** | Test all auth + RBAC | Auth flow E2E test | Bug fixes |

**End of Day 4 Checklist:**
- [ ] Full auth flow working (register → login → dashboard) ✓
- [ ] JWT tokens working ✓
- [ ] RBAC protecting routes ✓
- [ ] Profile page functional ✓

---

### 📅 DAY 5 - Surgery CRUD (Part 1)

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `POST /api/surgeries` (create) | Surgery form component | Connect create API |
| **M2** | `GET /api/surgeries` (list all) | Surgery list page | Connect list API |
| **M3** | `GET /api/surgeries/:id` (single) | Surgery detail page | Connect detail API |
| **M4** | Surgery validation middleware | Surgery card component | Display surgery cards |
| **M5** | Surgeon dropdown API | Surgeon select dropdown | Populate surgeons |
| **M6** | Test surgery APIs | Test surgery UI | Bug fixes |

**End of Day 5 Checklist:**
- [ ] Create surgery API working ✓
- [ ] List surgeries API working ✓
- [ ] Surgery form UI complete ✓
- [ ] Surgery list displaying ✓

---

### 📅 DAY 6 - Surgery CRUD (Part 2)

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `PUT /api/surgeries/:id` (update) | Edit surgery modal | Connect update API |
| **M2** | `DELETE /api/surgeries/:id` | Delete confirmation modal | Connect delete API |
| **M3** | Surgery status update API | Status badge component | Status change UI |
| **M4** | Filter surgeries by date API | Date filter component | Connect filter |
| **M5** | Filter surgeries by status API | Status filter dropdown | Connect filter |
| **M6** | Test all CRUD operations | Test all UI flows | Bug fixes |

**End of Day 6 Checklist:**
- [ ] Full Surgery CRUD working ✓
- [ ] Edit/Delete modals working ✓
- [ ] Filters working ✓
- [ ] Status changes working ✓

---

### 📅 DAY 7 - Calendar View + Sprint 1 Review

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Surgeries by date range API | Install FullCalendar | Calendar setup |
| **M2** | Surgery events format API | Calendar page layout | Display events |
| **M3** | Surgery time validation | Click-to-view surgery | Event click handler |
| **M4** | Dashboard stats API | Dashboard layout | Connect stats |
| **M5** | Upcoming surgeries API | Dashboard upcoming list | Connect upcoming |
| **M6** | Sprint 1 testing | Sprint 1 bug fixes | Sprint 1 report |

**End of Week 1 Checklist:**
- ✅ Authentication (Register, Login, JWT, RBAC, Profile)
- ✅ Surgery CRUD (Create, Read, Update, Delete)
- ✅ Calendar view showing surgeries
- ✅ Dashboard with basic stats
- ✅ All members contributed to FE + BE

---

## 📋 WEEK 2: Emergency + Theatre + Staff (Days 8-14)

---

### 📅 DAY 8 - Emergency Booking

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Conflict detection API | Emergency form layout | Connect conflict API |
| **M2** | Theatre availability check | Theatre select dropdown | Show availability |
| **M3** | Time slot validation | Time picker component | Validate times |
| **M4** | Manual patient fields API | Manual patient form | Connect manual patient |
| **M5** | Emergency priority flag | Emergency badge UI | Display priority |
| **M6** | Test conflict detection | Test emergency flow | Bug fixes |

**End of Day 8 Checklist:**
- [ ] Conflict detection working ✓
- [ ] Emergency booking form complete ✓
- [ ] Manual patient entry working ✓

---

### 📅 DAY 9 - Staff Assignment

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Get available surgeons API | Surgeon dropdown (filtered) | Show only available |
| **M2** | Get available nurses API | Multi-select nurses (up to 3) | Connect nurses API |
| **M3** | Get available anaesthetists API | Anaesthetist dropdown | Connect anaes API |
| **M4** | Staff conflict check API | Conflict warning UI | Show warnings |
| **M5** | Assign staff to surgery API | Update surgery form | Connect assignment |
| **M6** | Test staff assignment | Test assignment UI | Bug fixes |

**End of Day 9 Checklist:**
- [ ] Staff assignment fully working ✓
- [ ] Multi-select nurses working ✓
- [ ] Availability shown in dropdowns ✓

---

### 📅 DAY 10 - Theatre Status (Part 1)

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `GET /api/theatres` list | Theatre list page | Connect list API |
| **M2** | `GET /api/theatres/:id` | Theatre detail card | Connect detail API |
| **M3** | Theatre status enum | Status color component | Color coding |
| **M4** | `PUT /api/theatres/:id/status` | Status toggle buttons | Connect status API |
| **M5** | Current surgery link API | Current surgery display | Show linked surgery |
| **M6** | Test theatre APIs | Test theatre UI | Bug fixes |

**End of Day 10 Checklist:**
- [ ] Theatre list displaying ✓
- [ ] Status colors working ✓
- [ ] Status toggle working ✓

---

### 📅 DAY 11 - Theatre Status (Part 2) + Live View

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `PUT /api/theatres/:id/progress` | Progress slider component | Connect progress API |
| **M2** | Auto-progress calculation | Progress bar display | Show progress |
| **M3** | Live status polling endpoint | Polling mechanism (30s) | Auto-refresh |
| **M4** | Theatre duration calculation | Duration display | Show duration |
| **M5** | Theatre stats API | Live status page layout | Connect stats |
| **M6** | Test live updates | Test polling | Bug fixes |

**End of Day 11 Checklist:**
- [ ] Progress tracking working ✓
- [ ] Live polling working ✓
- [ ] Live status page complete ✓

---

### 📅 DAY 12 - Coordinator Dashboard

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | All theatres overview API | Coordinator dashboard layout | Connect overview |
| **M2** | Quick status update API | Quick action buttons | Connect actions |
| **M3** | Assign surgery to theatre API | Assignment dropdown | Connect assignment |
| **M4** | Theatre maintenance mode API | Maintenance toggle | Connect maintenance |
| **M5** | Dashboard summary API | Summary cards | Connect summary |
| **M6** | Test coordinator features | Test dashboard | Bug fixes |

**End of Day 12 Checklist:**
- [ ] Coordinator dashboard complete ✓
- [ ] Quick actions working ✓
- [ ] Theatre assignment working ✓

---

### 📅 DAY 13 - Staff Management (Part 1)

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `POST /api/surgeons` (create) | Surgeons page layout | Surgeons list |
| **M2** | `GET /api/surgeons` (list) | Surgeon form component | Create surgeon |
| **M3** | `POST /api/nurses` (create) | Nurses page layout | Nurses list |
| **M4** | `GET /api/nurses` (list) | Nurse form component | Create nurse |
| **M5** | `POST /api/anaesthetists` | Anaesthetists page layout | Anaes list |
| **M6** | `GET /api/anaesthetists` | Anaesthetist form | Create anaes |

**End of Day 13 Checklist:**
- [ ] Surgeons CRUD started ✓
- [ ] Nurses CRUD started ✓
- [ ] Anaesthetists CRUD started ✓

---

### 📅 DAY 14 - Staff Management (Part 2) + Sprint 2 Review

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `PUT/DELETE /api/surgeons` | Edit/Delete surgeon | Complete surgeons |
| **M2** | `PUT/DELETE /api/nurses` | Edit/Delete nurse | Complete nurses |
| **M3** | `PUT/DELETE /api/anaesthetists` | Edit/Delete anaes | Complete anaes |
| **M4** | `CRUD /api/technicians` | Technicians full page | Complete technicians |
| **M5** | Profile picture upload (Multer) | Image upload component | Connect upload |
| **M6** | Sprint 2 testing | Sprint 2 bug fixes | Sprint 2 report |

**End of Week 2 Checklist:**
- ✅ Emergency booking with conflict detection
- ✅ Staff assignment with availability
- ✅ Live theatre status with progress
- ✅ Coordinator dashboard
- ✅ All 4 staff types CRUD (Surgeons, Nurses, Anaesthetists, Technicians)
- ✅ Profile picture upload

---

## 📋 WEEK 3: Patients + Notifications + Analytics (Days 15-21)

---

### 📅 DAY 15 - Patient Management

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `POST /api/patients` (create) | Patients page layout | Patients list |
| **M2** | `GET /api/patients` (list) | Patient form component | Create patient |
| **M3** | `GET /api/patients/:id` | Patient detail page | View patient |
| **M4** | `PUT /api/patients/:id` | Edit patient modal | Update patient |
| **M5** | `DELETE /api/patients/:id` | Delete confirmation | Delete patient |
| **M6** | Patient search API | Search bar component | Connect search |

**End of Day 15 Checklist:**
- [ ] Full Patient CRUD working ✓
- [ ] Patient search working ✓

---

### 📅 DAY 16 - Notifications Backend

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Notification model finalize | Notification list UI | Connect list |
| **M2** | `POST /api/notifications` | Notification item component | Display items |
| **M3** | `GET /api/notifications` (user) | Notification dropdown | Connect dropdown |
| **M4** | Surgery reminder logic (15min) | Unread badge counter | Show count |
| **M5** | node-cron scheduler setup | Bell icon animation | Animate on new |
| **M6** | Test scheduler runs | Test notification UI | Bug fixes |

**End of Day 16 Checklist:**
- [ ] Notification APIs working ✓
- [ ] Scheduler running every 60s ✓
- [ ] Notification dropdown showing ✓

---

### 📅 DAY 17 - Notifications Frontend + Polish

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `PUT /api/notifications/:id/read` | Mark read button | Connect mark read |
| **M2** | `PUT /api/notifications/read-all` | Mark all read button | Connect mark all |
| **M3** | Notification polling endpoint | Polling setup (30s) | Auto-refresh |
| **M4** | Notification types (enum) | Type icons/colors | Display types |
| **M5** | Clear old notifications job | Notification page (full) | Full list view |
| **M6** | Test full notification flow | E2E notification test | Bug fixes |

**End of Day 17 Checklist:**
- [ ] Full notification system working ✓
- [ ] Mark read/all working ✓
- [ ] Auto-polling working ✓

---

### 📅 DAY 18 - Analytics Backend

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Surgeries per day API (7 days) | Install Recharts | Setup charts |
| **M2** | Surgery status counts API | Analytics page layout | Page structure |
| **M3** | Patient demographics API | Stats card component | Display cards |
| **M4** | Staff counts by role API | Staff distribution UI | Show distribution |
| **M5** | Theatre utilization API | Theatre stats UI | Show utilization |
| **M6** | Test all stats APIs | Test stats display | Bug fixes |

**End of Day 18 Checklist:**
- [ ] All statistics APIs working ✓
- [ ] Analytics page layout ready ✓
- [ ] Stats cards displaying ✓

---

### 📅 DAY 19 - Analytics Charts

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Optimize stats queries | Line chart (surgeries/day) | Connect line chart |
| **M2** | Add date range to stats | Pie chart (status breakdown) | Connect pie chart |
| **M3** | Cache stats (optional) | Bar chart (demographics) | Connect bar chart |
| **M4** | Surgery duration stats API | Duration histogram | Connect histogram |
| **M5** | Peak hours analysis API | Peak hours chart | Connect peak chart |
| **M6** | Test chart accuracy | Test all charts | Bug fixes |

**End of Day 19 Checklist:**
- [ ] Line chart (surgeries per day) ✓
- [ ] Pie chart (status breakdown) ✓
- [ ] Bar chart (demographics) ✓
- [ ] All charts displaying data ✓

---

### 📅 DAY 20 - History Module

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | `GET /api/surgeries/history` | History page layout | Connect history |
| **M2** | Filter by date range API | Date range picker | Connect filter |
| **M3** | Filter by surgeon API | Surgeon filter dropdown | Connect filter |
| **M4** | Filter by theatre API | Theatre filter dropdown | Connect filter |
| **M5** | Pagination for history | Pagination component | Connect pagination |
| **M6** | Test history filters | Test history UI | Bug fixes |

**End of Day 20 Checklist:**
- [ ] History page showing completed surgeries ✓
- [ ] All filters working ✓
- [ ] Pagination working ✓

---

### 📅 DAY 21 - Export + Sprint 3 Review

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | CSV export API | Export button | Connect export |
| **M2** | Export with filters | Download trigger | Download working |
| **M3** | Surgery detail export | Print-friendly view | Test print |
| **M4** | Bug fixes (backend) | Bug fixes (frontend) | Integration fixes |
| **M5** | Bug fixes (backend) | Bug fixes (frontend) | Integration fixes |
| **M6** | Sprint 3 testing | Sprint 3 bug fixes | Sprint 3 report |

**End of Week 3 Checklist:**
- ✅ Patient management complete
- ✅ Notification system (auto-reminders, mark read)
- ✅ Analytics dashboard with charts
- ✅ History with date filtering
- ✅ CSV export

---

## 📋 WEEK 4: Polish + Testing + Deploy (Days 22-30)

---

### 📅 DAY 22 - Bug Fixes Round 1

| Member | Backend Fixes | Frontend Fixes | Test |
|--------|---------------|----------------|------|
| **M1** | Auth API bugs | Auth UI bugs | Test auth flow |
| **M2** | Surgery API bugs | Surgery UI bugs | Test surgery flow |
| **M3** | Theatre API bugs | Theatre UI bugs | Test theatre flow |
| **M4** | Staff API bugs | Staff UI bugs | Test staff flow |
| **M5** | Patient/Notification bugs | Patient/Notif UI bugs | Test both flows |
| **M6** | Analytics/History bugs | Analytics/History UI | Test both flows |

---

### 📅 DAY 23 - Bug Fixes Round 2 + Polish

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Error handling (all APIs) | Loading states (all pages) | Test loading |
| **M2** | Input validation (all) | Form error messages | Test validation |
| **M3** | API response consistency | Toast notifications | Test toasts |
| **M4** | Error codes standardize | Error boundary component | Test errors |
| **M5** | Missing validations | Empty states (no data) | Test empty states |
| **M6** | Test all error cases | Test all UI states | Bug report |

---

### 📅 DAY 24 - UI/UX Polish

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Performance: query optimize | Responsive: Dashboard | Test mobile |
| **M2** | Performance: indexing | Responsive: Surgery pages | Test mobile |
| **M3** | Performance: pagination | Responsive: Theatre pages | Test mobile |
| **M4** | Performance: caching | Responsive: Staff pages | Test mobile |
| **M5** | Performance: connection pool | Responsive: Other pages | Test mobile |
| **M6** | Performance testing | Cross-browser testing | Bug fixes |

---

### 📅 DAY 25 - Security

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | RBAC audit (all routes) | Protected routes audit | Test access |
| **M2** | SQL injection prevention | XSS prevention | Security test |
| **M3** | Input sanitization | Form sanitization | Test inputs |
| **M4** | Rate limiting setup | Error messages (no leak) | Test rate limit |
| **M5** | CORS configuration | Secure token storage | Test CORS |
| **M6** | Security testing | Security testing | Security report |

---

### 📅 DAY 26 - Testing

| Member | Backend Task | Frontend Task | Integration Task |
|--------|--------------|---------------|------------------|
| **M1** | Auth unit tests | Auth component tests | Auth E2E |
| **M2** | Surgery unit tests | Surgery component tests | Surgery E2E |
| **M3** | Theatre unit tests | Theatre component tests | Theatre E2E |
| **M4** | Staff unit tests | Staff component tests | Staff E2E |
| **M5** | Patient + Notif tests | Patient + Notif tests | Both E2E |
| **M6** | Analytics + History tests | Analytics + History tests | Both E2E |

---

### 📅 DAY 27 - Documentation

| Member | Backend Task | Frontend Task | Docs Task |
|--------|--------------|---------------|-----------|
| **M1** | Auth API docs | Auth pages README | Setup guide |
| **M2** | Surgery API docs | Surgery pages README | Feature guide |
| **M3** | Theatre API docs | Theatre pages README | User manual (Theatre) |
| **M4** | Staff API docs | Staff pages README | User manual (Staff) |
| **M5** | Patient + Notif API docs | Patient + Notif README | User manual (Patient) |
| **M6** | Swagger/Postman collection | Main README | Full user guide |

---

### 📅 DAY 28 - Staging Deployment

| Member | Backend Task | Frontend Task | DevOps Task |
|--------|--------------|---------------|-------------|
| **M1** | Environment variables | Build frontend | Setup staging server |
| **M2** | Production DB config | Test build | Deploy backend |
| **M3** | Seed staging data | Test production build | Deploy frontend |
| **M4** | Migration scripts | Fix build errors | Test staging |
| **M5** | Logging setup | Fix any issues | Monitor staging |
| **M6** | Test staging backend | Test staging frontend | Staging report |

---

### 📅 DAY 29 - Final Bug Fixes

| Member | Backend Task | Frontend Task | Priority |
|--------|--------------|---------------|----------|
| **M1** | Critical bugs | Critical bugs | P0 fixes |
| **M2** | Critical bugs | Critical bugs | P0 fixes |
| **M3** | High priority bugs | High priority bugs | P1 fixes |
| **M4** | High priority bugs | High priority bugs | P1 fixes |
| **M5** | Medium bugs | Medium bugs | P2 fixes |
| **M6** | Final testing | Final testing | Sign-off |

---

### 📅 DAY 30 - Production Deploy + Launch 🚀

| Member | Morning | Afternoon | Evening |
|--------|---------|-----------|---------|
| **M1** | Production server setup | DEPLOY BACKEND | Monitor + celebrate 🎉 |
| **M2** | Final build | DEPLOY FRONTEND | Monitor + celebrate 🎉 |
| **M3** | Production DB setup | Verify deployment | Monitor + celebrate 🎉 |
| **M4** | DNS/Domain setup | Test production | Monitor + celebrate 🎉 |
| **M5** | SSL certificate | Test production | Monitor + celebrate 🎉 |
| **M6** | Deployment checklist | Final verification | LAUNCH PARTY! 🎉 |

---

## 📊 Skills Each Member Will Learn

By the end of 30 days, **EVERY member** will have hands-on experience with:

### Backend Skills
- [ ] Node.js + Express setup
- [ ] MySQL database design
- [ ] REST API development
- [ ] JWT authentication
- [ ] RBAC middleware
- [ ] File uploads (Multer)
- [ ] Scheduled jobs (node-cron)
- [ ] Input validation
- [ ] Error handling

### Frontend Skills
- [ ] React + Vite setup
- [ ] React Router navigation
- [ ] State management (Context)
- [ ] TailwindCSS styling
- [ ] Form handling
- [ ] API integration (Axios)
- [ ] Charts (Recharts)
- [ ] Calendar integration
- [ ] Responsive design

### DevOps Skills
- [ ] Git + GitHub workflow
- [ ] CI/CD pipelines
- [ ] Environment configuration
- [ ] Deployment

---

## 📋 Daily Schedule Template

```
┌─────────────────────────────────────────────────────────┐
│  DAILY SCHEDULE (10-12 hours)                           │
├─────────────────────────────────────────────────────────┤
│  09:00 - 09:15  │  Daily Standup (15 min)               │
│  09:15 - 12:30  │  BACKEND WORK (3+ hours)              │
│  12:30 - 13:30  │  Lunch Break                          │
│  13:30 - 17:00  │  FRONTEND WORK (3.5 hours)            │
│  17:00 - 17:30  │  Break                                │
│  17:30 - 20:00  │  INTEGRATION + TESTING (2.5 hours)    │
│  20:00 - 21:00  │  Code Review + PR Merges              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔀 GitHub Workflow

### Branch Strategy
```
main (production)
  └── develop (integration)
        ├── feature/m1-auth-login
        ├── feature/m2-surgery-create
        ├── feature/m3-theatre-status
        ├── feature/m4-staff-nurses
        ├── feature/m5-patients-crud
        └── feature/m6-analytics-charts
```

### Daily PR Process
1. Each member creates feature branch: `feature/m1-day3-login`
2. Work on both BE + FE in same branch
3. Create PR to `develop` by end of day
4. At least 1 other member reviews
5. Merge after approval
6. Delete feature branch

### Commit Message Format
```
[BE] Add login endpoint with JWT
[FE] Create login form component
[INT] Connect login form to API
[FIX] Fix password validation bug
[TEST] Add login unit tests
```

---

## ✅ Feature Completion Checklist

### Authentication (M1 primary, all contribute)
- [ ] Register API (M1-BE) + Register UI (M1-FE)
- [ ] Login API (M4-BE) + Login UI (M4-FE)
- [ ] JWT middleware (M5-BE) + Token storage (M5-FE)
- [ ] Profile API (M2-BE) + Profile page (M2-FE)
- [ ] RBAC middleware (M4-BE) + Protected routes (M3-FE)

### Surgery (M2 primary, all contribute)
- [ ] Create API (M1-BE) + Create form (M5-FE)
- [ ] List API (M2-BE) + List page (M2-FE)
- [ ] Update API (M3-BE) + Edit modal (M3-FE)
- [ ] Delete API (M4-BE) + Delete confirm (M4-FE)
- [ ] Calendar API (M5-BE) + Calendar view (M1-FE)
- [ ] Emergency API (M6-BE) + Emergency form (M6-FE)

### Theatre (M3 primary, all contribute)
- [ ] List API (M1-BE) + List page (M3-FE)
- [ ] Status API (M2-BE) + Status toggle (M2-FE)
- [ ] Progress API (M3-BE) + Progress slider (M1-FE)
- [ ] Live polling (M4-BE) + Auto-refresh (M4-FE)
- [ ] Coordinator API (M5-BE) + Dashboard (M5-FE)

### Staff (M4 primary, all contribute)
- [ ] Surgeons CRUD (M1-BE+FE)
- [ ] Nurses CRUD (M2-BE+FE)
- [ ] Anaesthetists CRUD (M3-BE+FE)
- [ ] Technicians CRUD (M4-BE+FE)
- [ ] Profile picture (M5-BE) + Upload UI (M5-FE)
- [ ] Availability (M6-BE) + Toggle UI (M6-FE)

### Patients (M5 primary, all contribute)
- [ ] CRUD APIs (M1,M2,M3,M4-BE)
- [ ] CRUD UI (M1,M2,M3,M4-FE)
- [ ] Search API (M5-BE) + Search UI (M5-FE)

### Notifications (M5 primary, all contribute)
- [ ] Create API (M1-BE) + Item component (M1-FE)
- [ ] List API (M2-BE) + Dropdown (M2-FE)
- [ ] Scheduler (M3-BE) + Polling (M3-FE)
- [ ] Mark read (M4-BE) + Read UI (M4-FE)
- [ ] Mark all (M5-BE) + Read all UI (M5-FE)

### Analytics (M6 primary, all contribute)
- [ ] Surgeries/day API (M1-BE) + Line chart (M1-FE)
- [ ] Status counts API (M2-BE) + Pie chart (M2-FE)
- [ ] Demographics API (M3-BE) + Bar chart (M3-FE)
- [ ] Staff counts API (M4-BE) + Stats cards (M4-FE)
- [ ] History API (M5-BE) + History page (M5-FE)
- [ ] Export API (M6-BE) + Export button (M6-FE)

---

## 📈 Progress Tracking

### Daily Check-in Template
```markdown
## Day X - [Member Name]

### Backend Completed
- [x] Task 1
- [ ] Task 2 (in progress)

### Frontend Completed
- [x] Task 1
- [ ] Task 2 (in progress)

### Blockers
- None / Description of blocker

### Tomorrow's Plan
- BE: Task description
- FE: Task description
```

### Weekly Summary Template
```markdown
## Week X Summary

### Completed Features
- Feature 1 (100%)
- Feature 2 (100%)

### In Progress
- Feature 3 (70%)

### Team Contributions
| Member | BE Tasks | FE Tasks | PRs |
|--------|----------|----------|-----|
| M1 | 5 | 5 | 10 |
| M2 | 5 | 5 | 10 |
...
```

---

## 🚀 Success Metrics

| Metric | Target |
|--------|--------|
| Features Complete | 100% |
| All members FE+BE contributions | ✓ |
| Critical Bugs | 0 |
| Test Coverage | > 60% |
| Documentation | Complete |
| Deployment | Working |

---

## 💪 Team Commitment

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   We commit to:                                                │
│                                                                │
│   ✓ 10-12 hours daily for 30 days                              │
│   ✓ Working on BOTH backend AND frontend every day             │
│   ✓ Daily standups at 9:00 AM                                  │
│   ✓ Reviewing PRs within 2 hours                               │
│   ✓ Communicating blockers immediately                         │
│   ✓ Helping teammates when needed                              │
│   ✓ Learning new skills (BE & FE)                              │
│   ✓ Delivering a complete product on Day 30                    │
│                                                                │
│   🚀 WE WILL SHIP THEATREX IN 30 DAYS! 🚀                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

**Start Date:** _____________  
**End Date:** _____________  

**LET'S BUILD THIS TOGETHER! 🎉**
