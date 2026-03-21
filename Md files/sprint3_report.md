# Sprint 3 Report - TheatreX

## Sprint Window
- Week 3 (Days 15-21)

## Day 21 Scope Completed
- Added filtered surgery history CSV export endpoint.
- Added single surgery detail CSV export endpoint.
- Added History page export trigger for filtered CSV downloads.
- Added per-row surgery detail CSV export trigger.
- Added print-friendly surgery detail page and route.
- Added backend Day 21 export API tests.

## Backend Deliverables
- Route: GET /api/surgeries/history/export/csv
- Route: GET /api/surgeries/:id/export/csv
- CSV generation includes safe escaping for commas, quotes, and line breaks.
- History export supports filters: startDate, endDate, surgeonId, theatreId.

## Frontend Deliverables
- History page now includes:
  - Export CSV button for active filters.
  - Detail CSV export button per surgery row.
  - Print View button per surgery row.
- New print page route:
  - /history/:id/print
- Print page provides a clean tabular surgery report for hard copy export.

## Validation and Test Results
- Backend test file added and passing:
  - backend/tests/day21_export.test.js
- Existing frontend history tests still passing:
  - frontend/src/tests/HistoryPage.test.jsx

## Notes
- Frontend test execution must be run from frontend workspace folder.
- Backend test execution must be run from backend workspace folder.
