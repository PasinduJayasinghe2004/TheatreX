# Authentication UI Test Scenarios

## Overview
This document contains comprehensive manual test scenarios for the TheatreX authentication UI flows (Day 3).

---

## Test Environment Setup

### Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:5173`
- Database tables created and accessible
- Browser DevTools open (Console + Network tabs)

---

## 1. Register Page Tests

### Test 1.1: Register Page Rendering
**Steps:**
1. Navigate to `http://localhost:5173/register`
2. Verify page loads without errors

**Expected Results:**
- ✅ Register page displays correctly
- ✅ All form fields are visible: Name, Email, Password, Role, Phone
- ✅ Submit button is present
- ✅ Link to login page is visible
- ✅ No console errors

---

### Test 1.2: Form Validation - Empty Fields
**Steps:**
1. Navigate to register page
2. Click submit button without filling any fields

**Expected Results:**
- ✅ Form does not submit
- ✅ Validation error messages appear for required fields
- ✅ Error messages are clear and user-friendly
- ✅ No API call is made (check Network tab)

---

### Test 1.3: Form Validation - Invalid Email
**Steps:**
1. Navigate to register page
2. Fill in:
   - Name: "Test User"
   - Email: "invalid-email" (no @ symbol)
   - Password: "SecurePass123!"
   - Role: "coordinator"
   - Phone: "0771234567"
3. Click submit

**Expected Results:**
- ✅ Email field shows validation error
- ✅ Error message indicates invalid email format
- ✅ Form does not submit

---

### Test 1.4: Form Validation - Weak Password
**Steps:**
1. Navigate to register page
2. Fill in all fields with password: "123"
3. Click submit

**Expected Results:**
- ✅ Password field shows validation error
- ✅ Error message indicates password requirements
- ✅ Form does not submit

---

### Test 1.5: Successful Registration
**Steps:**
1. Navigate to register page
2. Fill in valid data:
   - Name: "Dinil Dilmith"
   - Email: "dinil@theatrex.com"
   - Password: "SecurePass123!"
   - Role: "coordinator"
   - Phone: "0771234567"
3. Click submit
4. Check Network tab for API call

**Expected Results:**
- ✅ Form submits successfully
- ✅ Loading indicator appears during submission
- ✅ API call to `POST /api/auth/register` is made
- ✅ Success message appears
- ✅ User is redirected to login page or dashboard
- ✅ JWT token is stored in localStorage (check DevTools > Application > Local Storage)

---

### Test 1.6: Duplicate Email Registration
**Steps:**
1. Navigate to register page
2. Fill in with email that already exists: "dinil@theatrex.com"
3. Click submit

**Expected Results:**
- ✅ API returns 409 Conflict error
- ✅ Error message displays: "Email already exists" or similar
- ✅ User remains on register page
- ✅ Form fields retain entered values

---

### Test 1.7: Network Error Handling
**Steps:**
1. Stop the backend server
2. Navigate to register page
3. Fill in valid data and submit

**Expected Results:**
- ✅ Error message displays indicating network/server error
- ✅ User-friendly error message (not technical stack trace)
- ✅ Form remains filled with user data

---

## 2. Login Page Tests

### Test 2.1: Login Page Rendering
**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Verify page loads without errors

**Expected Results:**
- ✅ Login page displays correctly
- ✅ Email and Password fields are visible
- ✅ Submit button is present
- ✅ Link to register page is visible
- ✅ "Forgot password" link (if implemented)
- ✅ No console errors

---

### Test 2.2: Form Validation - Empty Fields
**Steps:**
1. Navigate to login page
2. Click submit without filling fields

**Expected Results:**
- ✅ Validation errors appear for both fields
- ✅ Form does not submit
- ✅ No API call is made

---

### Test 2.3: Successful Login
**Steps:**
1. Navigate to login page
2. Enter valid credentials:
   - Email: "dinil@theatrex.com"
   - Password: "SecurePass123!"
3. Click submit
4. Check Network tab and localStorage

**Expected Results:**
- ✅ Form submits successfully
- ✅ Loading indicator appears
- ✅ API call to `POST /api/auth/login` is made
- ✅ Response contains JWT token
- ✅ Token is stored in localStorage
- ✅ User is redirected to dashboard
- ✅ Success message appears (optional)

---

### Test 2.4: Invalid Email
**Steps:**
1. Navigate to login page
2. Enter non-existent email: "nonexistent@example.com"
3. Enter any password
4. Click submit

**Expected Results:**
- ✅ API returns 401 Unauthorized
- ✅ Error message displays: "Invalid credentials" or similar
- ✅ User remains on login page
- ✅ No token is stored

---

### Test 2.5: Invalid Password
**Steps:**
1. Navigate to login page
2. Enter valid email: "dinil@theatrex.com"
3. Enter wrong password: "WrongPassword123!"
4. Click submit

**Expected Results:**
- ✅ API returns 401 Unauthorized
- ✅ Error message displays: "Invalid credentials"
- ✅ User remains on login page
- ✅ No token is stored
- ✅ Password field is cleared (security best practice)

---

