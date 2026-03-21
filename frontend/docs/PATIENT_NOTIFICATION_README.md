# Patient & Notification Module README

**Developer:** M5 (Inthusha) | **Day:** 27

## Overview

The Patient module manages patient records, medical histories, and health information. The Notification module handles system notifications, reminders, and alerts for users and patients to keep everyone informed about important events.

## Features

### Patient Management
✅ **Patient Profiles**
- Create and manage patient records
- Store personal and medical information
- Emergency contact management
- Medical history tracking

✅ **Medical Information**
- Allergies and adverse reactions
- Medical conditions and diagnoses
- Current medications
- Previous surgeries
- Blood type and vital information

✅ **Health Records**
- Comprehensive medical history
- Surgery records
- Treatment tracking
- Outcome documentation
- Audit trail

✅ **Data Management**
- Export patient records (PDF/JSON/CSV)
- HIPAA compliant storage
- Secure data handling
- Privacy controls

### Notification Management
✅ **Notification Types**
- Surgery reminders (24 hours before)
- Staff alerts and schedule changes
- System announcements
- Patient updates
- Emergency notifications

✅ **Notification Delivery**
- Email notifications
- Push notifications
- SMS alerts
- In-app notifications
- Multi-channel delivery

✅ **User Control**
- Preference management
- Notification filtering
- Read/unread status
- Archive notifications
- Bulk operations

✅ **Analytics**
- Notification statistics
- Delivery tracking
- User engagement metrics
- Notification trends

## Project Structure

```
backend/
├── routes/
│   ├── patientRoutes.js        # Patient endpoints
│   └── notificationRoutes.js   # Notification endpoints
├── controllers/
│   ├── patientController.js    # Patient logic
│   └── notificationController.js # Notification logic
├── models/
│   ├── patientModel.js         # Patient schema
│   └── notificationModel.js    # Notification schema
├── middleware/
│   └── authMiddleware.js       # Authorization
│── utils/
│   └── scheduler.js            # Notification scheduler
└── tests/
    └── patient_notification.test.js
```

## API Endpoints

### Patient Management
- `POST /api/patients` - Create patient
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/:id/medical-history` - Medical history
- `POST /api/patients/:id/medical-history/conditions` - Add condition
- `POST /api/patients/:id/allergies` - Add allergy
- `POST /api/patients/:id/medications` - Add medication
- `GET /api/patients/:id/surgeries` - Surgery history
- `GET /api/patients/:id/export` - Export record
- `DELETE /api/patients/:id` - Delete patient

### Notifications
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/:id` - Get notification details
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all read
- `PATCH /api/notifications/:id/archive` - Archive
- `DELETE /api/notifications/:id` - Delete
- `GET /api/notifications/statistics` - Statistics
- `POST /api/notifications/bulk` - Bulk send
- `PUT /api/notifications/preferences` - Set preferences
- `GET /api/notifications/preferences` - Get preferences

## Quick Start

### 1. Create a Patient

```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1980-05-15",
    "gender": "male",
    "email": "john.doe@email.com",
    "phoneNumber": "+1-555-0123",
    "bloodType": "O+",
    "medicalHistory": ["Hypertension", "Diabetes"],
    "allergies": ["Penicillin"],
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phoneNumber": "+1-555-0124"
    }
  }'
```

### 2. Add Medical Condition

```bash
curl -X POST http://localhost:5000/api/patients/patient-uuid/medical-history/conditions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "condition": "Asthma",
    "diagnosedDate": "2010-05-20",
    "status": "ongoing",
    "notes": "Mild intermittent asthma"
  }'
```

### 3. Add Allergy

```bash
curl -X POST http://localhost:5000/api/patients/patient-uuid/allergies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "allergen": "Latex",
    "reactionType": "contact dermatitis",
    "severity": "moderate",
    "notes": "Avoid latex gloves"
  }'
```

### 4. Add Medication

```bash
curl -X POST http://localhost:5000/api/patients/patient-uuid/medications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Metformin",
    "dosage": "500mg",
    "frequency": "twice daily",
    "reason": "Diabetes Type 2",
    "prescribedDate": "2016-01-10"
  }'
```

### 5. Export Patient Record

```bash
# Export as PDF
curl -X GET "http://localhost:5000/api/patients/patient-uuid/export?format=pdf" \
  -H "Authorization: Bearer <token>" \
  --output patient_record.pdf

# Export as JSON
curl -X GET "http://localhost:5000/api/patients/patient-uuid/export?format=json" \
  -H "Authorization: Bearer <token>"
```

### 6. Create Notification

```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "recipientId": "user-uuid",
    "type": "surgery_reminder",
    "title": "Surgery Reminder",
    "message": "Your surgery is scheduled for tomorrow at 09:00 AM",
    "priority": "high",
    "relatedEntityId": "surgery-uuid"
  }'
```

