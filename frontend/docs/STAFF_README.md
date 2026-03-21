# Staff Management Module README

**Developers:** M4 (Oneli), M3 (Janani), M6 (Dinil) | **Day:** 27

## Overview

The Staff Management module handles all medical and support personnel including surgeons, nurses, anaesthetists, and technicians. It manages staff profiles, schedules, qualifications, and availability for surgical procedures.

## Features

✅ **Staff Profiles**
- Create and manage staff profiles
- Track licenses and qualifications
- Update staff information
- Manage specializations and experience

✅ **Schedule Management**
- View staff schedules
- Manage staff availability
- Handle scheduling conflicts
- Check availability for surgeries

✅ **Status Management**
- Track active/inactive staff
- Manage leave periods
- Handle suspensions
- Status history tracking

✅ **Department Organization**
- Organize staff by department
- Track specializations
- Manage expertise areas
- Department-based reporting

✅ **Qualifications & Licenses**
- Track professional licenses
- Record qualifications
- Monitor license renewals
- Compliance verification

✅ **Performance Metrics**
- Track assignments per staff
- Surgery participation count
- Performance analytics
- Workload distribution

## Project Structure

```
backend/
├── routes/
│   ├── surgeonRoutes.js        # Surgeon endpoints
│   ├── nurseRoutes.js          # Nurse endpoints
│   ├── anaesthetistRoutes.js   # Anaesthetist endpoints
│   └── technicianRoutes.js     # Technician endpoints
├── controllers/
│   ├── surgeonController.js
│   ├── nurseController.js
│   ├── anaesthetistController.js
│   └── technicianController.js
├── models/
│   ├── surgeonModel.js
│   ├── nurseModel.js
│   ├── anaesthetistModel.js
│   └── technicianModel.js
└── tests/
    └── staff.test.js
```

## API Endpoints

### Surgeons
- `POST /api/surgeons` - Create surgeon
- `GET /api/surgeons` - Get all surgeons
- `GET /api/surgeons/:id` - Get surgeon details
- `PUT /api/surgeons/:id` - Update surgeon
- `PATCH /api/surgeons/:id/status` - Update status
- `GET /api/surgeons/:id/schedule` - Get schedule
- `DELETE /api/surgeons/:id` - Delete surgeon

### Nurses
- `POST /api/nurses` - Create nurse
- `GET /api/nurses` - Get all nurses
- `GET /api/nurses/:id` - Get nurse details
- `PUT /api/nurses/:id` - Update nurse
- `PATCH /api/nurses/:id/status` - Update status
- `GET /api/nurses/:id/schedule` - Get schedule
- `DELETE /api/nurses/:id` - Delete nurse

### Anaesthetists
- `POST /api/anaesthetists` - Create anaesthetist
- `GET /api/anaesthetists` - Get all anaesthetists
- `GET /api/anaesthetists/:id` - Get details
- `PUT /api/anaesthetists/:id` - Update anaesthetist
- `PATCH /api/anaesthetists/:id/status` - Update status
- `GET /api/anaesthetists/:id/schedule` - Get schedule
- `DELETE /api/anaesthetists/:id` - Delete anaesthetist

### Technicians
- `POST /api/technicians` - Create technician
- `GET /api/technicians` - Get all technicians
- `GET /api/technicians/:id` - Get details
- `PUT /api/technicians/:id` - Update technician
- `PATCH /api/technicians/:id/status` - Update status
- `GET /api/technicians/:id/schedule` - Get schedule
- `DELETE /api/technicians/:id` - Delete technician

## Quick Start

### 1. Create a Surgeon

```bash
curl -X POST http://localhost:5000/api/surgeons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@hospital.com",
    "licenseNumber": "LIC-001234",
    "specialization": "Cardiothoracic Surgery",
    "yearsOfExperience": 15,
    "qualifications": ["MBBS", "MS Surgery"],
    "department": "Cardiothoracic"
  }'
```

### 2. Create a Nurse

```bash
curl -X POST http://localhost:5000/api/nurses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@hospital.com",
    "licenseNumber": "NUR-5678",
    "specialization": "Operating Theatre",
    "yearsOfExperience": 8,
    "qualifications": ["RN", "BSN"],
    "department": "Surgical"
  }'
```

### 3. Get Available Staff