### Test 2.6: Remember Me Functionality (if implemented)
**Steps:**
1. Navigate to login page
2. Check "Remember Me" checkbox
3. Login with valid credentials
4. Close browser and reopen
5. Navigate to the app

**Expected Results:**
- ✅ User remains logged in
- ✅ Token persists in localStorage

---

## 3. Authentication Flow Tests

### Test 3.1: Complete Registration → Login Flow
**Steps:**
1. Register a new user
2. Verify redirect to login page
3. Login with the newly registered credentials
4. Verify redirect to dashboard

**Expected Results:**
- ✅ Complete flow works seamlessly
- ✅ No errors in console
- ✅ User data persists correctly

---

### Test 3.2: Token Storage Verification
**Steps:**
1. Login successfully
2. Open DevTools > Application > Local Storage
3. Check for auth token

**Expected Results:**
- ✅ Token is stored with key like "token" or "auth_token"
- ✅ Token has valid JWT format (three parts separated by dots)
- ✅ Token persists after page refresh

---

### Test 3.3: Protected Route Access
**Steps:**
1. Without logging in, try to access `http://localhost:5173/dashboard`
2. Login
3. Try accessing dashboard again

**Expected Results:**
- ✅ Unauthenticated user is redirected to login
- ✅ After login, dashboard is accessible
- ✅ Protected routes check for valid token

---

### Test 3.4: Logout Flow (if implemented)
**Steps:**
1. Login successfully
2. Click logout button
3. Check localStorage
4. Try accessing protected route

**Expected Results:**
- ✅ Token is removed from localStorage
- ✅ User is redirected to login page
- ✅ Protected routes are no longer accessible

---

## 4. UI/UX Quality Tests

### Test 4.1: Responsive Design
**Steps:**
1. Test register and login pages on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

**Expected Results:**
- ✅ Forms are readable and usable on all screen sizes
- ✅ Buttons are easily clickable
- ✅ No horizontal scrolling
- ✅ Text is legible

---

### Test 4.2: Loading States
**Steps:**
1. Submit login/register form
2. Observe UI during API call

**Expected Results:**
- ✅ Submit button shows loading state (spinner or disabled)
- ✅ User cannot submit form multiple times
- ✅ Loading indicator is visible

---

### Test 4.3: Error Message Display
**Steps:**
1. Trigger various errors (invalid credentials, network error, etc.)
2. Observe error message presentation

**Expected Results:**
- ✅ Error messages are clearly visible
- ✅ Messages are user-friendly (not technical)
- ✅ Messages disappear after successful submission
- ✅ Error styling is distinct (red color, icon, etc.)

---

### Test 4.4: Accessibility
**Steps:**
1. Navigate forms using only keyboard (Tab, Enter)
2. Test with screen reader (if available)

**Expected Results:**
- ✅ All form fields are keyboard accessible
- ✅ Tab order is logical
- ✅ Form can be submitted with Enter key
- ✅ Labels are properly associated with inputs
- ✅ Error messages are announced to screen readers

---

## 5. Browser Compatibility Tests

### Test 5.1: Cross-Browser Testing
**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (if on Mac)

**Expected Results:**
- ✅ All functionality works in all browsers
- ✅ UI renders correctly
- ✅ No browser-specific errors

---

## Test Results Template

| Test ID | Test Name | Status | Notes | Tester | Date |
|---------|-----------|--------|-------|--------|------|
| 1.1 | Register Page Rendering | ⏳ Pending | | | |
| 1.2 | Form Validation - Empty | ⏳ Pending | | | |
| 1.3 | Invalid Email | ⏳ Pending | | | |
| 1.4 | Weak Password | ⏳ Pending | | | |
| 1.5 | Successful Registration | ⏳ Pending | | | |
| 1.6 | Duplicate Email | ⏳ Pending | | | |
| 1.7 | Network Error | ⏳ Pending | | | |
| 2.1 | Login Page Rendering | ⏳ Pending | | | |
| 2.2 | Login Empty Fields | ⏳ Pending | | | |
| 2.3 | Successful Login | ⏳ Pending | | | |
| 2.4 | Invalid Email Login | ⏳ Pending | | | |
| 2.5 | Invalid Password | ⏳ Pending | | | |
| 3.1 | Register → Login Flow | ⏳ Pending | | | |
| 3.2 | Token Storage | ⏳ Pending | | | |
| 3.3 | Protected Routes | ⏳ Pending | | | |
| 4.1 | Responsive Design | ⏳ Pending | | | |
| 4.2 | Loading States | ⏳ Pending | | | |
| 4.3 | Error Messages | ⏳ Pending | | | |
| 4.4 | Accessibility | ⏳ Pending | | | |
| 5.1 | Cross-Browser | ⏳ Pending | | | |

**Status Legend:**
- ⏳ Pending
- ✅ Passed
- ❌ Failed
- ⚠️ Partial/Issues Found

---

## Notes for Tester

1. **Test in Order**: Follow the test sequence as some tests depend on previous ones
2. **Document Everything**: Take screenshots of failures
3. **Clear Data**: Clear localStorage between test runs when needed
4. **Network Tab**: Keep DevTools Network tab open to monitor API calls
5. **Console**: Watch for JavaScript errors in console
6. **Report Bugs**: Use the bug report template for any issues found