### 7. Get User Notifications

```bash
curl -X GET "http://localhost:5000/api/notifications?status=unread&limit=20" \
  -H "Authorization: Bearer <token>"
```

### 8. Mark Notification as Read

```bash
curl -X PATCH http://localhost:5000/api/notifications/notification-uuid/read \
  -H "Authorization: Bearer <token>"
```

### 9. Set Notification Preferences

```bash
curl -X PUT http://localhost:5000/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "surgeryReminders": true,
    "reminderTime": "24hours"
  }'
```

## Patient Information Fields

### Basic Information
- First name, last name
- Date of birth
- Gender
- Contact email
- Phone number
- Address

### Medical Information
- Blood type
- Medical conditions
- Allergies and reactions
- Current medications
- Previous surgeries

### Contacts
- Emergency contact name, relationship, phone
- Preferred contact method
- Communication preferences

## Notification Types

| Type | Description | Trigger Event |
|------|-------------|---------------|
| surgery_reminder | Surgery upcoming | 24 hours before surgery |
| staff_alert | Staff assignments | Schedule confirmed |
| system_notification | System updates | Announcements |
| patient_update | Patient info changes | Medical record updated |
| theatre_maintenance | Theatre unavailable | Maintenance scheduled |
| emergency_alert | Critical alerts | Urgent issues |

## Notification Status Flow

```
sent → read
  ↓
unread → archived
  ↓
deleted
```

## Database Schema

### Patients Table
- `id` (UUID) - Primary key
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `dateOfBirth` (DATE)
- `gender` (ENUM)
- `email` (VARCHAR)
- `phoneNumber` (VARCHAR)
- `address` (TEXT)
- `bloodType` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Medical Conditions
- `id` (UUID)
- `patientId` (UUID)
- `condition` (VARCHAR)
- `diagnosedDate` (DATE)
- `status` (ENUM)
- `notes` (TEXT)

### Allergies
- `id` (UUID)
- `patientId` (UUID)
- `allergen` (VARCHAR)
- `reactionType` (VARCHAR)
- `severity` (ENUM)
- `notes` (TEXT)

### Medications
- `id` (UUID)
- `patientId` (UUID)
- `name` (VARCHAR)
- `dosage` (VARCHAR)
- `frequency` (VARCHAR)
- `startDate` (DATE)
- `endDate` (DATE)

### Notifications
- `id` (UUID)
- `recipientId` (UUID)
- `type` (ENUM)
- `title` (VARCHAR)
- `message` (TEXT)
- `priority` (ENUM)
- `status` (ENUM)
- `readAt` (TIMESTAMP)
- `archivedAt` (TIMESTAMP)
- `createdAt` (TIMESTAMP)

## Business Rules

1. **Patient Validation**: All required fields mandatory for creation
2. **Medical Safety**: Allergies checked before any treatment
3. **Medication Tracking**: Active medications monitored
4. **Notification Timing**: Surgery reminders sent 24 hours before
5. **Data Privacy**: HIPAA compliance enforced
6. **Audit Trail**: All modifications logged

## Integration with Other Modules

- **Surgery Module**: Patients undergo surgeries
- **Auth Module**: Patient data access controlled
- **Staff Module**: Staff view patient information
- **Theatre Module**: Patient routing to theatres

## Performance Metrics

- Patient profile retrieval: < 300ms
- Medical history query: < 500ms
- Notification list (limit 50): < 1s
- Bulk notification send (100): < 5s

## Export Formats

### PDF Export
- Formatted medical record
- Printable format
- All medical history
- Doctor's notes
- Signatures and dates

### JSON Export
- Structured data
- Machine-readable
- Complete record
- Hierarchy preserved
- Timestamped

### CSV Export
- Tabular format
- Excel compatible
- Key fields only
- Easy analysis
- Limited information

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

## Privacy & Compliance

- ✅ HIPAA compliant patient storage
- ✅ Encrypted medical records
- ✅ Access control by role
- ✅ Audit logging of access
- ✅ Patient data export capability
- ✅ Consent documentation
- ✅ Data retention policies

## Testing

```bash
npm test -- patient_notification.test.js
```

## Future Enhancements

- [ ] Patient portal with self-service
- [ ] Wearable device integration
- [ ] AI-based health recommendations
- [ ] Telemedicine integration
- [ ] Mobile app notifications
- [ ] Advanced patient analytics

## Support & Documentation

- **API Documentation**: See [PATIENT_NOTIFICATION_API.md](../docs/api/PATIENT_NOTIFICATION_API.md)
- **User Manual**: See [PATIENT_USER_MANUAL.md](../docs/user-manuals/PATIENT_USER_MANUAL.md)

---

**Last Updated:** March 21, 2025
**Version:** 1.0.0