```bash
# Get available surgeons for a specific date/time
curl -X GET "http://localhost:5000/api/surgeries/surgeons/available?date=2025-04-15&time=09:00&duration=120" \
  -H "Authorization: Bearer <token>"
```

### 4. View Staff Schedule

```bash
curl -X GET "http://localhost:5000/api/surgeons/surgeon-uuid/schedule?startDate=2025-04-01&endDate=2025-04-30" \
  -H "Authorization: Bearer <token>"
```

### 5. Update Staff Status

```bash
curl -X PATCH http://localhost:5000/api/surgeons/surgeon-uuid/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "on-leave",
    "leaveStartDate": "2025-04-01",
    "leaveEndDate": "2025-04-15",
    "reason": "Annual leave"
  }'
```

## Staff Types

### Surgeon
- Specialization in surgical procedures
- License and certifications required
- Leads surgical teams
- Responsible for surgical decisions
- Experience-based assignments

### Nurse
- Operating theatre nursing
- Patient care and monitoring
- Instrument management
- Vital signs tracking
- May be assigned multiple surgeries

### Anaesthetist
- Anaesthesia administration
- Patient monitoring during surgery
- Airway management
- Pain management
- Critical care oversight

### Technician
- Surgical equipment operation
- Instrument sterilization
- Technical support
- Equipment maintenance assistance
- Setup and cleanup

## Staff Status Values

| Status | Description | Available |
|--------|-------------|-----------|
| active | Available for surgeries | ✅ |
| inactive | Not available | ❌ |
| on-leave | Temporary leave | ❌ |
| suspended | Suspended from duties | ❌ |

## Database Schema

### Staff Base Table Fields
- `id` (UUID) - Primary key
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `email` (VARCHAR)
- `phoneNumber` (VARCHAR)
- `licenseNumber` (VARCHAR)
- `status` (ENUM)
- `yearsOfExperience` (INTEGER)
- `department` (VARCHAR)
- `specialization` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Additional Fields
- `qualifications` (ARRAY)
- `availability` (VARCHAR)
- `notes` (TEXT)

## Filtering Examples

```bash
# Get active surgeons
GET /api/surgeons?status=active

# Get surgeons by specialization
GET /api/surgeons?specialization=Cardiothoracic

# Get nurses with operating theatre experience
GET /api/nurses?specialization=Operating%20Theatre

# Get all anaesthetists
GET /api/anaesthetists

# Combine filters
GET /api/surgeons?status=active&department=Cardiothoracic
```

## Business Rules

1. **Unique Licenses**: License numbers must be unique
2. **Active Status**: Only active staff can be assigned to surgeries
3. **Leave Management**: Staff on leave cannot be assigned
4. **Qualifications**: Staff must have required qualifications for surgeries
5. **Availability**: Staff scheduled must be available at surgery time
6. **Workload**: Fair distribution across available staff

## Integration with Other Modules

- **Surgery Module**: Staff assigned to surgeries
- **Auth Module**: Staff accounts linked to user accounts
- **Theatre Module**: Staff assigned per theatre
- **Notification Module**: Alerts on schedule changes
- **Analytics Module**: Staff performance tracking

## Performance Metrics

- Staff profile retrieval: < 300ms
- Schedule query: < 500ms
- Availability check: < 200ms
- Staff list (limit 100): < 1s

## Reporting Features

Available reports:
- Staff workload distribution
- Surgery assignments per staff
- Department statistics
- Specialization distribution
- Experience analysis
- Leave patterns

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
npm test -- staff.test.js
```

## Compliance & Certifications

- ✅ License tracking and renewal reminders
- ✅ Qualification documentation
- ✅ Professional development records
- ✅ Workload compliance
- ✅ Leave balance tracking

## Future Enhancements

- [ ] Performance rating system
- [ ] Professional development tracking
- [ ] Continuing education credits
- [ ] Peer review system
- [ ] Advanced scheduling optimization
- [ ] Predictive workload management

## Support & Documentation

- **API Documentation**: See [STAFF_API.md](../docs/api/STAFF_API.md)
- **User Manual**: See [STAFF_USER_MANUAL.md](../docs/user-manuals/STAFF_USER_MANUAL.md)

---

**Last Updated:** March 21, 2025
**Version:** 1.0.0
