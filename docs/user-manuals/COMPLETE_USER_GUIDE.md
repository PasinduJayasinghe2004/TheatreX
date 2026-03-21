# TheatreX Operating Theatre Management System - Complete User Guide

**Developer:** M6 (Integration Lead) | **Day:** 27

**Last Updated:** March 21, 2025 | **Version:** 1.0.0

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Surgery Management](#surgery-management)
4. [Theatre Management](#theatre-management)
5. [Staff Management](#staff-management)
6. [Patient Management](#patient-management)
7. [Notifications](#notifications)
8. [Reporting & Analytics](#reporting--analytics)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)
11. [Appendix](#appendix)

---

## Getting Started

### System Overview

TheatreX is a comprehensive Operating Theatre Management System designed to:
- Schedule and manage surgeries efficiently
- Optimize theatre resource allocation
- Manage staff scheduling and credentials
- Maintain comprehensive patient records
- Send automated notifications to patients
- Generate detailed analytics and reports

### Accessing the System

1. **Login**: Navigate to application login page
2. **Enter Credentials**: Use your assigned username and password
3. **Select Role**: System displays role-specific dashboard
4. **Navigate**: Use main menu to access different modules

### User Roles

| Role | Permissions | Access |
|------|-----------|--------|
| **Admin** | Full system access, user management, reports | All modules |
| **Surgeon** | Surgery creation/management, staff coordination | Surgery, Theatre, Patient, Staff info |
| **Nurse** | Surgery support, patient care coordination | Surgery, Patient, Theatre |
| **Anaesthetist** | Surgery planning, patient assessment | Surgery, Patient, medical history |
| **Theatre Manager** | Theatre scheduling, equipment management | Theatre, Surgery, Staff |
| **Receptionist** | Patient registration, appointment scheduling | Patients, Surgery, Notifications |

### Dashboard Overview

```
Main Dashboard
├── Recent Surgeries
├── Upcoming Schedules
├── Theatre Availability
├── Patient Alerts
└── System Notifications
```

---

## Authentication

### Logging In

**Step 1: Access Login Page**
- Open application in web browser
- Navigate to login URL
- Login form displays

**Step 2: Enter Credentials**
```
Email:     your.email@hospital.com
Password:  Your secure password
```

**Step 3: Submit**
- Click "Login" button
- System authenticates credentials
- Dashboard loads

### Password Requirements

✅ **Must include:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

❌ **Cannot include:**
- Your name or email
- Sequential numbers (123, 456)
- Keyboard patterns (qwerty, asdf)
- Dictionary words

### Two-Factor Authentication (2FA)

**Enabling 2FA**
1. Go to Settings → Security
2. Click "Enable 2FA"
3. Scan QR code with authenticator app (Google Authenticator, Authy)
4. Enter 6-digit code to verify
5. Save backup codes in secure location

**Using 2FA**
1. Enter email and password
2. Enter 6-digit code from authenticator app
3. Login completes

### Managing Your Profile

**View Profile**
1. Click your name (top right)
2. Select "Profile"
3. View personal information

**Update Profile**
1. Click "Edit" button
2. Update fields:
   - First/Last Name
   - Email
   - Department
   - Specialization
3. Save changes

**Change Password**
1. Go to Settings → Security
2. Click "Change Password"
3. Enter current password
4. Enter new password (twice)
5. Save

---

## Surgery Management

### Understanding Surgery Workflow

```
Surgery Request
    ↓
Create Surgery Record
    ↓
Assign Surgeon & Theatre
    ↓
Patient Pre-Op Clearance
    ↓
Send Surgery Reminders
    ↓
Surgery In Progress
    ↓
Post-Op Recovery
    ↓
Complete Record
```

### Creating a Surgery

**Step 1: Click "New Surgery"**
- Navigate to Surgery Management
- Click "Create Surgery" button
- Form opens

**Step 2: Enter Patient Information**
```
Field              | Required | Details
-------------------|----------|---------------------------
Patient Name       | Yes      | Select from dropdown
Patient ID         | Auto     | Generated
Date of Birth      | Auto     | From patient record
Medical Conditions | Auto     | From patient record
Allergies          | Auto     | ⚠️ Highlighted in red
```

**Step 3: Enter Surgery Details**
```
Field              | Required | Options
-------------------|----------|---------------------------
Surgery Type       | Yes      | General, Cardiac, Ortho, etc.
Urgency Level      | Yes      | Emergency, Urgent, Routine
Estimated Duration | Yes      | In minutes (30-180)
Surgeon           | Yes      | Dropdown list
Date/Time         | Yes      | Calendar picker
Notes             | No       | Additional instructions
```

**Step 4: Confirm Scheduling**
- System checks conflicts automatically
- Displays available theatres
- Shows surgeon availability
- Confirms allergy warnings
- Click "Create Surgery"

### Managing Surgery Schedule

**View All Surgeries**
1. Go to Surgery Management
2. Main list shows all surgeries
3. Click any surgery for details

**Filter Surgeries**
- By status (scheduled, in-progress, completed)
- By date range
- By surgeon
- By patient name
- By urgency

**Search**
- Use search bar
- Search by:
  - Patient name
  - Surgery ID
  - Surgeon name
  - Theatre name

### Updating Surgery Information

**Before Surgery Starts**
1. Click surgery
2. Click "Edit"
3. Change: Date, Time, Surgeon, Notes
4. Click "Save"

**During Surgery**
1. Click surgery
2. Click "Update Status"
3. Select: "In Progress"
4. Add progress notes
5. Save

**After Surgery**
1. Click surgery
2. Click "Mark Complete"
3. Enter:
   - Actual duration
   - Outcome (Successful/Complicated)
   - Post-op notes
   - Recovery instructions
4. Save

### Checking for Conflicts

**System Auto-Check**
- Checks when scheduling
- Alerts if conflicts found
- Suggests alternatives
- Requires confirmation to proceed

**Manual Check**
1. Go to Surgery Management
2. Click "Check Conflicts"
3. Enter: Surgeon, Theatre, Date/Time
4. System shows conflicts
5. Suggests solutions

### Surgery History

**View Patient Surgery History**
1. Open patient record
2. Go to "Surgery History" tab
3. Shows all past surgeries with:
   - Date and outcome
   - Surgeon who performed
   - Theatre used
   - Post-op notes

---

## Theatre Management

### Understanding Theatre Operations

**Theatre Status Indicators:**
- ✅ **Available**: Ready for use
- 🔄 **In Use**: Surgery in progress
- 🧹 **Cleaning**: Terminal cleaning happening
- ⚠️ **Maintenance**: Equipment or facility maintenance
- ❌ **Unavailable**: Not available

### Viewing Theatres

**Theatre List**
1. Go to Theatre Management
2. All theatres displayed with:
   - Status indicator
   - Current usage
   - Next scheduled surgery
   - Equipment status

**Filter Theatres**
- By type (General, Cardiac, Ortho, etc.)
- By availability
- By status
- By equipment features

### Theatre Details

**View Theatre Information**
1. Click theatre name
2. Shows:
   - **Basic Info**: Name, location, type, capacity
   - **Equipment**: All equipment with status
   - **Schedule**: Next 7 days of surgeries
   - **Availability**: Current and upcoming free time

### Managing Equipment

**Add Equipment**
1. Open theatre
2. Go to "Equipment" tab
3. Click "Add Equipment"
4. Enter:
   - Equipment name
   - Serial number
   - Status (Operational/Maintenance)
   - Last maintenance date
5. Save

**Update Equipment Status**
1. Click equipment in list
2. Change status to:
   - Operational
   - Needs Maintenance
   - Out of Service
3. Add notes if needed
4. Save

**Schedule Maintenance**
1. Click equipment
2. Last serviced date shows
3. Click "Schedule Maintenance"
4. Enter:
   - Maintenance date
   - Expected duration
   - Notes
5. System blocks theatre if needed
6. Save

### Theatre Scheduling

**View Schedule**
1. Click theatre
2. Go to "Schedule" tab
3. Shows:
   - Daily schedule
   - Time blocks for each surgery
   - Equipment availability
   - Staff assigned

**Book Theatre for Surgery**
- Done during surgery creation
- System shows available time slots
- Prevents double booking
- Confirms equipment available

### Cleaning Records

**Add Cleaning Record**
1. After surgery completion
2. Click theatre
3. Go to "Cleaning" tab
4. Click "Add Record"
5. Enter:
   - Cleaning type (Terminal/Daily/Spot)
   - Date and time
   - Completed by
   - Notes
6. Save

**View Cleaning History**
1. Go to "Cleaning" tab
2. Shows all cleaning records
3. Filter by type or date
4. Verify compliance

### Theatre Analytics

**View Statistics**
1. Click theatre
2. Go to Analytics
3. Displays:
   - **Usage**: Surgeries per month/year
   - **Utilization**: % of available time used
   - **Downtime**: Maintenance and cleaning hours
   - **Equipment**: Most needed, maintenance frequency
   - **Efficiency**: Average surgery duration vs. estimated

---

## Staff Management

### Overview of Staff Types

| Type | Role | Key Functions |
|------|------|---|
| **Surgeons** | Lead surgery | Plan, execute procedures |
| **Nurses** | Support staff | Patient care, instrument handling |
| **Anaesthetists** | Medical specialist | Patient sedation, monitoring |
| **Technicians** | Support staff | Equipment setup, maintenance |

### Managing Surgeons

**Add Surgeon**
1. Go to Staff Management → Surgeons
2. Click "Add Surgeon"
3. Enter:
   - Name (First/Last)
   - Email and phone
   - Specialization (Cardiology, General, etc.)
   - License number
   - Available hours
4. Save

**Update Surgeon**
1. Click surgeon name
2. Click "Edit"
3. Update information
4. Save changes

**View Surgeon Schedule**
1. Click surgeon
2. Go to "Schedule" tab
3. Shows:
   - Assigned surgeries
   - Available time slots
   - Upcoming surgeries
   - Off-duty dates

**Manage Qualifications**
1. Click surgeon
2. Go to "Qualifications"
3. Add certifications:
   - Board certifications
   - Specialized training
   - Languages
4. Update dates
5. Save

### Managing Nurses

**Add Nurse**
1. Go to Staff Management → Nurses
2. Click "Add Nurse"
3. Enter:
   - Name
   - Email and phone
   - Specialization
   - License number
   - Department assignment
4. Save

**Update Nurse Status**
1. Click nurse
2. Update status to:
   - Active (available)
   - On Leave
   - Off Duty
   - Inactive
3. Save

**View Availability**
1. Click nurse
2. Go to "Availability"
3. Shows:
   - Current status
   - Shift times
   - Assigned surgeries
   - Leave dates

### Managing Anaesthetists

**Add Anaesthetist**
1. Go to Staff Management → Anaesthetists
2. Click "Add"
3. Enter required information
4. Assign to theatre(s)
5. Save

**Assign to Surgery**
- Done during surgery planning
- Select from available anaesthetists
- System checks:
  - Credentials
  - Availability
  - Current assignments

### Managing Technicians

**Add Technician**
1. Go to Staff Management → Technicians
2. Click "Add"
3. Enter details
4. Assign equipment specialization
5. Save

**Track Certifications**
1. Click technician
2. Go to "Certifications"
3. Add/update:
   - Equipment certifications
   - Safety training
   - Maintenance qualifications
4. Track expiry dates

### Staff Scheduling

**View Staff Calendar**
1. Go to Staff Management
2. Select staff member
3. View annual calendar
4. Shows:
   - Scheduled surgeries
   - Leave periods
   - Off-duty dates
   - Training sessions

**Assign to Surgery**
- During surgery creation
- Select staff member
- System confirms:
  - Availability
  - Qualifications
  - Current assignments

**Manage Leave**
1. Click staff member
2. Go to "Leave"
3. Click "Request Leave"
4. Enter:
   - Leave type (Annual, Sick, Training, etc.)
   - Start and end dates
   - Reason
5. Submit for approval
6. Admin approves/denies

---

## Patient Management

### Creating Patient Records

**Step 1: Add New Patient**
1. Go to Patient Management
2. Click "Create Patient"
3. Patient registration form opens

**Step 2: Personal Information**
```
Field              | Required | Example
-------------------|----------|------------------
First Name         | Yes      | John
Last Name          | Yes      | Doe
Date of Birth      | Yes      | 1980-05-15
Gender             | No       | Male
Email              | Yes      | john.doe@email.com
Phone              | Yes      | +1-555-0123
Address            | No       | 123 Main St
```

**Step 3: Medical Information**
```
Field              | Required | Details
-------------------|----------|--------
Blood Type         | Yes      | A, B, AB, O +/-
Medical Conditions | No       | Hypertension, Diabetes, etc.
Allergies          | No       | ⚠️ CRITICAL - Check carefully
Current Medications| No       | List all medications
```

**Step 4: Emergency Contact**
```
Field              | Required | Details
-------------------|----------|--------
Contact Name       | Yes      | Full name
Relationship       | Yes      | Spouse, Parent, Child, etc.
Phone Number       | Yes      | Primary contact
```

**Step 5: Review and Save**
1. Review all information
2. Verify critical fields (allergies, conditions)
3. Click "Create Patient"
4. Patient ID generated automatically

### Managing Patient Records

**Search Patient**
1. Use search bar
2. Search by:
   - Patient name
   - Patient ID
   - Email
   - Phone number
3. Results appear instantly

**View Patient Profile**
1. Click patient name
2. Profile displays with:
   - Personal information
   - Medical history
   - Current medications
   - Allergies (highlighted)
   - Scheduled surgeries
   - Contact information

**Update Patient Information**
1. Open patient profile
2. Click "Edit"
3. Update fields
4. Save changes
5. History maintained

### Medical History Management

**Document Medical Conditions**
1. Open patient
2. Go to "Medical History" tab
3. Click "Add Condition"
4. Enter:
   - Condition name
   - Diagnosis date
   - Status (Ongoing/Resolved)
   - Notes
5. Save

**Track Allergies** ⚠️ CRITICAL
1. Open patient
2. Go to "Allergies" tab
3. Click "Add Allergy"
4. Enter:
   - Allergen name (e.g., "Penicillin")
   - Reaction type (e.g., "Rash", "Anaphylaxis")
   - Severity: Mild/Moderate/Severe
   - Additional notes
5. Save immediately

**Manage Medications**
1. Open patient
2. Go to "Medications" tab
3. Click "Add Medication"
4. Enter:
   - Medication name
   - Dosage
   - Frequency
   - Reason for use
   - Start date
   - End date (if applicable)
5. Save

**View Medical History**
1. Open patient
2. Go to "Medical History"
3. Shows complete timeline:
   - All conditions
   - All allergies
   - All medications
   - Historical records

### Patient Surgery History

**View Surgeries**
1. Open patient
2. Go to "Surgeries" tab
3. Shows:
   - **Scheduled**: Upcoming surgeries with details
   - **Completed**: Past surgeries with outcomes

**Schedule Surgery**
- Follow surgery creation process
- Patient data auto-populated
- Allergies highlighted for confirmation

**View Surgery Details**
1. Click surgery
2. Shows:
   - Date and time
   - Surgeon's name
   - Theatre assigned
   - Medical notes
   - Recovery instructions

### Data Management

**Export Patient Record**
1. Open patient
2. Click "Export"
3. Choose format:
   - **PDF**: Formatted document
   - **JSON**: Complete data structure
   - **CSV**: Spreadsheet format
4. File downloads automatically

**Privacy & Compliance**
- Encrypted storage
- Access controlled by role
- HIPAA compliant
- Audit logs maintained
- Patient consent respected

---

## Notifications

### Understanding Notifications

**Types:**
- Surgery reminders (24-48 hours before)
- System updates
- Results notifications
- Follow-up reminders
- Appointment changes
- Urgent alerts

### Notification Preferences

**Configure Preferences**
1. Go to Settings → Notifications
2. Select notification types to receive:
   - Email notifications
   - SMS messages
   - Phone calls
   - In-app notifications
3. Set reminder timing:
   - 24 hours before
   - 48 hours before
   - 1 week before
4. Save preferences

**Managing Notifications**
1. Click notification center (bell icon)
2. View all notifications
3. Click to view details
4. Mark as read
5. Archive when done

### Sending Notifications

**Single Patient Notification**
1. Open patient
2. Click "Send Notification"
3. Enter:
   - Type
   - Title
   - Message
   - Priority level
4. Send

**Bulk Notifications**
1. Go to Notifications
2. Click "Bulk Send"
3. Select patients
4. Enter message
5. Choose channels
6. Schedule or send immediately

---

## Reporting & Analytics

### Dashboard Metrics

**Key Performance Indicators (KPIs)**
- Surgeries per month
- Theatre utilization %
- Average surgery duration
- Staff efficiency ratings
- Patient satisfaction scores
- System uptime %

**Recent Activity**
- Last 10 surgeries
- Upcoming surgeries
- New patients
- Staff status
- Equipment alerts

### Surgery Reports

**Generate Report**
1. Go to Reports → Surgery
2. Select date range
3. Choose filters:
   - Surgeon
   - Theatre
   - Surgery type
   - Status
4. Generate
5. Export as PDF/Excel

**Report Contents**
- Total surgeries
- Success rate
- Average duration
- Staff involved
- Equipment used
- Complications (if any)

### Theatre Utilization Report

**Generate Report**
1. Go to Reports → Theatre
2. Select theatre
3. Enter date range
4. Generate
5. Shows:
   - Usage hours per day
   - Utilization %
   - Downtime reasons
   - Equipment status
   - Maintenance schedule

### Staff Performance Report

**Generate Report**
1. Go to Reports → Staff
2. Select staff member
3. Enter date range
4. Report shows:
   - Surgeries performed
   - Performance ratings
   - Attendance record
   - Qualifications
   - Training completed

---

## Troubleshooting

### Common Issues

#### Issue: Cannot Login

**Solution:**
1. Verify email is correct
2. Check CAPS LOCK
3. Try "Forgot Password"
4. Clear browser cache
5. Try different browser
6. Contact IT support

#### Issue: Cannot Find Patient

**Solution:**
1. Verify patient name spelling
2. Search by Patient ID
3. Check active/inactive status
4. Try partial search
5. Create patient if new

#### Issue: Surgery Scheduling Conflicts

**Solution:**
1. Check surgeon availability
2. Check theatre availability
3. Verify no double-booking
4. Try different date/time
5. Contact theatre manager

#### Issue: Allergy Warning Not Showing

**Solution:**
1. Refresh page (Ctrl+F5)
2. Verify allergy added correctly
3. Check allergy severity setting
4. Clear browser cache
5. Re-add allergy if needed

#### Issue: Equipment Status Not Updating

**Solution:**
1. Refresh page
2. Verify permissions
3. Check date/time format
4. Try again with correct data
5. Contact IT support

### Getting Help

**In-App Help**
- Click "?" button throughout app
- Context-sensitive help displays

**Documentation**
- See module-specific README files
- Access setup guides
- Review API documentation

**Contact Support**
- Email: support@theatrex.app
- Phone: +1-555-HELP
- In-app chat: Available 8 AM - 6 PM
- Tickets: Create support ticket

---

## FAQ

### General Questions

**Q: How do I reset my password?**
A: Click "Forgot Password" on login page, enter email, follow instructions in email.

**Q: Can I have multiple accounts?**
A: No, one account per user. Contact admin to update information.

**Q: How long is data retained?**
A: Active patient data indefinitely, discharged patients 6+ years per regulations.

### Surgery Management

**Q: Can I reschedule a surgery?**
A: Yes, before it starts. Click edit and change date/time. System checks conflicts.

**Q: What if there's a scheduling conflict?**
A: System alerts immediately. Choose different time, surgeon, or theatre.

**Q: How do I cancel a surgery?**
A: Click surgery, then "Cancel". Confirm. Notifications sent automatically.

### Patient Records

**Q: What allergies must be documented?**
A: All allergies, especially drug allergies. Mark severity appropriately.

**Q: Can patients see their records?**
A: In current version: Staff only. Patient portal planned for future release.

**Q: How do I export patient data?**
A: Open patient, click "Export", choose format (PDF/JSON/CSV).

### Theatre Management

**Q: How often should theatres be cleaned?**
A: After each surgery (terminal clean). Daily deep clean. Weekly major clean.

**Q: What if equipment breaks during surgery?**
A: Have backup equipment available. Mark as out-of-service. Contact maintenance.

### Staff Management

**Q: How do I schedule staff leave?**
A: Open staff, click "Leave", request leave, specify dates, submit for approval.

**Q: Can staff work multiple theatres?**
A: When qualified, yes. Ensure no scheduling conflicts.

### Notifications

**Q: How do patients get surgery reminders?**
A: Automatically 24-48 hours before. Via email/SMS based on preferences.

**Q: Can I disable notifications?**
A: Yes, in Preferences. Not recommended for critical alerts.

---

## Appendix

### A. System Requirements

**Minimum Requirements:**
- Browser: Chrome 90+, Firefox 88+, Safari 14+
- Internet: Broadband connection
- Screen: 1366x768 resolution minimum
- Storage: Minimal (cloud-based)

**Recommended:**
- Modern browser (latest version)
- High-speed internet (10+ Mbps)
- Larger screen (1920x1080+)
- Mobile device: iOS 13+ / Android 9+

### B. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K | Quick search |
| Ctrl+N | New record |
| Ctrl+S | Save |
| Ctrl+P | Print |
| Esc | Cancel/Close |
| / | Search focus |

### C. Data Fields Reference

**Patient Blood Types:**
- A+ (A positive)
- A- (A negative)
- B+ (B positive)
- B- (B negative)
- AB+ (AB positive)
- AB- (AB negative)
- O+ (O positive)
- O- (O negative)

**Surgery Urgency Levels:**
- Emergency: Within 1 hour
- Urgent: Within 24 hours
- Routine: Planned appointment
- Elective: Scheduled in advance

**Staff Status:**
- Active: Available
- On Leave: Temporarily unavailable
- Off Duty: Not scheduled
- Inactive: No longer employed

### D. Contact Information

**Support Desk:**
- Email: support@theatrex.app
- Phone: +1-555-4357
- Available: 24/7 for emergencies

**IT Support:**
- Technical issues
- Login problems
- System troubleshooting

**Admin Team:**
- Staff management
- System configuration
- Report customization

### E. Glossary

- **HIPAA**: Health Insurance Portability and Accountability Act
- **OT**: Operating Theatre
- **Pre-op**: Before surgery
- **Post-op**: After surgery
- **Confirmation**: Final approval before action
- **Intake**: Initial patient registration/information gathering
- **Terminal Clean**: Full sterilization after surgery
- **Theatre Manager**: Staff member managing operating theatre operations

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | Mar 21, 2025 | Initial complete guide | M6 |

---

**© 2025 TheatreX System. All rights reserved.**
**For questions or suggestions, contact support@theatrex.app**
