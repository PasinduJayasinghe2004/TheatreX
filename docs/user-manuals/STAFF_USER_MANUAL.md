# Staff Management System User Manual

**Developer:** M4 (Oneli) | **Day:** 27

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Staff Management](#staff-management)
4. [Staff Profiles](#staff-profiles)
5. [Scheduling & Availability](#scheduling--availability)
6. [Staff Analytics](#staff-analytics)
7. [Common Tasks](#common-tasks)
8. [FAQ](#faq)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is Staff Management?

The Staff Management System manages all medical and support personnel including surgeons, nurses, anaesthetists, and technicians. It handles profiles, schedules, qualifications, and availability tracking.

### System Components

- **Surgeons**: Surgical specialists
- **Nurses**: Operating theatre nurses
- **Anaesthetists**: Anaesthesia specialists
- **Technicians**: Surgical technicians

---

## Getting Started

### Accessing the System

1. Login to application
2. Navigate to staff module
3. Select staff type (Surgeons/Nurses/Anaesthetists/Technicians)
4. View staff list

### User Interface

```
┌──────────────────────────────────────┐
│      Staff Management                │
├────────────┬───────────────────────┤
│ Left Menu  │   Staff List View     │
│            │   - Search            │
│ - Surgeons │   - Filters           │
│ - Nurses   │   - Actions           │
│ - Anaes... │   - Detail view       │
│ - Techs    │   - Edit              │
│            │   - Delete            │
└────────────┴───────────────────────┘
```

---

## Staff Management

### Viewing Staff List

**Navigate to Staff Section**
1. Click on staff type in menu
   - Surgeons
   - Nurses
   - Anaesthetists
   - Technicians

2. View staff list with:
   - Name
   - Specialization
   - Status (active/inactive/on-leave)
   - Experience
   - Upcoming surgeries count

**Filter Options**
- By specialization
- By status
- By department
- By experience level

**Search**
- Search by name
- Search by license number
- Search by ID

### Creating Staff Profile

**Step 1: Click "Add Staff"**
- Navigate to staff section
- Click "Add Staff" button
- Form opens

**Step 2: Enter Personal Information**
```
Field              | Required | Example
-------------------|----------|------------------
First Name         | Yes      | John
Last Name          | Yes      | Smith
Email              | Yes      | john.smith@hospital.com
Phone Number       | Yes      | +1-555-0123
Date of Birth      | No       | 1980-05-15
Gender             | No       | Male
Address            | No       | 123 Main St
```

**Step 3: Professional Information**
```
Field              | Required | Example
-------------------|----------|------------------
License Number     | Yes      | LIC-001234
Specialization     | Yes      | Cardiothoracic Surgery
Years of Experience| Yes      | 15
Department         | Yes      | Cardiothoracic
Qualifications     | Yes      | MBBS, MS Surgery
```

**Step 4: Availability**
- Set working hours
  - Monday-Friday: 08:00-17:00
  - On-call weekends
  
**Step 5: Review and Save**
- Check all information
- Click "Create"
- Staff profile created

### Updating Staff Information

**Step 1: Select Staff**
- Click staff name
- Profile opens

**Step 2: Click "Edit"**
- Modify information
- Update qualifications
- Change availability
- Update status

**Step 3: Review Changes**
- Verify updates
- Click "Save"
- Changes applied

### Deactivating Staff

**To Set Status to Inactive**
1. Open staff profile
2. Click "Change Status"
3. Select "Inactive"
4. Add reason (optional)
5. Confirm

**To Set Status to On-Leave**
1. Open staff profile
2. Click "Change Status"
3. Select "On-Leave"
4. Enter leave dates
5. Add reason
6. Confirm

---

## Staff Profiles

### Viewing Profile Details

**Staff Information**
- Personal details
- Contact information
- Professional background
- Qualifications
- Specializations

**Employment Details**
- Department
- Years of experience
- Status
- Availability schedule
- Working hours

**Contact Information**
- Email address
- Phone number
- Office location
- Emergency contact

### Managing Qualifications

**Add Qualification**
1. Open staff profile
2. Go to "Qualifications" section
3. Click "Add Qualification"
4. Enter:
   - Qualification name (MBBS, MS, etc.)
   - Issuing organization
   - Date obtained
   - Expiry date (if applicable)
5. Save

**Update Qualification**
1. Open staff profile
2. Click on qualification
3. Edit details
4. Save changes

**Track Expiries**
- System alerts for:
  - Upcoming expiry dates
  - Expired certifications
  - Renewal requirements

### Managing Licenses

**Add License**
1. Open staff profile
2. Go to "Licenses" section
3. Click "Add License"
4. Enter:
   - License number
   - Issuing authority
   - Issue date
   - Expiry date
5. Upload certificate (optional)
6. Save

**License Tracking**
- Expiry date monitoring
- Renewal reminders
- Compliance verification
- Historical records

---

## Scheduling & Availability

### Viewing Staff Schedule

**Step 1: Open Staff Profile**
- Click staff name

**Step 2: Go to "Schedule" Tab**
- Shows assigned surgeries
- Color-coded by date
- Task details display on click

**Step 3: View Details**
- Surgery type
- Date and time
- Patient name
- Theatre assigned
- Duration

### Filtering Schedule

**By Date Range**
- Select start date
- Select end date
- View filtered surgeries

**By Status**
- Scheduled
- In-progress
- Completed

**By Category**
- By surgery type
- By priority
- By theatre

### Updating Availability

**Set Working Hours**
1. Open staff profile
2. Click "Set Availability"
3. Define schedule:
   - Monday: 08:00-17:00
   - Tuesday: 08:00-17:00
   - (etc.)
4. Set on-call hours (optional)
5. Save

**Mark Leave**
1. Open staff profile
2. Click "Add Leave"
3. Enter:
   - Leave start date
   - Leave end date
   - Leave type
   - Reason
4. Save

**Manage Unavailable Dates**
1. Click "Add Unavailable Date"
2. Select date
3. Add reason (optional)
4. Save

### Checking Staff Availability

**For Scheduling**
1. Go to Surgery creation
2. Select date and time
3. System shows available staff
4. Click "View Available" for specific role

**Quick Availability Check**
1. Open staff profile
2. Click "Check Availability"
3. Select date and time
4. System confirms availability

---

## Staff Analytics

### Viewing Statistics

**Individual Staff Statistics**
1. Open staff profile
2. Go to "Statistics" tab
3. View metrics:
   - Total surgeries
   - Average duration
   - Success rate
   - Specialization usage
   - Monthly workload

**Department Statistics**
1. Navigate to "Analytics"
2. Select "By Department"
3. View:
   - Total staff count
   - Workload distribution
   - Specialization mix
   - Performance metrics

### Performance Metrics

**Track Individual Performance**
- Number of surgeries performed
- Average surgery duration
- Outcomes (successful/complications)
- Patient satisfaction (if available)
- Attendance rate

**Department Performance**
- Total surgeries per department
- Average duration
- Utilization rate
- Workload distribution
- Peak times

### Generating Reports

**Create Staff Report**
1. Click "Generate Report"
2. Select report type:
   - Workload Report
   - Performance Report
   - Schedule Report
   - Utilization Report

3. Set parameters:
   - Date range
   - Staff member/department
   - Include metrics

4. Generate and download

**Report Formats**
- PDF (formatted)
- Excel (spreadsheet)
- CSV (data only)

---

## Common Tasks

### Assigning Staff to Surgery

**Method 1: From Surgery**
1. Open surgery details
2. Click "Assign Staff"
3. Select staff by role:
   - Surgeon
   - Nurses (multiple)
   - Anaesthetist
   - Technician
4. Verify availability
5. Confirm assignment

**Method 2: System Check**
1. System automatically checks:
   - Staff availability
   - Specialization match
   - Current workload
   - Conflicts
2. Alerts for issues
3. Suggests alternatives

### Handling Absences

**When Staff Is Absent**
1. Open staff profile
2. Change status to "Inactive"
3. System identifies affected surgeries
4. Provides reassignment options
5. Reassign staff
6. Send notifications

**Reassigning Surgeries**
1. View affected surgeries
2. Click "Reassign"
3. Select replacement staff
4. Verify compatibility
5. Confirm

### Managing Workload

**Monitor Individual Workload**
1. Open staff statistics
2. Check upcoming surgeries
3. Identify overload situations
4. Redistribute assignments

**Fair Distribution**
1. Check department statistics
2. Identify imbalances
3. Rebalance workload
4. Communicate changes

### Updating Certifications

**When Certification Expires**
1. System sends notification
2. Open staff profile
3. Update certification:
   - Renewal date
   - New expiry date
   - Upload certificate
4. Mark as current

---

## FAQ

### Q: How do I know if staff is available?

**A:** 
1. Open staff profile
2. Check "Availability" section
3. View schedule
4. During surgery creation, available staff automatically shows

### Q: Can I assign staff to multiple surgeries?

**A:** Yes, but:
- Staff cannot be in two places at once
- System prevents time conflicts
- Overlapping surgeries shown in red

### Q: What happens when staff member goes on leave?

**A:** 
- Their status changes to "On-Leave"
- They don't appear in availability lists
- Their surgeries are listed
- You can reassign surgeries

### Q: How do I track staff qualifications?

**A:** 
1. Open staff profile
2. Go to "Qualifications"
3. View all credentials
4. See expiry dates
5. Get renewal reminders

### Q: Can I see staff performance?

**A:** Yes:
1. Open staff profile
2. Go to "Statistics"
3. View performance metrics
4. Download performance report

### Q: How to handle staff turnover?

**A:**
- Mark status as "Inactive"
- Reassign surgeries to others
- Keep records for compliance
- Archive profile

---

## Troubleshooting

### Staff Not Appearing in Available List

**Possible Causes:**
1. Status is not "Active"
   - **Solution**: Change status to "Active"

2. Already assigned to overlapping surgery
   - **Solution**: Check schedule
   - Resolve conflicts

3. Outside working hours
   - **Solution**: Check availability hours
   - Extend hours if needed

4. Leave scheduled
   - **Solution**: Verify leave dates
   - Adjust dates if needed

### Cannot Assign Staff to Surgery

**Possible Causes:**
1. Time conflict
   - **Solution**: Choose different staff
   - Reschedule surgery

2. Missing qualifications
   - **Solution**: Only assign qualified staff
   - Contact administrator if qualified

3. Department mismatch
   - **Solution**: Assign from correct department
   - Update staff department if needed

### Staff Not Receiving Notifications

**Possible Causes:**
1. Email not configured
   - **Solution**: Update email address
   - Verify email format

2. Notification preferences disabled
   - **Solution**: Check preferences
   - Enable notifications

3. System issue
   - **Solution**: Contact support
   - Check system status

### Cannot Delete Staff Profile

**Possible Causes:**
1. Still assigned to surgeries
   - **Solution**: Archive profile instead
   - Set status to "Inactive"

2. Historical data attached
   - **Solution**: Keep for compliance
   - Don't delete; deactivate

---

## Best Practices

### Staff Management
1. ✅ Keep information updated
2. ✅ Monitor qualifications expiry
3. ✅ Track workload distribution
4. ✅ Document all changes
5. ❌ Don't assign unavailable staff

### Scheduling
1. ✅ Check availability before assigning
2. ✅ Balance workload fairly
3. ✅ Plan ahead for leaves
4. ✅ Use system recommendations
5. ❌ Don't overload single staff

### Qualifications
1. ✅ Update annually
2. ✅ Set expiry reminders
3. ✅ Document renewals
4. ✅ Maintain compliance
5. ❌ Don't use expired credentials

### Communication
1. ✅ Notify of assignments early
2. ✅ Confirm availability
3. ✅ Communicate changes
4. ✅ Send schedule updates
5. ❌ Don't make unexpected changes

---

**Last Updated:** March 21, 2025
**Version:** 1.0.0
