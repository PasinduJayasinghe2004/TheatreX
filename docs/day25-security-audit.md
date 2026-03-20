# Day 25 Security Audit

Date: 2026-03-20

## Scope

- Backend route access control (RBAC + authentication coverage)
- Public endpoint validation and error handling
- API abuse protection (rate limiting)
- Frontend protected-route behavior and token storage
- XSS risk review for dynamic UI rendering

## Route Access Findings

Public routes intentionally allowed:

- `GET /`
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/inquiries/demo-request`
- `GET /api/test/public` (dev/test helper)

Protected route groups verified:

- `/api/users` (admin/coordinator, with admin-only create/update/delete)
- `/api/surgeries` (authenticated read, coordinator/admin writes)
- `/api/dashboard` (authenticated + role-restricted summary)
- `/api/theatres` (authenticated read, coordinator/admin writes)
- `/api/patients` (authenticated read, coordinator/admin writes)
- `/api/notifications` (all protected)
- `/api/analytics` (all protected)
- `/api/chatbot` (all protected)

## Hardening Applied

1. Added central security middleware in backend:
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, etc.)
- Request sanitization for body/query/params
- Reusable in-memory rate limiter

2. Tightened backend server config:
- CORS allow-list via `CORS_ORIGINS` (with localhost defaults)
- Global API rate limiting
- Stronger auth and inquiry endpoint rate limiting
- Request body size limits (`100kb`)
- `x-powered-by` disabled

3. Reduced information leakage:
- `authMiddleware` now avoids returning raw internal auth errors in production
- `inquiryRoutes` no longer returns raw backend error text
- Added stricter field validation on public inquiry submission

4. Frontend security updates:
- Migrated auth token/refresh token storage to session-scoped storage (`authStorage`)
- Added legacy migration from old `localStorage` keys to avoid forced logout after deploy
- Replaced unsafe `innerHTML` avatar fallback with React-rendered fallback in `StaffOnDutyModal`

## Test Additions

- Backend: `backend/tests/day25_security_access.test.js`
- Frontend: `frontend/src/tests/ProtectedRoute.test.jsx`

Note: Test execution must be run in an environment where `node` and `npm` are available in PATH.
