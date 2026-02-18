# Surgery API & UI Test Scenarios
## Created by: M6 (Dinil) - Day 5

This document outlines all test scenarios created for the Surgery module testing.

---

## Backend API Tests (`backend/tests/surgeryController.test.js`)

### POST /api/surgeries - Create Surgery Tests
| Test Case | Expected Result |
|-----------|-----------------|
| Create surgery with valid data | Returns 201, surgery created successfully |
| Create surgery without authentication | Returns 401, unauthorized |
| Create surgery with missing required fields | Returns 400, validation errors |
| Create surgery with invalid date format | Returns 400, validation error |
| Create surgery with invalid time format | Returns 400, validation error |
| Create surgery with invalid status | Returns 400, validation error |
| Create surgery with invalid priority | Returns 400, validation error |
| Create surgery with negative duration | Returns 400, validation error |
| Create emergency surgery | Returns 201, priority = emergency |
| Create urgent surgery | Returns 201, priority = urgent |

### GET /api/surgeries - Get All Surgeries Tests
| Test Case | Expected Result |
|-----------|-----------------|
| Get all surgeries (authenticated) | Returns 200, array of surgeries |
| Get surgeries with nested surgeon data | Returns surgery objects with surgeon info |
| Get surgeries (unauthenticated) | Returns 401, unauthorized |
| Verify surgeries are sorted by date | Surgeries sorted chronologically |

### GET /api/surgeries/:id - Get Surgery by ID Tests
| Test Case | Expected Result |
|-----------|-----------------|
| Get surgery by valid ID | Returns 200, surgery data |
| Get surgery by non-existent ID | Returns 404, not found |
| Get surgery with invalid ID format | Returns 400, invalid ID |
| Get surgery with negative ID | Returns 400, invalid ID |
| Get surgery (unauthenticated) | Returns 401, unauthorized |
| Verify complete data structure | Returns all surgery fields |

### GET /api/surgeries/surgeons - Get Surgeons Dropdown Tests
| Test Case | Expected Result |
|-----------|-----------------|
| Get list of surgeons | Returns 200, array of surgeons |
| Verify surgeon structure | Returns id, name, email (no password) |
| Get surgeons (unauthenticated) | Returns 401, unauthorized |

### Surgery Validation Middleware Tests
| Test Case | Expected Result |
|-----------|-----------------|
| Accept all valid statuses | scheduled, in_progress, completed, cancelled accepted |
| Accept all valid priorities | routine, urgent, emergency accepted |
| Validate patient age range | Age must be 0-150 |

### RBAC Tests
| Test Case | Expected Result |
|-----------|-----------------|
| Coordinator can create surgery | Returns 201 |
| Nurse cannot create surgery | Returns 403, forbidden |
| Nurse can view surgeries | Returns 200 |
| Nurse can view surgery by ID | Returns 200 |

---

## Frontend UI Tests

### SurgeryCard Component (`frontend/src/tests/SurgeryCard.test.jsx`)

#### Component Rendering Tests
- ✅ Should render surgery type as title
- ✅ Should render patient name
- ✅ Should render surgeon name when assigned
- ✅ Should render "Unassigned" when no surgeon
- ✅ Should render duration in minutes
- ✅ Should render View, Edit, and Delete buttons

#### Status Badge Tests
- ✅ Displays scheduled status correctly
- ✅ Displays completed status with green styling
- ✅ Displays in_progress status with blue styling
- ✅ Displays cancelled status with red styling

#### Priority Badge Tests
- ✅ Displays routine priority with blue styling
- ✅ Displays urgent priority with orange styling
- ✅ Displays emergency priority with red styling

#### Button Interaction Tests
- ✅ Navigate to detail page when View button is clicked
- ✅ Call onEdit with surgery ID when Edit button is clicked
- ✅ Call onDelete with surgery ID when Delete button is clicked

#### Edge Cases Tests
- ✅ Handle missing patient name
- ✅ Handle surgery without duration
- ✅ Correct aria-labels for accessibility

---

### SurgeryList Page (`frontend/src/tests/SurgeryList.test.jsx`)

