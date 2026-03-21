# Theatre Management Module README

**Developer:** M3 (Janani) | **Day:** 27

## Overview

The Theatre Module manages operating theatre resources, maintenance schedules, equipment tracking, and availability. It ensures optimal theatre utilization and maintains compliance with safety and maintenance standards.

## Features

✅ **Theatre Management**
- Create and manage operating theatres
- Track theatre status
- View theatre capacity and equipment
- Update theatre information

✅ **Equipment Management**
- Add equipment to theatres
- Track equipment status
- Maintenance scheduling
- Equipment inventory management

✅ **Availability Management**
- Check theatre availability for dates/times
- View theatre schedules
- Manage booking conflicts
- Availability calendar

✅ **Maintenance Management**
- Schedule theatre maintenance
- Track maintenance history
- Maintenance types and reasons
- Maintenance status tracking

✅ **Hygiene & Cleaning**
- Record cleaning activities
- Track disinfection procedures
- Cleaning history
- Compliance documentation

✅ **Statistics & Analytics**
- Theatre utilization rates
- Surgery statistics
- Downtime tracking
- Performance metrics

## Project Structure

```
backend/
├── routes/
│   └── theatreRoutes.js        # Theatre endpoints
├── controllers/
│   └── theatreController.js    # Theatre logic
├── models/
│   ├── theatreModel.js         # Theatre schema
│   └── equipmentModel.js       # Equipment schema
├── middleware/
│   └── authMiddleware.js       # Authorization
└── tests/
    └── theatre.test.js         # Theatre tests
```

## API Endpoints

### Theatre Management
- `POST /api/theatres` - Create theatre
- `GET /api/theatres` - Get all theatres
- `GET /api/theatres/:id` - Get theatre details
- `PUT /api/theatres/:id` - Update theatre
- `PATCH /api/theatres/:id/status` - Update status
- `DELETE /api/theatres/:id` - Delete theatre

### Equipment Management
- `POST /api/theatres/:id/equipment` - Add equipment
- `PATCH /api/theatres/:id/equipment/:equipmentId` - Update equipment
- `DELETE /api/theatres/:id/equipment/:equipmentId` - Remove equipment

### Availability & Scheduling
- `GET /api/theatres/:id/availability` - Check availability
- `GET /api/theatres/:id/schedule` - Get schedule

### Maintenance
- `POST /api/theatres/:id/maintenance` - Schedule maintenance
- `GET /api/theatres/:id/maintenance` - Maintenance history

### Cleaning
- `POST /api/theatres/:id/clean` - Record cleaning
- `GET /api/theatres/:id/cleaning-history` - Cleaning history

### Analytics
- `GET /api/theatres/:id/statistics` - Theatre statistics

## Quick Start

### 1. Create a Theatre

```bash
curl -X POST http://localhost:5000/api/theatres \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Theatre A",
    "theatreNumber": "OT-001",
    "location": "Block B, Floor 3",
    "capacity": 8,
    "equipmentList": [
      "Surgical Light",
      "Operating Table",
      "Anesthesia Machine"
    ],
    "availableFrom": "07:00",
    "availableTo": "20:00",
    "status": "active"
  }'
```

### 2. Check Availability

```bash
curl -X GET "http://localhost:5000/api/theatres/theatre-uuid/availability?date=2025-03-22&startTime=09:00&endTime=11:00" \
  -H "Authorization: Bearer <token>"
```

### 3. Add Equipment

```bash
curl -X POST http://localhost:5000/api/theatres/theatre-uuid/equipment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "equipmentName": "New Surgical Light",
    "quantity": 2,
    "purchaseDate": "2025-03-20"
  }'
```

### 4. Schedule Maintenance

```bash
curl -X POST http://localhost:5000/api/theatres/theatre-uuid/maintenance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "maintenanceType": "preventive",
    "scheduledDate": "2025-04-15",
    "estimatedDuration": 480,
    "description": "Quarterly maintenance"
  }'
```

### 5. Record Cleaning

