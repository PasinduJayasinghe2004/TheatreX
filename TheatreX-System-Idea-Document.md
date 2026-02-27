# TheatreX - System Idea Document
## Hospital Operating Theatre Management System

---

# 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Project Vision & Objectives](#3-project-vision--objectives)
4. [System Overview](#4-system-overview)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Functional Requirements](#6-functional-requirements)
7. [System Architecture](#7-system-architecture)
8. [Database Design](#8-database-design)
9. [API Design](#9-api-design)
10. [User Interface Design](#10-user-interface-design)
11. [Technology Stack](#11-technology-stack)
12. [Security Requirements](#12-security-requirements)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Future Enhancements](#14-future-enhancements)
15. [Glossary](#15-glossary)

---

# 1. EXECUTIVE SUMMARY

## 1.1 Project Title
**TheatreX** - Hospital Operating Theatre Management System

## 1.2 Project Description
TheatreX is a comprehensive web-based application designed to streamline and digitize the management of hospital operating theatres. The system centralizes surgery scheduling, real-time theatre status monitoring, staff management, patient coordination, and automated notifications into a single, unified platform.

## 1.3 Key Features at a Glance

| Feature | Description |
|---------|-------------|
| 🗓️ Surgery Scheduling | Create, edit, and manage surgical procedures |
| 🚨 Emergency Booking | Quick booking for emergency cases with conflict detection |
| 📺 Live Theatre Status | Real-time monitoring of theatre availability and progress |
| 👥 Staff Management | Manage surgeons, nurses, anaesthetists, and technicians |
| 🏥 Patient Management | Track patient information and surgery history |
| 🔔 Notifications | Automated reminders and alerts for staff |
| 📊 Analytics | Statistics, reports, and insights |
| 📜 History | Complete audit trail of all surgeries |

## 1.4 Target Users
- Theatre Coordinators / Administrators
- Surgeons
- Nurses
- Anaesthetists
- Technicians
- Hospital Management

## 1.5 Project Timeline
- **Duration:** 30 Days
- **Team Size:** 6 Full-Stack Developers
- **Methodology:** Agile (4 Weekly Sprints)

---

# 2. PROBLEM STATEMENT

## 2.1 Current Challenges

### Manual Scheduling Problems
```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT STATE (WITHOUT THEATREX)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 Paper-based scheduling         → Double bookings            │
│  📞 Phone calls for coordination   → Miscommunication           │
│  📝 Manual status updates          → Outdated information       │
│  🔍 No central visibility          → Staff confusion            │
│  ⏰ No automated reminders         → Missed surgeries           │
│  📊 No analytics                   → Poor resource utilization  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Specific Problems

| Problem | Impact | Frequency |
|---------|--------|-----------|
| Double-booked theatres | Surgery delays, patient risk | High |
| Staff scheduling conflicts | Operations postponed | Medium |
| No real-time status | Inefficient resource use | Daily |
| Manual patient tracking | Information errors | High |
| No emergency prioritization | Critical delays | Critical |
| Paper-based records | Lost information, no audit trail | Constant |

## 2.2 Stakeholder Pain Points

### Theatre Coordinator
- Spends hours manually checking availability
- Cannot see real-time theatre status
- Difficulty managing emergency cases
- No overview of staff workload

### Surgeons
- Unaware of schedule changes
- Cannot check theatre availability
- No visibility into upcoming cases
- Late notifications about delays

### Nurses & Staff
- Unclear about daily assignments
- No centralized communication
- Manual handover processes
- Difficulty tracking patient status

### Hospital Management
- No operational insights
- Cannot track theatre utilization
- No data for resource planning
- Compliance and audit challenges

## 2.3 Cost of Problems

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTIMATED IMPACT                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⏱️  Average delay per conflict: 45 minutes                     │
│  💰 Cost per minute of OR time: $30-50                          │
│  📉 Theatre utilization: Only 60-70% (vs 85% optimal)           │
│  😰 Staff satisfaction: Low due to poor communication           │
│  ⚠️  Patient safety: Risk from scheduling errors                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 3. PROJECT VISION & OBJECTIVES

## 3.1 Vision Statement

> *"To transform hospital operating theatre management by providing a seamless, real-time, and intelligent platform that ensures every surgery is scheduled efficiently, every theatre is utilized optimally, and every staff member is informed and prepared."*

## 3.2 Mission

To deliver a user-friendly, reliable, and comprehensive theatre management system within 30 days that addresses all critical pain points of theatre coordination.

## 3.3 Project Objectives

### Primary Objectives

| ID | Objective | Success Metric |
|----|-----------|----------------|
| O1 | Eliminate double-booking | 0% scheduling conflicts |
| O2 | Real-time theatre visibility | Status updates within 30 seconds |
| O3 | Automated staff notifications | 100% staff receive reminders |
| O4 | Streamlined emergency booking | Emergency cases booked in < 2 minutes |
| O5 | Complete digital records | 100% surgeries documented |

### Secondary Objectives

| ID | Objective | Success Metric |
|----|-----------|----------------|
| O6 | Improve theatre utilization | Track utilization rate |
| O7 | Reduce administrative time | 50% reduction in coordination time |
| O8 | Enable data-driven decisions | Analytics dashboard available |
| O9 | Ensure compliance | Complete audit trail |
| O10 | Staff satisfaction | Easy-to-use interface |

## 3.4 Project Scope

### In Scope ✅

| Module | Features |
|--------|----------|
| Authentication | Login, Register, Profile, RBAC |
| Surgery Management | CRUD, Calendar, Emergency, Conflicts |
| Theatre Management | Status, Progress, Live View, Coordinator Tools |
| Staff Management | Surgeons, Nurses, Anaesthetists, Technicians |
| Patient Management | CRUD, Search, Link to Surgeries |
| Notifications | Auto-reminders, Read/Unread, Bell Icon |
| Analytics | Charts, Statistics, Reports |
| History | Completed surgeries, Filters, Export |

### Out of Scope ❌

| Feature | Reason |
|---------|--------|
| Billing/Invoicing | Separate financial system |
| Medical Records (EMR) | Integration with existing EMR |
| Inventory Management | Separate supply chain system |
| Mobile Native Apps | Web-responsive approach instead |
| Video Conferencing | Out of timeline |
| AI Scheduling | Future enhancement |

## 3.5 Success Criteria

```
┌─────────────────────────────────────────────────────────────────┐
│ PROJECT SUCCESS = ALL OF THE FOLLOWING                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ All 20 pages functional and tested                          │
│  ✅ Zero critical bugs at launch                                 │
│  ✅ System handles 100+ concurrent users                         │
│  ✅ Page load time < 3 seconds                                   │
│  ✅ 99% uptime after deployment                                  │
│  ✅ All user roles can perform their tasks                       │
│  ✅ Documentation complete                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 4. SYSTEM OVERVIEW

## 4.1 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              THEATREX SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│   │   USERS     │     │   USERS     │     │   USERS     │                   │
│   │ Coordinator │     │  Surgeons   │     │   Nurses    │                   │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                   │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                      WEB BROWSER                                │       │
│   │               (Chrome, Firefox, Safari)                         │       │
│   └─────────────────────────────┬───────────────────────────────────┘       │
│                                 │                                           │
│                                 ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                   REACT FRONTEND                                │       │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │       │
│   │  │  Auth    │ │ Surgery  │ │ Theatre  │ │  Staff   │            │       │
│   │  │  Pages   │ │  Pages   │ │  Pages   │ │  Pages   │            │       │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │       │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │       │
│   │  │ Patient  │ │  Notif   │ │Analytics │ │ History  │            │       │
│   │  │  Pages   │ │  Pages   │ │  Pages   │ │  Pages   │            │       │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │       │
│   └─────────────────────────────┬───────────────────────────────────┘       │
│                                 │ HTTP/REST                                 │
│                                 ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                   NODE.JS BACKEND                               │       │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │       │
│   │  │  Auth    │ │ Surgery  │ │ Theatre  │ │  Staff   │            │       │
│   │  │  APIs    │ │  APIs    │ │  APIs    │ │  APIs    │            │       │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │       │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │       │
│   │  │ Patient  │ │  Notif   │ │  Stats   │ │Scheduler │            │       │
│   │  │  APIs    │ │  APIs    │ │  APIs    │ │ (Cron)   │            │       │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │       │
│   └─────────────────────────────┬───────────────────────────────────┘       │
│                                 │ SQL                                       │
│                                 ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                   MYSQL DATABASE                                │       │
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │       │
│   │  │ Users  │ │Surgery │ │Theatre │ │ Staff  │ │Patient │         │       │
│   │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │       │
│   │  ┌────────────────┐ ┌────────────────┐                          │       │
│   │  │ Notifications  │ │    Uploads     │                          │       │
│   │  └────────────────┘ └────────────────┘                          │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Module Overview

### Core Modules

```
┌─────────────────────────────────────────────────────────────────┐
│                         THEATREX MODULES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │  AUTHENTICATION │    │    SURGERY      │                     │
│  │  ─────────────  │    │  ─────────────  │                     │
│  │  • Login        │    │  • Scheduling   │                     │
│  │  • Register     │    │  • Calendar     │                     │
│  │  • Profile      │    │  • Emergency    │                     │
│  │  • RBAC         │    │  • Conflicts    │                     │
│  └─────────────────┘    └─────────────────┘                     │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │    THEATRE      │    │     STAFF       │                     │
│  │  ─────────────  │    │  ─────────────  │                     │
│  │  • Status       │    │  • Surgeons     │                     │
│  │  • Live View    │    │  • Nurses       │                     │
│  │  • Progress     │    │  • Anaesth.     │                     │
│  │  • Coordinator  │    │  • Technicians  │                     │
│  └─────────────────┘    └─────────────────┘                     │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │    PATIENT      │    │  NOTIFICATIONS  │                     │
│  │  ─────────────  │    │  ─────────────  │                     │
│  │  • Records      │    │  • Reminders    │                     │
│  │  • Search       │    │  • Alerts       │                     │
│  │  • History      │    │  • Mark Read    │                     │
│  └─────────────────┘    └─────────────────┘                     │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │   ANALYTICS     │    │    HISTORY      │                     │
│  │  ─────────────  │    │  ─────────────  │                     │
│  │  • Statistics   │    │  • Past Surg.   │                     │
│  │  • Charts       │    │  • Filters      │                     │
│  │  • Reports      │    │  • Export       │                     │
│  └─────────────────┘    └─────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SURGERY BOOKING FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐                                                   │
│  │  User    │                                                   │
│  │(Coordin.)│                                                   │
│  └────┬─────┘                                                   │
│       │ 1. Fill surgery form                                    │
│       ▼                                                         │
│  ┌──────────┐                                                   │
│  │ Surgery  │                                                   │
│  │   Form   │                                                   │
│  └────┬─────┘                                                   │
│       │ 2. Submit                                               │
│       ▼                                                         │
│  ┌──────────┐     ┌──────────┐                                  │
│  │ Conflict │────▶│  Alert   │ (if conflict)                    │
│  │  Check   │     │  User    │                                  │
│  └────┬─────┘     └──────────┘                                  │
│       │ 3. No conflict                                          │
│       ▼                                                         │
│  ┌──────────┐                                                   │
│  │  Save    │                                                   │
│  │ Surgery  │                                                   │
│  └────┬─────┘                                                   │
│       │ 4. Saved                                                │
│       ▼                                                         │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                 │
│  │ Generate │────▶│  Notify  │────▶│  Staff   │                 │
│  │  Notif   │     │  Staff   │     │ Receives │                 │
│  └──────────┘     └──────────┘     └──────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4.4 Feature Summary

| Module | Features | Pages |
|--------|----------|-------|
| **Authentication** | Login, Register, JWT, RBAC, Profile | 3 |
| **Surgery** | CRUD, Calendar, Emergency, Conflicts, Status | 3 |
| **Theatre** | List, Live Status, Coordinator Dashboard | 3 |
| **Staff** | Surgeons, Nurses, Anaesthetists, Technicians CRUD | 4 |
| **Patient** | CRUD, Search, Link to Surgeries | 1 |
| **Notifications** | Auto-reminders, Mark Read, Dropdown | 1 |
| **Analytics** | Statistics, Charts, Dashboard | 1 |
| **History** | Past Surgeries, Filters, Export | 1 |
| **Settings** | User Preferences | 1 |
| **Dashboard** | Overview, Quick Actions | 1 |
| **TOTAL** | | **20 Pages** |

---

# 5. USER ROLES & PERMISSIONS

## 5.1 Role Definitions

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROLE HIERARCHY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌──────────────────┐                         │
│                    │      ADMIN       │                         │
│                    │  (Full Access)   │                         │
│                    └────────┬─────────┘                         │
│                             │                                   │
│              ┌──────────────┼──────────────┐                    │
│              ▼              ▼              ▼                    │
│     ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│     │COORDINATOR │  │  SURGEON   │  │   NURSE    │              │
│     │(Scheduling)│  │(View+Own)  │  │(View+Own)  │              │
│     └────────────┘  └────────────┘  └────────────┘              │
│                             │              │                    │
│                             ▼              ▼                    │
│                      ┌────────────┐  ┌────────────┐             │
│                      │ANAESTHETIST│  │ TECHNICIAN │             │
│                      │ (View+Own) │  │ (View Only)│             │
│                      └────────────┘  └────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Role Descriptions

| Role | Description | Primary Responsibilities |
|------|-------------|-------------------------|
| **Admin** | System administrator | Full system access, user management, settings |
| **Theatre Coordinator** | Manages theatre operations | Schedule surgeries, manage theatres, coordinate staff |
| **Surgeon** | Performs surgeries | View schedule, update surgery status |
| **Nurse** | Surgical support staff | View assignments, update availability |
| **Anaesthetist** | Anaesthesia specialist | View assignments, manage availability |
| **Technician** | Equipment support | View theatre status, limited access |

## 5.2 Permission Matrix

### Page Access

| Page | Admin | Coordinator | Surgeon | Nurse | Anaesthetist | Technician |
|------|:-----:|:-----------:|:-------:|:-----:|:------------:|:----------:|
| Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Surgery List | ✅ | ✅ | ✅ | ✅ | ✅ | 👁️ |
| Surgery Form | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Calendar | ✅ | ✅ | ✅ | ✅ | ✅ | 👁️ |
| Emergency Booking | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Theatre List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Live Status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Coordinator Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Surgeons Page | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ |
| Nurses Page | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ |
| Anaesthetists Page | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ |
| Technicians Page | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ |
| Patients Page | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | 👁️ | ❌ | ❌ | ❌ |
| History | ✅ | ✅ | ✅ | ✅ | ✅ | 👁️ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend:** ✅ = Full Access | 👁️ = View Only | ❌ = No Access

### Action Permissions

| Action | Admin | Coordinator | Surgeon | Nurse | Anaesthetist | Technician |
|--------|:-----:|:-----------:|:-------:|:-----:|:------------:|:----------:|
| Create Surgery | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Surgery | ✅ | ✅ | Own | ❌ | ❌ | ❌ |
| Delete Surgery | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Change Surgery Status | ✅ | ✅ | Own | ❌ | ❌ | ❌ |
| Update Theatre Status | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Patients | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## 5.3 User Journey Maps

### Theatre Coordinator Journey

```
┌─────────────────────────────────────────────────────────────────┐
│              THEATRE COORDINATOR - DAILY JOURNEY                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Morning:                                                       │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐              │
│  │ Login  │──▶│Dashboard│──▶│ Check  │──▶│ Review │              │
│  │        │   │Overview │   │ Notifs │   │Schedule│              │
│  └────────┘   └────────┘   └────────┘   └────────┘              │
│                                                                 │
│  During Day:                                                    │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐              │
│  │Schedule│──▶│ Handle │──▶│ Update │──▶│Monitor │              │
│  │Surgery │   │Emergency│   │Theatre │   │  Live  │              │
│  └────────┘   └────────┘   └────────┘   └────────┘              │
│                                                                 │
│  End of Day:                                                    │
│  ┌────────┐   ┌────────┐   ┌────────┐                           │
│  │ Review │──▶│ Check  │──▶│ Logout │                           │
│  │ Stats  │   │Tomorrow │   │        │                           │
│  └────────┘   └────────┘   └────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Surgeon Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    SURGEON - DAILY JOURNEY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐              │
│  │ Login  │──▶│Dashboard│──▶│ View   │──▶│ Check  │              │
│  │        │   │ (My    │   │Schedule│   │Patient │              │
│  │        │   │ Cases) │   │        │   │ Info   │              │
│  └────────┘   └────────┘   └────────┘   └────────┘              │
│                     │                                           │
│                     ▼                                           │
│              ┌────────┐   ┌────────┐   ┌────────┐               │
│              │ Start  │──▶│ Update │──▶│Complete│               │
│              │Surgery │   │Progress│   │Surgery │               │
│              └────────┘   └────────┘   └────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 6. FUNCTIONAL REQUIREMENTS

## 6.1 Authentication Module

### FR-AUTH-001: User Registration
| ID | FR-AUTH-001 |
|----|-------------|
| **Title** | User Registration |
| **Description** | Admin can register new users with role assignment |
| **Actors** | Admin |
| **Preconditions** | Admin is logged in |
| **Flow** | 1. Admin navigates to Register page<br>2. Fills form (name, email, password, role)<br>3. System validates input<br>4. System creates user account<br>5. Confirmation displayed |
| **Postconditions** | New user can login |
| **Priority** | High |

### FR-AUTH-002: User Login
| ID | FR-AUTH-002 |
|----|-------------|
| **Title** | User Login |
| **Description** | Users can login with email and password |
| **Actors** | All Users |
| **Preconditions** | User has account |
| **Flow** | 1. User enters email and password<br>2. System validates credentials<br>3. System generates JWT token<br>4. User redirected to Dashboard |
| **Postconditions** | User is authenticated |
| **Priority** | Critical |

### FR-AUTH-003: Profile Management
| ID | FR-AUTH-003 |
|----|-------------|
| **Title** | Profile Management |
| **Description** | Users can view and edit their profile |
| **Actors** | All Users |
| **Preconditions** | User is logged in |
| **Flow** | 1. User navigates to Profile<br>2. Views current information<br>3. Clicks Edit<br>4. Updates fields<br>5. Saves changes |
| **Postconditions** | Profile updated |
| **Priority** | Medium |

## 6.2 Surgery Management Module

### FR-SURG-001: Create Surgery
| ID | FR-SURG-001 |
|----|-------------|
| **Title** | Create Surgery |
| **Description** | Coordinator can schedule a new surgery |
| **Actors** | Admin, Coordinator |
| **Preconditions** | User is logged in with appropriate role |
| **Input** | Procedure name, Theatre, Surgeon, Patient, Date/Time, Nurses (up to 3), Anaesthetist |
| **Flow** | 1. User opens Surgery Form<br>2. Fills all required fields<br>3. System checks for conflicts<br>4. If no conflicts, surgery is saved<br>5. Notifications sent to assigned staff |
| **Validation** | - All required fields filled<br>- Valid date/time<br>- Theatre available<br>- Staff available |
| **Postconditions** | Surgery appears in schedule |
| **Priority** | Critical |

### FR-SURG-002: View Surgery List
| ID | FR-SURG-002 |
|----|-------------|
| **Title** | View Surgery List |
| **Description** | Users can view list of surgeries with filters |
| **Actors** | All Users (based on role) |
| **Filters** | Date, Status, Theatre, Surgeon |
| **Display** | Procedure, Theatre, Surgeon, Patient, Time, Status |
| **Priority** | Critical |

### FR-SURG-003: Edit Surgery
| ID | FR-SURG-003 |
|----|-------------|
| **Title** | Edit Surgery |
| **Description** | Modify existing surgery details |
| **Actors** | Admin, Coordinator |
| **Preconditions** | Surgery exists, status is 'scheduled' |
| **Flow** | 1. Select surgery<br>2. Click Edit<br>3. Modify fields<br>4. Conflict check<br>5. Save changes<br>6. Notify affected staff |
| **Priority** | High |

### FR-SURG-004: Delete Surgery
| ID | FR-SURG-004 |
|----|-------------|
| **Title** | Delete/Cancel Surgery |
| **Description** | Cancel a scheduled surgery |
| **Actors** | Admin, Coordinator |
| **Preconditions** | Surgery exists, not completed |
| **Flow** | 1. Select surgery<br>2. Click Delete/Cancel<br>3. Confirm action<br>4. Surgery marked as cancelled<br>5. Notify assigned staff |
| **Priority** | High |

### FR-SURG-005: Calendar View
| ID | FR-SURG-005 |
|----|-------------|
| **Title** | Calendar View |
| **Description** | View surgeries in calendar format |
| **Actors** | All Users |
| **Features** | Monthly/Weekly/Daily view, Click on date to see details, Color-coded by status |
| **Priority** | High |

### FR-SURG-006: Emergency Booking
| ID | FR-SURG-006 |
|----|-------------|
| **Title** | Emergency Surgery Booking |
| **Description** | Quick booking for emergency cases |
| **Actors** | Admin, Coordinator |
| **Special Features** | - Manual patient entry<br>- Conflict override option<br>- Priority flagging<br>- Immediate notifications |
| **Priority** | Critical |

### FR-SURG-007: Conflict Detection
| ID | FR-SURG-007 |
|----|-------------|
| **Title** | Scheduling Conflict Detection |
| **Description** | System detects and warns about conflicts |
| **Conflict Types** | - Theatre double-booking<br>- Surgeon double-booking<br>- Staff unavailability |
| **Response** | Warning displayed, user can proceed or modify |
| **Priority** | Critical |

## 6.3 Theatre Management Module

### FR-THTR-001: Theatre List
| ID | FR-THTR-001 |
|----|-------------|
| **Title** | View Theatre List |
| **Description** | Display all theatres with current status |
| **Display** | Theatre name, Status, Current surgery, Progress |
| **Priority** | High |

### FR-THTR-002: Live Status Board
| ID | FR-THTR-002 |
|----|-------------|
| **Title** | Live Theatre Status |
| **Description** | Real-time view of all theatre activities |
| **Features** | - Auto-refresh every 30 seconds<br>- Status colors<br>- Progress bars<br>- Current surgery details |
| **Priority** | High |

### FR-THTR-003: Update Theatre Status
| ID | FR-THTR-003 |
|----|-------------|
| **Title** | Update Theatre Status |
| **Description** | Change theatre operational status |
| **Status Options** | Available, In Use, Cleaning, Maintenance |
| **Actors** | Admin, Coordinator |
| **Priority** | High |

### FR-THTR-004: Progress Tracking
| ID | FR-THTR-004 |
|----|-------------|
| **Title** | Surgery Progress Tracking |
| **Description** | Track and update surgery progress |
| **Features** | - Manual progress slider (0-100%)<br>- Auto-calculation based on time<br>- Visual progress bar |
| **Priority** | Medium |

### FR-THTR-005: Coordinator Dashboard
| ID | FR-THTR-005 |
|----|-------------|
| **Title** | Theatre Coordinator Dashboard |
| **Description** | Central control panel for theatre management |
| **Features** | - All theatres overview<br>- Quick status changes<br>- Assign surgeries<br>- Set maintenance mode |
| **Priority** | High |

## 6.4 Staff Management Module

### FR-STAFF-001: Staff CRUD
| ID | FR-STAFF-001 |
|----|-------------|
| **Title** | Staff Management (All Types) |
| **Description** | Create, Read, Update, Delete staff records |
| **Staff Types** | Surgeons, Nurses, Anaesthetists, Technicians |
| **Fields** | Name, Specialty, Contact, Availability, Profile Picture |
| **Actors** | Admin, Coordinator |
| **Priority** | High |

### FR-STAFF-002: Availability Management
| ID | FR-STAFF-002 |
|----|-------------|
| **Title** | Staff Availability |
| **Description** | Manage staff availability status |
| **Status** | Available, Not Available, Busy (auto from surgery) |
| **Priority** | Medium |

### FR-STAFF-003: Profile Picture
| ID | FR-STAFF-003 |
|----|-------------|
| **Title** | Staff Profile Picture |
| **Description** | Upload and display staff photos |
| **Format** | JPG, PNG (max 2MB) |
| **Priority** | Low |

## 6.5 Patient Management Module

### FR-PAT-001: Patient CRUD
| ID | FR-PAT-001 |
|----|-------------|
| **Title** | Patient Management |
| **Description** | Manage patient records |
| **Fields** | Name, Age, Gender, Contact, Medical ID |
| **Priority** | High |

### FR-PAT-002: Patient Search
| ID | FR-PAT-002 |
|----|-------------|
| **Title** | Patient Search |
| **Description** | Search patients by name or ID |
| **Priority** | Medium |

## 6.6 Notification Module

### FR-NOTIF-001: Auto Reminders
| ID | FR-NOTIF-001 |
|----|-------------|
| **Title** | Automated Surgery Reminders |
| **Description** | System sends reminders 15 minutes before surgery |
| **Recipients** | All assigned staff (Surgeon, Nurses, Anaesthetist) |
| **Trigger** | Scheduled job runs every 60 seconds |
| **Priority** | High |

### FR-NOTIF-002: Notification Display
| ID | FR-NOTIF-002 |
|----|-------------|
| **Title** | Notification Display |
| **Description** | Show notifications in UI |
| **Features** | - Bell icon with unread count<br>- Dropdown list<br>- Mark as read<br>- Mark all as read |
| **Priority** | High |

## 6.7 Analytics Module

### FR-ANAL-001: Statistics Dashboard
| ID | FR-ANAL-001 |
|----|-------------|
| **Title** | Analytics Dashboard |
| **Description** | Visual statistics and reports |
| **Charts** | - Surgeries per day (line)<br>- Status breakdown (pie)<br>- Demographics (bar)<br>- Staff workload |
| **Priority** | Medium |

### FR-ANAL-002: Export
| ID | FR-ANAL-002 |
|----|-------------|
| **Title** | Data Export |
| **Description** | Export data to CSV |
| **Data** | Surgery history, Statistics |
| **Priority** | Low |

## 6.8 History Module

### FR-HIST-001: Surgery History
| ID | FR-HIST-001 |
|----|-------------|
| **Title** | Surgery History |
| **Description** | View completed surgeries |
| **Filters** | Date range, Surgeon, Theatre |
| **Priority** | Medium |

---

# 7. SYSTEM ARCHITECTURE

## 7.1 Architecture Pattern

**Three-Tier Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    THREE-TIER ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              PRESENTATION TIER (Frontend)               │    │
│  │                                                         │    │
│  │   React.js + TailwindCSS + React Router                 │    │
│  │   • User Interface                                      │    │
│  │   • Client-side validation                              │    │
│  │   • State management                                    │    │
│  │   • API communication                                   │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                              │ REST API (JSON)                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               APPLICATION TIER (Backend)                │    │
│  │                                                         │    │
│  │   Node.js + Express.js                                  │    │
│  │   • Business logic                                      │    │
│  │   • Authentication (JWT)                                │    │
│  │   • Authorization (RBAC)                                │    │
│  │   • API endpoints                                       │    │
│  │   • Scheduled jobs (node-cron)                          │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                              │ SQL Queries                      │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 DATA TIER (Database)                    │    │
│  │                                                         │    │
│  │   MySQL 8.0                                             │    │
│  │   • Data storage                                        │    │
│  │   • Data integrity                                      │    │
│  │   • Relationships                                       │    │
│  │   • Indexes for performance                             │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 7.2 Component Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/                                                           │
│  │                                                              │
│  ├── components/           # Shared/Reusable Components         │
│  │   ├── Header.jsx        # Navigation header                  │
│  │   ├── Sidebar.jsx       # Side navigation                    │
│  │   ├── Layout.jsx        # Page layout wrapper                │
│  │   └── Modal.jsx         # Reusable modal                     │
│  │                                                              │
│  ├── pages/                # Complete Page Components           │
│  │   ├── LoginPage.jsx                                          │
│  │   ├── RegisterPage.jsx                                       │
│  │   ├── DashboardPage.jsx                                      │
│  │   ├── ... (20 pages total)                                   │
│  │                                                              │
│  ├── contexts/             # React Context Providers            │
│  │   ├── AuthContext.jsx   # Authentication state               │
│  │   └── NotificationContext.jsx                                │
│  │                                                              │
│  ├── services/             # API Communication                  │
│  │   ├── api.js            # Axios instance                     │
│  │   ├── auth.service.js   # Auth API calls                     │
│  │   ├── surgery.service.js                                     │
│  │   └── ...                                                    │
│  │                                                              │
│  ├── hooks/                # Custom React Hooks                 │
│  │   ├── useAuth.js                                             │
│  │   └── useNotifications.js                                    │
│  │                                                              │
│  ├── utils/                # Helper Functions                   │
│  │   ├── constants.js                                           │
│  │   └── helpers.js                                             │
│  │                                                              │
│  ├── App.jsx               # Main App Component                 │
│  └── main.jsx              # Entry Point                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/                                                           │
│  │                                                              │
│  ├── config/               # Configuration                      │
│  │   ├── database.js       # MySQL connection                   │
│  │   └── jwt.js            # JWT configuration                  │
│  │                                                              │
│  ├── controllers/          # Request Handlers                   │
│  │   ├── auth.controller.js                                     │
│  │   ├── surgery.controller.js                                  │
│  │   ├── theatre.controller.js                                  │
│  │   ├── surgeon.controller.js                                  │
│  │   ├── nurse.controller.js                                    │
│  │   ├── anaesthetist.controller.js                             │
│  │   ├── technician.controller.js                               │
│  │   ├── patient.controller.js                                  │
│  │   ├── notification.controller.js                             │
│  │   └── stats.controller.js                                    │
│  │                                                              │
│  ├── middleware/           # Express Middleware                 │
│  │   ├── auth.middleware.js      # JWT verification             │
│  │   ├── rbac.middleware.js      # Role-based access            │
│  │   ├── validation.middleware.js # Input validation            │
│  │   └── error.middleware.js     # Error handling               │
│  │                                                              │
│  ├── models/               # Database Models                    │
│  │   ├── user.model.js                                          │
│  │   ├── surgery.model.js                                       │
│  │   ├── theatre.model.js                                       │
│  │   └── ...                                                    │
│  │                                                              │
│  ├── routes/               # API Routes                         │
│  │   ├── auth.routes.js                                         │
│  │   ├── surgery.routes.js                                      │
│  │   └── ...                                                    │
│  │                                                              │
│  ├── services/             # Business Logic                     │
│  │   ├── notification.service.js                                │
│  │   └── scheduler.service.js                                   │
│  │                                                              │
│  └── app.js                # Express App Setup                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 7.3 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   JWT AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LOGIN:                                                         │
│  ┌────────┐         ┌────────┐         ┌────────┐               │
│  │ Client │──1.────▶│ Server │──2.────▶│Database│               │
│  │        │ Login   │        │ Verify  │        │               │
│  │        │ Request │        │ User    │        │               │
│  └────────┘         └────────┘         └────────┘               │
│      ▲                  │                   │                   │
│      │                  │                   │                   │
│      │    4. JWT Token  │    3. User Data   │                   │
│      └──────────────────┴───────────────────┘                   │
│                                                                 │
│  PROTECTED REQUEST:                                             │
│  ┌────────┐         ┌────────┐         ┌────────┐               │
│  │ Client │──1.────▶│  JWT   │──2.────▶│ Route  │               │
│  │        │ Request │Middleware│ Valid  │Handler │               │
│  │        │ + Token │        │        │        │               │
│  └────────┘         └────────┘         └────────┘               │
│      ▲                  │                   │                   │
│      │                  │                   │                   │
│      │    4. Response   │    3. Process     │                   │
│      └──────────────────┴───────────────────┘                   │
│                                                                 │
│  TOKEN STORAGE:                                                 │
│  ┌────────────────────────────────────────────┐                 │
│  │ localStorage.setItem('token', jwtToken)    │                 │
│  │ localStorage.setItem('user', JSON.stringify(user))          │
│  └────────────────────────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 7.4 Notification System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 NOTIFICATION SYSTEM FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BACKGROUND SCHEDULER (Every 60 seconds):                       │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ node-cron│───▶│  Query   │───▶│ Surgeries│───▶│  Create  │   │
│  │ Job Runs │    │ Database │    │ Starting │    │  Notifs  │   │
│  │          │    │          │    │ in 15min │    │          │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │
│                                                                 │
│  FRONTEND POLLING (Every 30 seconds):                           │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ Frontend │───▶│   GET    │───▶│  Server  │───▶│  Update  │   │
│  │  Timer   │    │  /notifs │    │ Returns  │    │   UI     │   │
│  │          │    │          │    │  Unread  │    │  Badge   │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 8. DATABASE DESIGN

## 8.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ENTITY RELATIONSHIP DIAGRAM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐      │
│  │    USERS      │         │   SURGERIES   │         │   THEATRES    │      │
│  ├───────────────┤         ├───────────────┤         ├───────────────┤      │
│  │ id (PK)       │◄───┐    │ id (PK)       │    ┌───▶│ id (PK)       │      │
│  │ email         │    │    │ procedure     │    │    │ name          │      │
│  │ password      │    │    │ theatre_id(FK)│────┘    │ status        │      │
│  │ role          │    │    │ surgeon_id(FK)│────┐    │ progress      │      │
│  │ name          │    │    │ patient_id(FK)│──┐ │    │ current_surg  │      │
│  │ created_at    │    │    │ start_time    │  │ │    │ created_at    │      │
│  └───────────────┘    │    │ end_time      │  │ │    └───────────────┘      │
│                       │    │ status        │  │ │                           │
│                       │    │ anaes_id (FK) │──┼─┼─┐                         │
│  ┌───────────────┐    │    │ nurse1_id(FK) │──┼─┼─┼─┐                       │
│  │   SURGEONS    │    │    │ nurse2_id(FK) │──┼─┼─┼─┤                       │
│  ├───────────────┤    │    │ nurse3_id(FK) │──┼─┼─┼─┤                       │
│  │ id (PK)       │◄───┼────│ is_emergency  │  │ │ │ │                       │
│  │ user_id (FK)  │────┘    │ created_at    │  │ │ │ │                       │
│  │ specialty     │         └───────────────┘  │ │ │ │                       │
│  │ availability  │                            │ │ │ │                       │
│  │ profile_pic   │         ┌───────────────┐  │ │ │ │                       │
│  └───────────────┘         │   PATIENTS    │  │ │ │ │                       │
│                            ├───────────────┤  │ │ │ │                       │
│  ┌───────────────┐         │ id (PK)       │◄─┘ │ │ │                       │
│  │    NURSES     │         │ name          │    │ │ │                       │
│  ├───────────────┤         │ age           │    │ │ │                       │
│  │ id (PK)       │◄────────┼───────────────┼────┼─┼─┘                       │
│  │ user_id (FK)  │         │ gender        │    │ │                         │
│  │ specialty     │         │ contact       │    │ │                         │
│  │ availability  │         │ medical_id    │    │ │                         │
│  │ profile_pic   │         │ created_at    │    │ │                         │
│  └───────────────┘         └───────────────┘    │ │                         │
│                                                 │ │                         │
│  ┌───────────────┐         ┌───────────────┐    │ │                         │
│  │ ANAESTHETISTS │         │ NOTIFICATIONS │    │ │                         │
│  ├───────────────┤         ├───────────────┤    │ │                         │
│  │ id (PK)       │◄────────┼───────────────┼────┘ │                         │
│  │ user_id (FK)  │         │ id (PK)       │      │                         │
│  │ specialty     │         │ user_id (FK)  │──────┤                         │
│  │ availability  │         │ message       │      │                         │
│  │ profile_pic   │         │ type          │      │                         │
│  └───────────────┘         │ is_read       │      │                         │
│                            │ surgery_id(FK)│      │                         │
│  ┌───────────────┐         │ created_at    │      │                         │
│  │  TECHNICIANS  │         └───────────────┘      │                         │
│  ├───────────────┤                                │                         │
│  │ id (PK)       │                                │                         │
│  │ user_id (FK)  │────────────────────────────────┘                         │
│  │ specialty     │                                                          │
│  │ availability  │                                                          │
│  │ profile_pic   │                                                          │
│  └───────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Table Definitions

### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'coordinator', 'surgeon', 'nurse', 'anaesthetist', 'technician') NOT NULL,
    staff_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Surgeries Table
```sql
CREATE TABLE surgeries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    procedure_name VARCHAR(255) NOT NULL,
    theatre_id INT NOT NULL,
    surgeon_id INT NOT NULL,
    patient_id INT NULL,
    manual_patient_name VARCHAR(100) NULL,
    manual_patient_id VARCHAR(50) NULL,
    anaesthetist_id INT NULL,
    nurse1_id INT NULL,
    nurse2_id INT NULL,
    nurse3_id INT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    is_emergency BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (theatre_id) REFERENCES theatres(id),
    FOREIGN KEY (surgeon_id) REFERENCES surgeons(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (anaesthetist_id) REFERENCES anaesthetists(id),
    FOREIGN KEY (nurse1_id) REFERENCES nurses(id),
    FOREIGN KEY (nurse2_id) REFERENCES nurses(id),
    FOREIGN KEY (nurse3_id) REFERENCES nurses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Theatres Table
```sql
CREATE TABLE theatres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    status ENUM('available', 'in_use', 'cleaning', 'maintenance') DEFAULT 'available',
    progress INT DEFAULT 0,
    current_surgery_id INT NULL,
    capacity INT DEFAULT 1,
    equipment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (current_surgery_id) REFERENCES surgeries(id)
);
```

### Surgeons Table
```sql
CREATE TABLE surgeons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    availability_status ENUM('available', 'not_available') DEFAULT 'available',
    profile_picture VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Nurses Table
```sql
CREATE TABLE nurses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    availability_status ENUM('available', 'not_available') DEFAULT 'available',
    profile_picture VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Anaesthetists Table
```sql
CREATE TABLE anaesthetists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    availability_status ENUM('available', 'not_available') DEFAULT 'available',
    profile_picture VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Technicians Table
```sql
CREATE TABLE technicians (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    availability_status ENUM('available', 'not_available') DEFAULT 'available',
    profile_picture VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Patients Table
```sql
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    contact VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    medical_id VARCHAR(50) UNIQUE NULL,
    blood_group VARCHAR(5) NULL,
    emergency_contact VARCHAR(20) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    surgery_id INT NULL,
    message TEXT NOT NULL,
    type ENUM('reminder', 'alert', 'info', 'warning') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (surgery_id) REFERENCES surgeries(id)
);
```

## 8.3 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_surgeries_date ON surgeries(start_time);
CREATE INDEX idx_surgeries_status ON surgeries(status);
CREATE INDEX idx_surgeries_theatre ON surgeries(theatre_id);
CREATE INDEX idx_surgeries_surgeon ON surgeries(surgeon_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_users_email ON users(email);
```

---

# 9. API DESIGN

## 9.1 API Overview

| Base URL | Version | Format |
|----------|---------|--------|
| `/api` | v1 | JSON |

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## 9.2 API Endpoints

### Authentication APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/api/auth/register` | Register new user | Admin |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Surgery APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/surgeries` | List all surgeries | Yes |
| GET | `/api/surgeries/:id` | Get surgery details | Yes |
| POST | `/api/surgeries` | Create surgery | Coordinator |
| PUT | `/api/surgeries/:id` | Update surgery | Coordinator |
| DELETE | `/api/surgeries/:id` | Delete surgery | Coordinator |
| PUT | `/api/surgeries/:id/status` | Update status | Coordinator |
| GET | `/api/surgeries/calendar` | Get for calendar | Yes |
| POST | `/api/surgeries/emergency` | Emergency booking | Coordinator |
| POST | `/api/surgeries/check-conflict` | Check conflicts | Coordinator |
| GET | `/api/surgeries/history` | Completed surgeries | Yes |

### Theatre APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/theatres` | List all theatres | Yes |
| GET | `/api/theatres/:id` | Get theatre details | Yes |
| PUT | `/api/theatres/:id/status` | Update status | Coordinator |
| PUT | `/api/theatres/:id/progress` | Update progress | Coordinator |
| GET | `/api/theatres/live` | Live status all | Yes |

### Staff APIs (Surgeons, Nurses, Anaesthetists, Technicians)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/surgeons` | List all | Yes |
| GET | `/api/surgeons/:id` | Get details | Yes |
| POST | `/api/surgeons` | Create | Coordinator |
| PUT | `/api/surgeons/:id` | Update | Coordinator |
| DELETE | `/api/surgeons/:id` | Delete | Coordinator |
| GET | `/api/surgeons/available` | Get available | Yes |

*(Same pattern for /nurses, /anaesthetists, /technicians)*

### Patient APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/patients` | List all | Yes |
| GET | `/api/patients/:id` | Get details | Yes |
| POST | `/api/patients` | Create | Yes |
| PUT | `/api/patients/:id` | Update | Yes |
| DELETE | `/api/patients/:id` | Delete | Coordinator |
| GET | `/api/patients/search` | Search patients | Yes |

### Notification APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/notifications` | Get user's notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all read | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |

### Statistics APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/api/stats/summary` | Dashboard summary | Yes |
| GET | `/api/stats/surgeries-per-day` | Daily surgery count | Yes |
| GET | `/api/stats/status-breakdown` | Status distribution | Yes |
| GET | `/api/stats/demographics` | Patient demographics | Yes |
| GET | `/api/stats/staff-counts` | Staff by role | Yes |

## 9.3 API Request/Response Examples

### Login Request
```json
POST /api/auth/login
Content-Type: application/json

{
    "email": "coordinator@hospital.com",
    "password": "password123"
}
```

### Login Response
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "email": "coordinator@hospital.com",
            "name": "John Smith",
            "role": "coordinator"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

### Create Surgery Request
```json
POST /api/surgeries
Authorization: Bearer <token>
Content-Type: application/json

{
    "procedure_name": "Appendectomy",
    "theatre_id": 1,
    "surgeon_id": 2,
    "patient_id": 5,
    "anaesthetist_id": 3,
    "nurse1_id": 4,
    "nurse2_id": 6,
    "start_time": "2024-01-15T09:00:00",
    "end_time": "2024-01-15T11:00:00",
    "notes": "Routine procedure"
}
```

### Error Response
```json
{
    "success": false,
    "error": {
        "code": "CONFLICT_DETECTED",
        "message": "Theatre 1 is already booked at this time",
        "details": {
            "conflicting_surgery_id": 45
        }
    }
}
```

---

# 10. USER INTERFACE DESIGN

## 10.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Clean & Professional** | Hospital-appropriate, minimal design |
| **Intuitive Navigation** | Easy to find features |
| **Responsive** | Works on desktop, tablet, mobile |
| **Accessible** | Clear fonts, good contrast |
| **Consistent** | Same patterns across pages |

## 10.2 Color Scheme

```
┌─────────────────────────────────────────────────────────────────┐
│                       COLOR PALETTE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRIMARY:      #2563EB (Blue)     - Buttons, links              │
│  SECONDARY:    #64748B (Slate)    - Text, borders               │
│  SUCCESS:      #22C55E (Green)    - Available, completed        │
│  WARNING:      #F59E0B (Amber)    - In progress, alerts         │
│  DANGER:       #EF4444 (Red)      - Errors, cancelled           │
│  INFO:         #3B82F6 (Blue)     - Information                 │
│                                                                 │
│  BACKGROUND:   #F8FAFC (Light)    - Page background             │
│  SURFACE:      #FFFFFF (White)    - Cards, modals               │
│  TEXT:         #1E293B (Dark)     - Primary text                │
│  TEXT-MUTED:   #94A3B8 (Gray)     - Secondary text              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 10.3 Status Colors

| Status | Color | Use |
|--------|-------|-----|
| Scheduled | 🔵 Blue | Upcoming surgeries |
| In Progress | 🟡 Yellow | Currently running |
| Completed | 🟢 Green | Finished |
| Cancelled | 🔴 Red | Cancelled |
| Available | 🟢 Green | Theatre/Staff available |
| In Use | 🟡 Yellow | Theatre in use |
| Cleaning | 🟠 Orange | Theatre cleaning |
| Maintenance | 🔴 Red | Theatre maintenance |

## 10.4 Page Layouts

### Standard Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER                                  │
│  [Logo] TheatreX              [Notifications 🔔] [Profile 👤]    │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│   SIDEBAR   │              MAIN CONTENT AREA                    │
│             │                                                   │
│  Dashboard  │   ┌─────────────────────────────────────────┐     │
│  Schedule   │   │            PAGE TITLE                   │     │
│  Calendar   │   │         [Action Buttons]                │     │
│  Theatres   │   └─────────────────────────────────────────┘     │
│  Staff      │                                                   │
│  Patients   │   ┌─────────────────────────────────────────┐     │
│  Analytics  │   │                                         │     │
│  History    │   │           PAGE CONTENT                  │     │
│  Settings   │   │                                         │     │
│             │   │                                         │     │
│             │   │                                         │     │
│             │   └─────────────────────────────────────────┘     │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Today's  │ │ Active   │ │Available │ │ Pending  │            │
│  │Surgeries │ │ Theatres │ │ Staff    │ │ Notifs   │            │
│  │    12    │ │    3/5   │ │    25    │ │    5     │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────┐    │
│  │     UPCOMING SURGERIES      │ │    THEATRE STATUS       │    │
│  │                             │ │                         │    │
│  │  09:00 - Appendectomy       │ │  OR-1: 🟢 Available     │    │
│  │  10:30 - Knee Replacement   │ │  OR-2: 🟡 In Use (65%)  │    │
│  │  14:00 - Heart Bypass       │ │  OR-3: 🟢 Available     │    │
│  │                             │ │  OR-4: 🟠 Cleaning      │    │
│  └─────────────────────────────┘ └─────────────────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐      │
│  │                  QUICK ACTIONS                        │      │
│  │  [+ New Surgery]  [📋 View Schedule]  [🚨 Emergency]  │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Surgery Form Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCHEDULE NEW SURGERY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Procedure Name *                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Appendectomy                                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Theatre *                        Patient *                     │
│  ┌─────────────────────┐          ┌─────────────────────┐       │
│  │ OR-1 ▼             │          │ Search patient... ▼ │       │
│  └─────────────────────┘          └─────────────────────┘       │
│                                                                 │
│  Surgeon *                        Anaesthetist                  │
│  ┌─────────────────────┐          ┌─────────────────────┐       │
│  │ Dr. Smith ▼        │          │ Dr. Johnson ▼       │       │
│  └─────────────────────┘          └─────────────────────┘       │
│                                                                 │
│  Nurses (up to 3)                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [Nurse A ✕] [Nurse B ✕] [+ Add Nurse]                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Start Time *                     End Time *                    │
│  ┌─────────────────────┐          ┌─────────────────────┐       │
│  │ 📅 2024-01-15 09:00 │          │ 📅 2024-01-15 11:00 │       │
│  └─────────────────────┘          └─────────────────────┘       │
│                                                                 │
│  Notes                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Optional notes...                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│                    [Cancel]  [✓ Schedule Surgery]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Live Theatre Status Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                     LIVE THEATRE STATUS                         │
│                    Last updated: 10 seconds ago                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  OR-1                                    🟢 AVAILABLE   │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │  No surgery in progress                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  OR-2                                    🟡 IN USE      │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │  Procedure: Knee Replacement                            │    │
│  │  Surgeon: Dr. Smith                                     │    │
│  │  Started: 09:00 | Duration: 1h 30m                      │    │
│  │                                                         │    │
│  │  Progress: ████████████░░░░░░░░ 65%                     │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  OR-3                                    🟠 CLEANING    │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │  Est. completion: 10:45 AM                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 10.5 Component Library

### Shared Components

| Component | Description | Used In |
|-----------|-------------|---------|
| `Header` | Top navigation bar | All pages |
| `Sidebar` | Side navigation menu | All pages |
| `Layout` | Page wrapper | All pages |
| `Modal` | Popup dialogs | Forms, confirmations |
| `Toast` | Notification messages | After actions |
| `StatusBadge` | Status indicators | Lists, cards |
| `ProgressBar` | Progress display | Theatre status |
| `DataTable` | Sortable, filterable table | List pages |
| `SearchBar` | Search input | List pages |
| `DatePicker` | Date selection | Forms |

---

# 11. TECHNOLOGY STACK

## 11.1 Complete Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND                                                       │
│  ├── React 18.x          (UI Library)                           │
│  ├── Vite                (Build Tool)                           │
│  ├── React Router 6.x    (Routing)                              │
│  ├── TailwindCSS 3.x     (Styling)                              │
│  ├── Axios               (HTTP Client)                          │
│  ├── Recharts            (Charts)                               │
│  ├── FullCalendar        (Calendar)                             │
│  └── React Hot Toast     (Notifications)                        │
│                                                                 │
│  BACKEND                                                        │
│  ├── Node.js 18.x        (Runtime)                              │
│  ├── Express 4.x         (Framework)                            │
│  ├── MySQL2              (Database Driver)                      │
│  ├── JSON Web Token      (Authentication)                       │
│  ├── bcryptjs            (Password Hashing)                     │
│  ├── Multer              (File Uploads)                         │
│  ├── node-cron           (Scheduled Jobs)                       │
│  └── cors                (Cross-Origin)                         │
│                                                                 │
│  DATABASE                                                       │
│  └── MySQL 8.0           (Relational Database)                  │
│                                                                 │
│  DEVELOPMENT                                                    │
│  ├── ESLint              (Code Linting)                         │
│  ├── Prettier            (Code Formatting)                      │
│  ├── Nodemon             (Auto Restart)                         │
│  └── dotenv              (Environment Variables)                │
│                                                                 │
│  DEPLOYMENT                                                     │
│  ├── GitHub Actions      (CI/CD)                                │
│  ├── Docker (optional)   (Containerization)                     │
│  └── Nginx (optional)    (Reverse Proxy)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 11.2 Package Versions

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "recharts": "^2.10.0",
    "@fullcalendar/react": "^6.1.0",
    "@fullcalendar/daygrid": "^6.1.0",
    "@fullcalendar/timegrid": "^6.1.0",
    "react-hot-toast": "^2.4.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.54.0"
  }
}
```

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5",
    "node-cron": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "eslint": "^8.54.0"
  }
}
```

---

# 12. SECURITY REQUIREMENTS

## 12.1 Authentication Security

| Requirement | Implementation |
|-------------|----------------|
| Password Hashing | bcrypt with salt rounds (10+) |
| Token Security | JWT with expiration (7 days) |
| Token Storage | localStorage (client) |
| Session Management | Token refresh mechanism |

## 12.2 Authorization Security

| Requirement | Implementation |
|-------------|----------------|
| Role-Based Access | RBAC middleware |
| Route Protection | Auth middleware on all protected routes |
| Data Access | Users can only access permitted data |

## 12.3 Data Security

| Requirement | Implementation |
|-------------|----------------|
| SQL Injection | Parameterized queries |
| XSS Prevention | Input sanitization |
| CORS | Restricted origins |
| HTTPS | SSL/TLS in production |

## 12.4 Input Validation

| Layer | Validation |
|-------|------------|
| Frontend | Form validation before submit |
| Backend | express-validator middleware |
| Database | Constraints, foreign keys |

---

# 13. NON-FUNCTIONAL REQUIREMENTS

## 13.1 Performance Requirements

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| API Response Time | < 500ms |
| Database Query Time | < 100ms |
| Concurrent Users | 100+ |

## 13.2 Availability Requirements

| Metric | Target |
|--------|--------|
| Uptime | 99% |
| Recovery Time | < 1 hour |
| Data Backup | Daily |

## 13.3 Scalability Requirements

| Aspect | Approach |
|--------|----------|
| Horizontal | Stateless API design |
| Database | Connection pooling |
| Caching | Future: Redis |

## 13.4 Usability Requirements

| Requirement | Target |
|-------------|--------|
| Learning Curve | < 1 hour training |
| Error Messages | Clear, actionable |
| Mobile Support | Responsive design |

---

# 14. FUTURE ENHANCEMENTS

## 14.1 Phase 2 Features (Post-Launch)

| Feature | Description | Priority |
|---------|-------------|----------|
| WebSocket | Real-time updates (replace polling) | High |
| Email Notifications | Send emails for reminders | High |
| Mobile App | Native iOS/Android apps | Medium |
| Google Calendar Sync | Sync with external calendars | Medium |
| SMS Alerts | Critical alerts via SMS | Medium |

## 14.2 Phase 3 Features (Future)

| Feature | Description | Priority |
|---------|-------------|----------|
| AI Scheduling | Smart scheduling suggestions | Low |
| Resource Planning | Equipment and supply tracking | Low |
| Integration | EMR/EHR system integration | Medium |
| Advanced Analytics | Predictive analytics, ML | Low |
| Multi-Hospital | Support multiple facilities | Low |

---

# 15. GLOSSARY

| Term | Definition |
|------|------------|
| **Theatre** | Operating room where surgeries are performed |
| **Coordinator** | Staff member responsible for scheduling and managing theatres |
| **RBAC** | Role-Based Access Control - permission system based on user roles |
| **JWT** | JSON Web Token - secure authentication token |
| **CRUD** | Create, Read, Update, Delete - basic data operations |
| **API** | Application Programming Interface |
| **OR** | Operating Room (same as Theatre) |
| **Anaesthetist** | Medical professional who administers anaesthesia |
| **EMR** | Electronic Medical Records |
| **Polling** | Periodically checking for updates |

---

# 16. DOCUMENT INFORMATION

| Field | Value |
|-------|-------|
| **Document Title** | TheatreX System Idea Document |
| **Version** | 1.0 |
| **Created Date** | January 2024 |
| **Last Updated** | January 2024 |
| **Author** | TheatreX Development Team |
| **Status** | Final |

---

# 17. APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Lead | _____________ | _____________ | _______ |
| Team Member 1 | _____________ | _____________ | _______ |
| Team Member 2 | _____________ | _____________ | _______ |
| Team Member 3 | _____________ | _____________ | _______ |
| Team Member 4 | _____________ | _____________ | _______ |
| Team Member 5 | _____________ | _____________ | _______ |
| Team Member 6 | _____________ | _____________ | _______ |

---

**END OF DOCUMENT**
