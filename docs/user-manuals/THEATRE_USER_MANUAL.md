# Theatre Management System User Manual

**Developer:** M3 (Janani) | **Day:** 27

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Theatre Operations](#theatre-operations)
4. [Equipment Management](#equipment-management)
5. [Scheduling & Availability](#scheduling--availability)
6. [Maintenance & Hygiene](#maintenance--hygiene)
7. [Analytics & Reports](#analytics--reports)
8. [FAQ](#faq)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is Theatre Management?

The Theatre Management System helps you manage operating room resources, schedules, equipment, and maintenance. It ensures optimal theatre utilization and maintains compliance with safety standards.

### Key Benefits

- **Efficiency**: Automated scheduling and conflict detection
- **Safety**: Equipment tracking and maintenance records
- **Compliance**: Documentation and audit trails
- **Optimization**: Resource utilization analytics
- **Control**: Centralized theatre management

---

## Getting Started

### Accessing the System

1. Open your browser
2. Navigate to `http://localhost:5173/` (or your server URL)
3. Login with your credentials
4. Select "Theatres" from the main menu

### User Interface Overview

```
┌─────────────────────────────────────────┐
│         Theatre Management              │
├──────────────┬──────────────────────────┤
│              │   Theatre List View      │
│  Left Menu   │   - Filters              │
│  - Theatres  │   - Search               │
│  - Equipment │   - Actions              │
│  - Schedule  │                          │
│  - Reports   │                          │
└──────────────┴──────────────────────────┘
```

### Navigation

- **Main Menu**: Left sidebar for major functions
- **Search Bar**: Quick theatre lookup
- **Filters**: Narrow results
- **Action Buttons**: Perform operations
- **Breadcrumbs**: Understand location in system

---

## Theatre Operations

### Viewing Theatres

**1. Theatre List View**
- Shows all theatres
- Displays basic information
- Indicates status (active/maintenance)
- Shows upcoming surgeries count

**2. Filter Options**
- Filter by status
  - Active
  - Maintenance
  - Closed
- Filter by location
- Filter by capacity

**3. Theatre Details**
- Theatre name and number
- Location information
- Capacity and equipment
- Operating hours
- Current status

### Creating a Theatre

**Step 1: Click "Add Theatre"**
- Navigate to Theatres section
- Click "Add Theatre" button
- Fill theatre form

**Step 2: Enter Basic Information**
```
Field           | Example
----------------|------------------
Name            | Theatre A
Theatre Number  | OT-001
Location        | Block B, Floor 3
Capacity        | 8 people
Status          | Active
Available From  | 07:00
Available To    | 20:00
```

**Step 3: Add Equipment**
- Click "Add Equipment"
- Enter equipment name
- Specify quantity
- Set purchase date
- Add warranty info

**Step 4: Review and Save**
- Verify all information
- Click "Create Theatre"
- System confirms creation

### Updating Theatre Information

**Step 1: Select Theatre**
- Click on theatre name
- Theatre details open

**Step 2: Click "Edit"**
- Modify information
- Update equipment list
- Change operating hours
- Update capacity

**Step 3: Save Changes**
- Review changes
- Click "Save"
- Changes saved immediately

### Changing Theatre Status

**Step 1: Select Theatre**
- Open theatre details

**Step 2: Click "Change Status"**
- Current status displays
- Select new status
  - Active (ready for use)
  - Maintenance (under repair)
  - Closed (permanently closed)

**Step 3: Add Details**
- For maintenance: add reason and duration
- For closure: add reason

**Step 4: Confirm**
- System updates availability
- Surgeries affected notified

---

## Equipment Management

### Viewing Equipment

**Step 1: Open Theatre**
- Navigate to Theatres
- Click on theatre name
- Equipment tab shows all items

**Step 2: Equipment List Shows**
- Equipment name
- Quantity
- Status (active/maintenance/faulty)
- Purchase date
- Warranty expiry

**Step 3: Filter Equipment**
- By status
- By category
- By purchase date

### Adding Equipment

**Step 1: Click "Add Equipment"**
- Open theatre details
- Go to Equipment tab
- Click "Add Equipment"

**Step 2: Enter Equipment Details**
```
Field           | Example
----------------|------------------
Equipment Name  | Surgical Light
Quantity        | 2
Purchase Date   | 2025-03-20
Warranty Expiry | 2027-03-20
Notes           | High-powered LED
```

**Step 3: Save**
- Review information
- Click "Add"
- Equipment added to theatre

### Updating Equipment

**Step 1: Find Equipment**
- Open theatre
- Go to Equipment tab
- Click on equipment

**Step 2: Update Details**
- Change status
  - Active
  - Under Maintenance
  - Faulty
  - Retired
- Add maintenance notes
- Update warranty date

**Step 3: Save Changes**
- Click "Update"
- Changes saved

### Removing Equipment

**Step 1: Select Equipment**
- Open theatre
- Go to Equipment tab
- Click equipment

**Step 2: Click "Delete"**
- Confirm deletion
- Equipment removed
- Historical record maintained

---

## Scheduling & Availability

### Checking Theatre Availability

**Step 1: Open Theatre**
- Click on theatre name
- Go to "Schedule" tab

**Step 2: Select Date**
- Choose date to check
- View all surgeries scheduled
- See available time slots

**Step 3: View Details**
- Surgery time
- Assigned surgeon
- Patient name
- Estimated duration

### Theatre Schedule View

**Weekly View**
- See full week at a glance
- Color-coded surgeries
- Quick slot identification
- Easy rescheduling

**Monthly View**
- Overview of month
- Identify peak times
- Plan maintenance windows
- See total surgeries

### Assigning Theatre to Surgery

**Automatic Assignment**
- System suggests available theatre
- Based on time and equipment
- One-click confirmation

**Manual Assignment**
1. Open unassigned surgery
2. Click "Assign Theatre"
3. Select from available options
4. Confirm assignment

---

## Maintenance & Hygiene

### Scheduling Maintenance

**Step 1: Open Theatre**
- Navigate to theatre
- Go to "Maintenance" tab
- Click "Schedule Maintenance"

**Step 2: Enter Details**
```
Field               | Example
--------------------|------------------
Maintenance Type    | Preventive
Scheduled Date      | 2025-04-15
Scheduled Time      | 08:00
Estimated Duration  | 480 (minutes)
Description         | Quarterly maintenance
```

**Step 3: Review Impact**
- Shows affected surgeries
- Displays conflicts
- Provides reschedule options

**Step 4: Confirm**
- Click "Schedule"
- Notifications sent
- Theatre becomes unavailable

### Viewing Maintenance History

**Step 1: Open Theatre**
- Click on theatre
- Go to "Maintenance" tab

**Step 2: View History**
- List of past maintenance
- Dates and duration
- Maintenance type
- Completion status
- Technician notes

**Step 3: Filter History**
- By date range
- By maintenance type
- By status (completed/pending)

### Recording Cleaning

**Step 1: After Surgery**
- Theatre becomes available
- Click "Record Cleaning"

**Step 2: Enter Cleaning Details**
```
Field           | Example
----------------|------------------
Cleaning Type   | Standard/Deep
Cleaned By      | Staff name
Cleaning Time   | 30 (minutes)
Cleaning At     | Auto-filled
Notes           | Post-surgery disinfection
```

**Step 3: Save**
- Click "Save"
- Cleaning recorded
- Theatre status updated

### Viewing Cleaning History

**Step 1: Open Theatre**
- Go to "Cleaning History" tab

**Step 2: View Records**
- Cleaning dates
- Duration
- Staff member
- Cleaning type
- Completion confirmation

---

## Analytics & Reports

### Viewing Theatre Statistics

**Step 1: Open Theatre**
- Click on theatre
- Go to "Statistics" tab

**Step 2: View Metrics**
- Total surgeries count
- Average surgery duration
- Theatre utilization rate (%)
- Maintenance downtime (hours)
- Revenue per surgery (if applicable)

**Step 3: Surgery Breakdown**
- By surgery category
- By surgeon
- By month/period
- Peak usage times

### Generating Reports

**Step 1: Click "Generate Report"**
- Select report type
  - Utilization Report
  - Maintenance Report
  - Schedule Report
  - Equipment Report

**Step 2: Choose Parameters**
- Date range
- Filters
- Format (PDF/Excel)

**Step 3: Generate**
- System creates report
- File downloads automatically
- Print or share as needed

### Exporting Data

**Step 1: Select Data to Export**
- Theatre information
- Schedule data
- Equipment inventory
- Maintenance history

**Step 2: Choose Format**
- PDF (formatted report)
- Excel (spreadsheet)
- CSV (data only)

**Step 3: Download**
- File generates
- Downloads to computer
- Ready for sharing

---

## FAQ

### Q: Can I overbooking a theatre?

**A:** No. The system prevents double-booking. If a theatre is occupied, you cannot schedule another surgery at the same time.

### Q: How do I handle emergency surgeries?

**A:** 
1. Go to Theatre Schedule
2. Click "Emergency Surgery"
3. System finds fastest available slot
4. Existing surgeries may be suggested for rescheduling

### Q: What happens to surgeries when I schedule maintenance?

**A:** 
- System identifies conflicting surgeries
- Provides reschedule suggestions
- You can approve rescheduling
- Surgeries move to new slots automatically

### Q: How often should I clean the theatre?

**A:** 
- Standard cleaning: Between every surgery (30 min)
- Deep cleaning: End of day (60 min)
- Terminal cleaning: After infectious cases (90 min)

### Q: Where can I see equipment warranty information?

**A:** 
1. Open theatre
2. Go to Equipment tab
3. Click equipment
4. See "Warranty Expiry" date
5. System alerts when approaching expiry

### Q: Can I delete a theatre with surgeries assigned?

**A:** No. The system prevents deletion if surgeries are scheduled. You can only set status to "Closed".

---

## Troubleshooting

### Theatre Not Appearing in Availability List

**Possible Causes:**
1. Theatre status is "Maintenance" or "Closed"
   - **Solution**: Change status to "Active"

2. Theatre hours don't match surgery time
   - **Solution**: Check operating hours
   - Extend hours if needed

3. Required equipment is unavailable
   - **Solution**: Check equipment status
   - Mark equipment as active

### Can't Assign Theatre to Surgery

**Possible Causes:**
1. No available theatres at that time
   - **Solution**: Check theatre schedule
   - Adjust surgery time
   - Schedule theatre maintenance separately

2. Theatre equipment missing
   - **Solution**: Add required equipment
   - Mark equipment as active

3. Theatre not approved for that surgery type
   - **Solution**: Contact administrator
   - May need theatre reconfiguration

### Equipment Shows as Faulty

**Solution:**
1. Open theatre
2. Go to Equipment tab
3. Click on faulty equipment
4. Change status to "Under Maintenance"
5. Schedule maintenance
6. Change back to "Active" when repaired

### Maintenance Schedule Conflicts

**Possible Causes:**
1. Scheduled during active surgery time
   - **Solution**: Choose different date/time
   - Check "Available Windows"

2. Too frequent maintenance
   - **Solution**: Adjust maintenance interval
   - Plan better

---

## Best Practices

### Theatre Scheduling
1. ✅ Schedule maintenance during low-usage periods
2. ✅ Keep buffer between surgeries for cleaning
3. ✅ Plan maintenance quarterly
4. ✅ Document all maintenance work
5. ❌ Don't schedule back-to-back surgeries without cleaning

### Equipment Management
1. ✅ Check equipment before each surgery
2. ✅ Record maintenance regularly
3. ✅ Monitor warranty dates
4. ✅ Retire old equipment properly
5. ❌ Don't use faulty equipment

### Cleaning & Hygiene
1. ✅ Record every cleaning session
2. ✅ Use standard protocols
3. ✅ Ensure 30-min between surgeries
4. ✅ Deep clean end of day
5. ❌ Don't skip documentation

---

## Support

### Getting Help
- **Chat Support**: Click "Help" button in app
- **Email**: support@theatrex.app
- **Documentation**: See user guides and FAQs
- **Status Page**: Check system status

### Reporting Issues
- Click "Report Issue"
- Describe problem clearly
- Include screenshots
- Provide error messages
- Submit for investigation

---

**Last Updated:** March 21, 2025
**Version:** 1.0.0
