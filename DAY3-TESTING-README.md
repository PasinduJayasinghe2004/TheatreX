# Day 3 - Authentication Testing (Dinil's Tasks)

## Overview

This directory contains comprehensive testing infrastructure for TheatreX authentication system, created as part of Dinil's Day 3 QA responsibilities.

---

## 📁 Directory Structure

```
SDGP-Project/
├── backend/
│   ├── tests/
│   │   ├── postman_collection.json      # Postman API tests
│   │   └── authController.test.js       # Jest automated tests
│   └── jest.config.json                 # Jest configuration
├── frontend/
│   ├── tests/
│   │   └── auth-ui-test-scenarios.md    # Manual UI test scenarios
│   ├── src/tests/
│   │   ├── setup.js                     # Vitest setup
│   │   ├── Register.test.jsx            # Register component tests
│   │   └── Login.test.jsx               # Login component tests
│   └── vitest.config.js                 # Vitest configuration
└── docs/
    ├── bug-report-template.md           # Bug reporting template
    ├── test-results.md                  # Test results documentation
    └── testing-guide.md                 # Testing guide
```

---

## 🧪 Testing Components

### 1. Backend API Testing (Postman)

**File:** `backend/tests/postman_collection.json`

**What it tests:**
- ✅ User registration with valid data
- ✅ Duplicate email rejection
- ✅ Missing required fields validation
- ✅ Invalid email format validation
- ✅ Weak password validation
- ✅ User login with valid credentials
- ✅ Invalid email/password rejection
- ✅ Missing credentials validation
- ✅ JWT token generation and format

**How to use:**
1. Open Postman
2. Import `backend/tests/postman_collection.json`
3. Set environment variable: `base_url = http://localhost:5000`
4. Run the collection (10 tests)

---

### 2. Frontend UI Testing (Manual)

**File:** `frontend/tests/auth-ui-test-scenarios.md`

**What it covers:**
- Register page rendering and validation
- Login page rendering and validation
- Form error handling
- Success flows
- Token storage verification
- Protected route access
- Responsive design
- Accessibility
- Cross-browser compatibility

**Total scenarios:** 20+ comprehensive test cases

---

### 3. Backend Automated Tests (Jest)

**File:** `backend/tests/authController.test.js`

**What it tests:**
- Registration endpoint functionality
- Login endpoint functionality
- Password hashing verification
- JWT token validation
- Error handling

**How to run:**
```bash
cd backend
npm install
npm test
```

---

### 4. Frontend Automated Tests (Vitest)

**Files:**
- `frontend/src/tests/Register.test.jsx`
- `frontend/src/tests/Login.test.jsx`

**What it tests:**
- Component rendering
- Form validation
- Form submission
- Error handling
- Token storage
- Loading states

**How to run:**
```bash
cd frontend
npm install
npm test
```

---

## 📝 Documentation

### Bug Report Template
**File:** `docs/bug-report-template.md`

Standardized template for reporting bugs found during testing.

### Test Results
**File:** `docs/test-results.md`

Template for documenting test execution results and tracking pass/fail rates.

### Testing Guide
**File:** `docs/testing-guide.md`

Complete guide for running all tests in the project.

---

## 🚀 Quick Start

### Prerequisites

1. **Backend server running:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend server running:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Running All Tests

**Backend:**
```bash
cd backend
npm install jest supertest --save-dev
npm test
```

**Frontend:**
```bash
cd frontend
npm install vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom --save-dev
npm test
```

**Postman:**
1. Import `backend/tests/postman_collection.json`
2. Run collection

**Manual UI:**
Follow scenarios in `frontend/tests/auth-ui-test-scenarios.md`

---

## 📊 Test Coverage

| Test Type | Files | Test Count | Status |
|-----------|-------|------------|--------|
| Postman API Tests | 1 | 10 | ✅ Ready |
| Manual UI Tests | 1 | 20+ | ✅ Ready |
| Backend Automated | 1 | 15+ | ✅ Ready |
| Frontend Automated | 2 | 20+ | ✅ Ready |

**Total:** 65+ comprehensive tests

---

## ⚠️ Important Notes

> [!NOTE]
> **Current Status:** The authentication endpoints and UI have not been implemented yet by other team members (M1-M5). These tests are ready to execute once the implementation is complete.

> [!TIP]
> **For Dinil:** You can start by:
> 1. Installing all testing dependencies
> 2. Reviewing the test scenarios
> 3. Setting up Postman collection
> 4. Coordinating with team members on implementation status
> 5. Executing tests once endpoints are ready

> [!IMPORTANT]
> **Dependencies to Install:**
> - Backend: `jest`, `supertest`
> - Frontend: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

---

## 🐛 Bug Reporting

When you find bugs during testing:

1. Use the template: `docs/bug-report-template.md`
2. Include screenshots/console errors
3. Document steps to reproduce
4. Assign severity and priority
5. Share with the team

---

## 📈 Next Steps

- [ ] Install testing dependencies
- [ ] Review all test scenarios
- [ ] Import Postman collection
- [ ] Wait for auth implementation by team
- [ ] Execute Postman tests
- [ ] Execute manual UI tests
- [ ] Run automated tests
- [ ] Document results in `docs/test-results.md`
- [ ] Report bugs using template
- [ ] Coordinate fixes with team

---

## 👤 Owner

**Dinil Dilmith (M6)** - Full-Stack + QA/Docs  
**Day:** 3  
**Feature:** Authentication Testing

---

## 📚 Related Documentation

- [30-Day Plan](../TheatreX-30-Day-FullStack-Plan.md) - See Day 3 tasks
- [Testing Guide](../docs/testing-guide.md) - Complete testing instructions
- [Bug Report Template](../docs/bug-report-template.md) - For reporting issues
- [Test Results](../docs/test-results.md) - For documenting results