#### Loading State Tests
- ✅ Show loading indicator while fetching data

#### Success State Tests
- ✅ Display page title
- ✅ Display surgery count
- ✅ Display all surgery cards
- ✅ Display surgery types
- ✅ Have Create Surgery button

#### Empty State Tests
- ✅ Show empty state when no surgeries exist
- ✅ Show correct count for single surgery

#### Error State Tests
- ✅ Show error message when API fails
- ✅ Show Try Again button on error
- ✅ Handle API returning success: false

#### Navigation Tests
- ✅ Call navigate when Create Surgery button is clicked

---

### SurgeryDetail Page (`frontend/src/tests/SurgeryDetail.test.jsx`)

#### Loading State Tests
- ✅ Show loading indicator while fetching data

#### Success State Tests
- ✅ Display surgery type as title
- ✅ Display patient name, age, gender
- ✅ Display surgeon name
- ✅ Display surgery description and notes
- ✅ Display duration
- ✅ Display status and priority badges
- ✅ Have back button
- ✅ Have Edit and Delete buttons

#### Status/Priority Badge Styling Tests
- ✅ Green styling for completed status
- ✅ Blue styling for in_progress status
- ✅ Red styling for cancelled status
- ✅ Correct styling for emergency/urgent priorities

#### Error State Tests
- ✅ Show error message when API fails
- ✅ Show 404 message for non-existent surgery

#### Edge Cases Tests
- ✅ Handle surgery without surgeon
- ✅ Handle surgery without notes
- ✅ Handle surgery without description

---

### SurgeryForm Component (`frontend/src/tests/SurgeryForm.test.jsx`)

#### Component Rendering Tests
- ✅ Render page title
- ✅ Render Patient Information section
- ✅ Render patient input fields
- ✅ Render surgery type, date, time, duration inputs
- ✅ Render submit button

#### Surgeon Dropdown Tests
- ✅ Fetch surgeons on mount
- ✅ Display surgeons in dropdown after loading

#### Form Validation Tests
- ✅ Show error when required fields are missing
- ✅ Show error when patient info is missing

#### Form Submission Tests
- ✅ Submit form with valid data
- ✅ Show success message on successful submission
- ✅ Show error message on API failure
- ✅ Call onSuccess callback after successful submission

---

## Postman Collection Updates

Added to `backend/tests/postman_collection.json`:

### Surgery API Endpoints
1. **Create Surgery - Valid Data** - Tests successful surgery creation
2. **Create Surgery - Missing Required Fields** - Tests validation
3. **Create Surgery - Unauthorized** - Tests authentication
4. **Get All Surgeries** - Tests listing endpoint
5. **Get Surgery by ID** - Tests single surgery fetch
6. **Get Surgery - Not Found** - Tests 404 response
7. **Get Surgery - Invalid ID** - Tests 400 response
8. **Get Surgeons Dropdown** - Tests surgeons endpoint
9. **Create Emergency Surgery** - Tests emergency priority

---

## How to Run Tests

### Backend Tests
```bash
cd backend
npm test                                    # Run all tests
npm test -- --testPathPattern=surgery       # Run surgery tests only
```

### Frontend Tests
```bash
cd frontend
npm test                                    # Run all tests
npm test -- --run src/tests/Surgery*.jsx   # Run surgery tests only
```

### Postman Tests
1. Import `backend/tests/postman_collection.json` into Postman
2. Set environment variable `base_url` to `http://localhost:5000`
3. Run the "Authentication" folder first to get `auth_token`
4. Run the "Surgery API (Day 5)" folder

---

## Test Coverage Summary

| Component | Tests | Status |
|-----------|-------|--------|
| surgeryController.test.js | 30 | ✅ Created |
| SurgeryCard.test.jsx | 22 | ✅ Passing |
| SurgeryList.test.jsx | 13 | ✅ Passing |
| SurgeryDetail.test.jsx | 26 | ✅ Created |
| SurgeryForm.test.jsx | 20 | ✅ Created |
| Postman Collection | 9 | ✅ Added |

**Total Test Scenarios: 120+**
