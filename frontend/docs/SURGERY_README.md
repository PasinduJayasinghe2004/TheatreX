# Surgery Module README

**Developer:** M2 (Chandeepa) | **Day:** 27

## Overview

The Surgery module manages the complete surgical workflow including scheduling, staff assignment, theatre booking, status tracking, and historical records. It provides comprehensive surgical procedure management with conflict detection and resource optimization.

## Features

✅ **Surgery Management**
- Create and schedule surgeries
- View all surgeries with filters
- Update surgery details
- Track surgery status
- Cancel surgeries when needed

✅ **Scheduling & Conflict Detection**
- Automatic conflict detection (surgeon, staff, theatre)
- Staff availability checking
- Theatre availability management
- Calendar view integration
- Time slot management

✅ **Staff Management**
- Assign surgeons, nurses, anaesthetists, technicians
- Check staff availability
- View available staff at specified times
- Manage staff schedules
- Handle staff conflicts

✅ **Theatre Management**
- Assign theatres to surgeries
- View unassigned surgeries
- Theatre availability verification
- Equipment readiness checks
- Theatre maintenance handling

✅ **Historical Records**
- Completed surgery history
- Export history to CSV
- Surgery outcome tracking
- Audit trail maintenance
- Performance analytics

✅ **Reporting & Analytics**
- Calendar events generation
- Historical data export
- Surgery statistics
- Staff performance metrics

## Project Structure

```
backend/
├── routes/
│   └── surgeryRoutes.js        # Surgery endpoints
├── controllers/
│   └── surgeryController.js    # Surgery logic
├── models/
│   ├── surgeryModel.js         # Surgery schema
│   └── surgeryNurseModel.js    # Junction table
├── middleware/
│   └── authMiddleware.js       # Authorization
└── tests/
    └── surgery.test.js         # Surgery tests
```

## API Endpoints

### Surgery Management
- `POST /api/surgeries` - Create new surgery
- `GET /api/surgeries` - Get all surgeries with filters
- `GET /api/surgeries/:id` - Get surgery details
- `PUT /api/surgeries/:id` - Update surgery
- `PATCH /api/surgeries/:id/status` - Update status
- `DELETE /api/surgeries/:id` - Delete surgery

### Advanced Features
- `GET /api/surgeries/unassigned` - Unassigned surgeries
- `GET /api/surgeries/history` - Completed surgeries
- `GET /api/surgeries/history/export/csv` - Export history
- `GET /api/surgeries/:id/export/csv` - Export single surgery
- `POST /api/surgeries/check-conflicts` - Check conflicts
- `POST /api/surgeries/check-staff-conflicts` - Staff conflicts

### Staff & Theatre
- `PATCH /api/surgeries/:id/assign-theatre` - Assign theatre
- `GET /api/surgeries/surgeons` - Surgeons dropdown
- `GET /api/surgeries/surgeons/available` - Available surgeons
- `GET /api/surgeries/nurses/available` - Available nurses
- `GET /api/surgeries/anaesthetists/available` - Available anaesthetists
- `GET /api/surgeries/events` - Calendar events

## Quick Start

### 1. Create a Surgery

```bash
curl -X POST http://localhost:5000/api/surgeries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "patientId": "patient-uuid",
    "surgeryType": "Appendectomy",
    "scheduledDate": "2025-04-15",
    "scheduledTime": "09:00",
    "estimatedDuration": 120,
    "surgeonId": "surgeon-uuid",
    "nurseIds": ["nurse-uuid1", "nurse-uuid2"],
    "anaesthetistId": "anaesthetist-uuid",
    "priority": "routine"
  }'
```

### 2. Check for Conflicts

```bash
curl -X POST http://localhost:5000/api/surgeries/check-conflicts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "surgeonId": "surgeon-uuid",
    "scheduledDate": "2025-04-15",
    "scheduledTime": "09:00",
    "estimatedDuration": 120
  }'
```

### 3. Get Available Surgeons

```bash
curl -X GET "http://localhost:5000/api/surgeries/surgeons/available?date=2025-04-15&time=09:00&duration=120" \
  -H "Authorization: Bearer <token>"
```

