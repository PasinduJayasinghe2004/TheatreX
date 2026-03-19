# Day 4 - Profile & RBAC UI Test Scenarios

## 1. Profile Management Tests

### 1.1 View Profile
**Pre-condition:** User is logged in
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/profile` | Profile page loads | |
| 2 | Verify user details | Name, email, role are displayed correctly | |
| 3 | Reload page | User remains logged in, data persists | |

### 1.2 Update Profile
**Pre-condition:** User is logged in on Profile page
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Edit Profile" | Form fields become editable | |
| 2 | Change name to "Updated Name" | Input accepts new value | |
| 3 | Click "Save Changes" | Success message appears | |
| 4 | Reload page | New name is displayed | |
| 5 | Try empty name | Validation error "Name is required" | |

### 1.3 Profile Picture Upload (Mock)
**Pre-condition:** User is logged in on Profile page
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click profile image | File selector opens | |
| 2 | Select valid image (JPG/PNG < 2MB) | Image preview updates | |
| 3 | Click "Save" | Success message, new image displayed | |
| 4 | Upload invalid file (PDF/Exe) | Error message "Invalid file type" | |

---

## 2. Role-Based Access Control (RBAC) Tests

### 2.1 Admin Access
**Pre-condition:** Logged in as `admin_user`
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/admin/dashboard` | Dashboard loads successfully | |
| 2 | Navigate to `/doctor/dashboard` | Access granted (if hierarchical) or Denied | |
| 3 | Navigate to `/profile` | Profile loads showing "Admin" role | |

### 2.2 Doctor Access
**Pre-condition:** Logged in as `doctor_user`
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/doctor/dashboard` | Dashboard loads successfully | |
| 2 | Navigate to `/admin/dashboard` | **Access Denied / Redirect to Home** | |
| 3 | Navigate to `/surgeries/create` | Access granted | |

### 2.3 Nurse Access
**Pre-condition:** Logged in as `nurse_user`
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/admin/dashboard` | **Access Denied** | |
| 2 | Navigate to `/surgeries` | Read-only access (if applicable) | |
| 3 | Try to delete surgery | Button hidden or Action Blocked | |

### 2.4 Unauthenticated Access
**Pre-condition:** Logged out
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/profile` | Redirect to `/login` | |
| 2 | Navigate to `/dashboard` | Redirect to `/login` | |
| 3 | Navigate to `/admin` | Redirect to `/login` | |

---

## 3. End-to-End Auth Flows

### 3.1 Full Journey
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Register new user as 'Doctor' | Registration success, redirect to Login |
| 2 | Login with new credentials | Login success, token stored, redirect to Dashboard |
| 3 | Verify 'Doctor' elements visible | Specific stats/buttons are visible |
| 4 | Navigate to Profile | Profile data matches registration |
| 5 | Logout | Token cleared, redirect to Login |
| 6 | press Back button | Redirect to Login (cannot go back to protected route) |

### 3.2 Token Expiry (Simulated)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login successfully | Dashboard loads |
| 2 | Manually clear token (DevTools) | - |
| 3 | Click any protected link | "Session Expired" or Redirect to Login |
