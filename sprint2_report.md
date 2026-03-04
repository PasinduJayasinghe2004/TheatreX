# TheatreX - Sprint 2 Review Report
**Date:** March 1, 2026
**Author:** M6 (Dinil)

## 1. Executive Summary
Sprint 2 (Days 8-14) successfully implemented essential theatre management and staff operation features. All frontend integrations and UI components are functioning correctly and pass their test suites. However, backend testing is currently blocked due to an infrastructure issue with the Neon PostgreSQL database connection pooler.

## 2. Completed Features

### Theatres & Operations
- **Theatre CRUD:** Completed (Day 8)
- **Emergency Booking & Conflict Detection:** Completed (Day 12). Handles overriding standard conflicts for emergency priority cases.
- **Live Updates & Polling:** Completed (Day 11). Polling mechanism updates progress bars and theatre statuses in near real-time.
- **Coordinator Dashboard:** Completed (Day 12). Provides a high-level overview of daily operations and statuses.

### Staff Management
- **Staff Assignment & Availability:** Completed (Day 9)
- **Surgeons CRUD:** Completed (Day 13-14)
- **Nurses CRUD:** Completed (Day 13-14)
- **Anaesthetists CRUD:** Completed (Day 13-14)
- **Technicians CRUD:** Completed (Day 14)

---

## 3. Testing Status

### Frontend Test Suite (Vitest)
**Status:** ✅ **PASSING (100%)**
- **Test Suites:** 16 passed
- **Total Tests:** 120+ passed
- **Key Modules Tested:** `TheatreService`, `usePolling`, `CoordinatorDashboard`, `SurgeryForm`, `TheatreAssignmentDropdown`, `AnaesthetistsPage`.

### Backend Test Suite (Jest)
**Status:** ⚠️ **BLOCKED / FAILING**
- **Issue:** The backend tests are throwing connection timeouts (`Error: Connection terminated due to connection timeout at pg-pool`).
- **Cause:** Network/Firewall issue reaching the Neon Cloud Serverless Database (`ep-polished-hill-a1ophvun-pooler.ap-southeast-1.aws.neon.tech`).
- **Resolution Needed:** The database connection needs to be restored, configuration verified, or a local mock database fallback implemented before the backend integration tests can be reliably executed. 
- *Note: Previous test logs indicate that prior to this DB outage, backend tests were largely functional.*

---

## 4. Bug Fixes & Improvements
During the Day 14 Sprint Review, the following issues were identified and resolved:
1. **Ambiguous Locator in `AnaesthetistsPage.test.jsx`:**
   - **Bug:** The frontend test suite failed because it expected a single occurrence of the text "Available" in the stats strip (`screen.getByText('Available')`). However, the mock data rendered "Available" multiple times (e.g., inside the surgeon card or form).
   - **Fix:** Switched the assertion to properly scope or use `getAllByText('Available')` to account for valid multiple occurrences on the page.

---
**Sign-off:** M6 (Sprint 2 Complete)