### 4. Assign Theatre

```bash
curl -X PATCH http://localhost:5000/api/surgeries/surgery-uuid/assign-theatre \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "theatreId": "theatre-uuid"
  }'
```

### 5. Update Surgery Status

```bash
curl -X PATCH http://localhost:5000/api/surgeries/surgery-uuid/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "in-progress"
  }'
```

## Surgery Status Flow

```
scheduled → in-progress → completed
   ↓            ↓
cancelled    (various statuses)
```

### Status Descriptions

| Status | Description |
|--------|-------------|
| scheduled | Surgery awaiting execution |
| in-progress | Surgery currently in progress |
| completed | Surgery finished |
| cancelled | Surgery cancelled |

## Priority Levels

| Priority | Description |
|----------|-------------|
| urgent | Emergency, immediate scheduling |
| high | Important, schedule ASAP |
| routine | Standard, normal scheduling |
| elective | Non-urgent, flexible |

## Filtering Examples

```bash
# By status
GET /api/surgeries?status=scheduled

# By surgeon
GET /api/surgeries?surgeonId=surgeon-uuid

# By theatre
GET /api/surgeries?theatreId=theatre-uuid

# By date range
GET /api/surgeries?startDate=2025-04-01&endDate=2025-04-30

# Combined
GET /api/surgeries?status=scheduled&surgeonId=uuid&startDate=2025-04-01
```

## Conflict Types

| Conflict | Description |
|----------|-------------|
| surgeon_busy | Surgeon assigned elsewhere |
| nurse_busy | Nurse(s) unavailable |
| anaesthetist_busy | Anaesthetist unavailable |
| technician_busy | Technician unavailable |
| theatre_unavailable | Theatre booked/maintenance |
| insufficient_capacity | Not enough staff |

## Database Schema

### Surgeries Table
- `id` (UUID) - Primary key
- `patientId` (UUID) - Foreign key to patients
- `surgeryType` (VARCHAR)
- `surgeryCategory` (VARCHAR)
- `scheduledDate` (DATE)
- `scheduledTime` (TIME)
- `estimatedDuration` (INTEGER) - Minutes
- `actualDuration` (INTEGER)
- `status` (ENUM)
- `surgeonId` (UUID)
- `theatreId` (UUID)
- `anaesthetistId` (UUID)
- `priority` (ENUM)
- `notes` (TEXT)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Surgery-Nurse Junction Table
- `surgeryId` (UUID)
- `nurseId` (UUID)
- Creates many-to-many relationship

## Integration with Other Modules

- **Auth Module**: Requires authentication and proper roles
- **Patient Module**: Links to patient records
- **Theatre Module**: Requires available theatre assignment
- **Staff Module**: Requires available staff members
- **Notification Module**: Sends notifications on status changes

## Business Rules

1. **Conflict Prevention**: System prevents double-booking of staff/theatres
2. **Staffing Requirements**: Every surgery needs at least surgeon + anaesthetist
3. **Duration Validation**: Surgery duration must be reasonable (15 min - 8 hours)
4. **Status Workflow**: Status changes follow strict progression rules
5. **Historical Data**: Completed surgeries archived for compliance

## Performance Metrics

- Surgery creation: < 1s
- Conflict checking: < 500ms
- Availability queries: < 300ms
- History export (1000 records): < 5s

## Error Handling

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional information"
  }
}
```

## Testing

```bash
npm test -- surgery.test.js
```

## Future Enhancements

- [ ] Automated staff assignment based on specialization
- [ ] Real-time scheduling optimization
- [ ] Predictive duration estimation
- [ ] Surgery outcome analytics dashboard
- [ ] Integration with hospital EHR systems

## Support & Documentation

- **API Documentation**: See [SURGERY_API.md](../docs/api/SURGERY_API.md)
- **Feature Guide**: See [FEATURE_GUIDE.md](../docs/guides/FEATURE_GUIDE.md)

---

**Last Updated:** March 21, 2025
**Version:** 1.0.0
