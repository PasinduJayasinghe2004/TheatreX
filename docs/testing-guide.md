# TheatreX Testing Guide

## Overview

This guide provides instructions for running all tests in the TheatreX project.

---

## Backend Testing

### Prerequisites

```bash
cd backend
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Files Location

- `backend/tests/authController.test.js` - Authentication endpoint tests

---

## Frontend Testing

### Prerequisites

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (UI mode)
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Files Location

- `frontend/src/tests/Register.test.jsx` - Register component tests
- `frontend/src/tests/Login.test.jsx` - Login component tests

---

## Manual Testing

### Postman Collection

1. Open Postman
2. Import collection: `backend/tests/postman_collection.json`
3. Set environment variable: `base_url = http://localhost:5000`
4. Run the collection

### UI Testing

Follow the test scenarios in:
- `frontend/tests/auth-ui-test-scenarios.md`

---

## Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Backend API | > 80% |
| Frontend Components | > 70% |
| Integration Tests | 100% critical paths |

---

## Continuous Integration

Tests are automatically run on:
- Every pull request
- Every commit to `develop` branch
- Before deployment to staging/production

---

## Reporting Issues

Use the bug report template: `docs/bug-report-template.md`