```bash
curl -X POST http://localhost:5000/api/theatres/theatre-uuid/clean \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "cleaningType": "standard",
    "cleanedBy": "staff-uuid",
    "cleaningTime": 30
  }'
```

## Theatre Status Values

| Status | Description |
|--------|-------------|
| active | Ready for use |
| maintenance | Under maintenance |
| closed | Permanently closed |
| cleaning | Being cleaned |

## Equipment Status Values

| Status | Description |
|--------|-------------|
| active | Operational |
| under_maintenance | Temporarily unavailable |
| faulty | Needs repair |
| retired | No longer in use |

## Maintenance Types

| Type | Description | Typical Duration |
|------|-------------|------------------|
| preventive | Routine scheduled maintenance | 4-6 hours |
| reactive | Emergency repair | Variable |
| compliance | Safety/compliance checks | 2-3 hours |

## Database Schema

### Theatres Table
- `id` (UUID) - Primary key
- `name` (VARCHAR)
- `theatreNumber` (VARCHAR)
- `location` (VARCHAR)
- `capacity` (INTEGER)
- `status` (ENUM)
- `availableFrom` (TIME)
- `availableTo` (TIME)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Equipment Table
- `id` (UUID) - Primary key
- `theatreId` (UUID) - Foreign key
- `equipmentName` (VARCHAR)
- `quantity` (INTEGER)
- `status` (ENUM)
- `purchaseDate` (DATE)
- `warrantyExpiry` (DATE)
- `createdAt` (TIMESTAMP)

### Maintenance Table
- `id` (UUID)
- `theatreId` (UUID)
- `maintenanceType` (ENUM)
- `scheduledDate` (DATE)
- `completedDate` (DATE)
- `estimatedDuration` (INTEGER)
- `actualDuration` (INTEGER)

### Cleaning Table
- `id` (UUID)
- `theatreId` (UUID)
- `cleaningType` (ENUM)
- `cleanedBy` (UUID)
- `cleanedAt` (TIMESTAMP)
- `duration` (INTEGER)

## Business Rules

1. **Availability**: Theatre must be active and available within operating hours
2. **Conflict Prevention**: Same theatre cannot be booked overlapping times
3. **Maintenance**: Theatre becomes unavailable during scheduled maintenance
4. **Cleaning**: Standard 30-minute cleaning between surgeries
5. **Capacity**: Maximum occupants enforced per theatre
6. **Equipment**: All required equipment must be operational

## Integration with Other Modules

- **Surgery Module**: Theatres assigned to scheduled surgeries
- **Auth Module**: Theatre access based on user role
- **Staff Module**: Staff assigned per theatre for surgeries
- **Notification Module**: Sends alerts on maintenance/status changes

## Performance Metrics

- Theatre availability check: < 200ms
- Schedule retrieval: < 500ms
- Maintenance history (1 year): < 1s
- Equipment list retrieval: < 300ms

## Statistics Information

The statistics endpoint provides:
- Total surgeries count
- Average surgery duration
- Theatre utilization rate (percentage)
- Maintenance downtime (hours)
- Surgery breakdown by category
- Peak usage days/times

## Error Handling

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional details"
  }
}
```

## Testing

```bash
npm test -- theatre.test.js
```

## Compliance & Safety

- ✅ Equipment maintenance tracking for safety compliance
- ✅ Cleaning records for hygiene standards
- ✅ Maintenance history for regulatory audits
- ✅ Equipment warranty monitoring
- ✅ Safety checklist integration

## Future Enhancements

- [ ] Real-time theatre status dashboard
- [ ] Predictive maintenance scheduling
- [ ] Equipment lifecycle management
- [ ] 3D theatre layout visualization
- [ ] Integration with facilities management system

## Support & Documentation

- **API Documentation**: See [THEATRE_API.md](../docs/api/THEATRE_API.md)
- **User Manual**: See [THEATRE_USER_MANUAL.md](../docs/user-manuals/THEATRE_USER_MANUAL.md)

---

**Last Updated:** March 21, 2025
**Version:** 1.0.0
