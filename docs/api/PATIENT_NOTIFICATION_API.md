# Patient & Notification API Documentation

**Developers:** M5 (Inthusha - Patients & Notifications) | **Day:** 27

## Overview

The Patient API manages patient records, medical histories, and health information. The Notification API handles system notifications, reminders, and alerts for users and patients.

## Base URLs

```
http://localhost:5000/api/patients
http://localhost:5000/api/notifications
```

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## PATIENT ENDPOINTS

### 1. Create Patient

**Endpoint:** `POST /patients`

**Authentication:** Required (Coordinator, Admin, Surgeon)

**Description:** Register a new patient

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-05-15",
  "gender": "male",
  "email": "john.doe@email.com",
  "phoneNumber": "+1-555-0123",
  "address": "123 Main Street, City, State",
  "medicalHistory": [
    "Hypertension",
    "Diabetes Type 2"
  ],
  "allergies": [
    "Penicillin",
    "Shellfish"
  ],
  "bloodType": "O+",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phoneNumber": "+1-555-0124"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "patient": {
    "id": "patient-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1980-05-15",
    "email": "john.doe@email.com",
    "bloodType": "O+",
    "createdAt": "2025-03-21T10:30:00Z"
  }
}
```

---

### 2. Get All Patients

**Endpoint:** `GET /patients`

**Authentication:** Required

**Description:** Retrieve all patients with optional filtering

**Query Parameters:**
- `search` (optional): Search by name or ID
- `bloodType` (optional): Filter by blood type
- `status` (optional): Filter by status
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "patients": [
    {
      "id": "patient-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1980-05-15",
      "email": "john.doe@email.com",
      "bloodType": "O+",
      "upcomingSurgeries": 1,
      "lastVisit": "2025-03-20T14:30:00Z"
    }
  ],
  "total": 350,
  "limit": 50,
  "offset": 0
}
```

---

### 3. Get Patient by ID

**Endpoint:** `GET /patients/:id`

**Authentication:** Required

**Description:** Get detailed patient information

**Response (200 OK):**
```json
{
  "success": true,
  "patient": {
    "id": "patient-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1980-05-15",
    "age": 44,
    "gender": "male",
    "email": "john.doe@email.com",
    "phoneNumber": "+1-555-0123",
    "address": "123 Main Street, City, State",
    "bloodType": "O+",
    "medicalHistory": [
      "Hypertension",
      "Diabetes Type 2"
    ],
    "allergies": [
      "Penicillin",
      "Shellfish"
    ],
    "medications": [
      "Metformin 500mg",
      "Lisinopril 10mg"
    ],
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phoneNumber": "+1-555-0124"
    },
    "upcomingSurgeries": [
      {
        "id": "surgery-uuid",
        "surgeryType": "Appendectomy",
        "scheduledDate": "2025-04-15",
        "scheduledTime": "09:00"
      }
    ],
    "pastSurgeries": 2,
    "createdAt": "2025-03-21T10:30:00Z",
    "lastUpdated": "2025-03-21T10:30:00Z"
  }
}
```

---

### 4. Update Patient

**Endpoint:** `PUT /patients/:id`

**Authentication:** Required (Coordinator, Admin, Surgeon)

**Description:** Update patient information

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1-555-0130",
  "address": "456 New Street, City, State",
  "medicalHistory": [
    "Hypertension",
    "Diabetes Type 2",
    "Asthma"
  ],
  "allergies": [
    "Penicillin",
    "Shellfish",
    "Latex"
  ],
  "medications": [
    "Metformin 500mg",
    "Lisinopril 10mg",
    "Albuterol inhaler"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "patient": {
    "id": "patient-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "lastUpdated": "2025-03-21T11:00:00Z"
  }
}
```

---

### 5. Get Patient Medical History

**Endpoint:** `GET /patients/:id/medical-history`

**Authentication:** Required

**Description:** Get detailed medical history

**Response (200 OK):**
```json
{
  "success": true,
  "medicalHistory": {
    "conditions": [
      {
        "condition": "Hypertension",
        "diagnosedDate": "2015-03-15",
        "status": "ongoing",
        "notes": "Well controlled with medication"
      }
    ],
    "allergies": [
      {
        "allergen": "Penicillin",
        "reactionType": "anaphylaxis",
        "severity": "severe"
      }
    ],
    "medications": [
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "startDate": "2016-01-10"
      }
    ],
    "surgeries": [
      {
        "surgeryType": "Knee Arthroscopy",
        "date": "2020-06-15",
        "outcome": "successful"
      }
    ]
  }
}
```

---

### 6. Add Medical Condition

**Endpoint:** `POST /patients/:id/medical-history/conditions`

**Authentication:** Required (Coordinator, Admin, Surgeon)

**Request Body:**
```json
{
  "condition": "Asthma",
  "diagnosedDate": "2010-05-20",
  "status": "ongoing",
  "notes": "Mild intermittent asthma"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Condition added successfully"
}
```

---

### 7. Add Allergy

**Endpoint:** `POST /patients/:id/allergies`

**Authentication:** Required (Coordinator, Admin, Surgeon)

**Request Body:**
```json
{
  "allergen": "Latex",
  "reactionType": "contact dermatitis",
  "severity": "moderate",
  "notes": "Avoid latex gloves"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Allergy recorded successfully"
}
```

---

### 8. Add Medication

**Endpoint:** `POST /patients/:id/medications`

**Authentication:** Required (Coordinator, Admin, Surgeon)

**Request Body:**
```json
{
  "name": "Albuterol",
  "dosage": "90 mcg",
  "frequency": "as needed",
  "reason": "Asthma",
  "prescribedDate": "2025-03-15"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Medication added successfully"
}
```

---

### 9. Get Patient Surgery History

**Endpoint:** `GET /patients/:id/surgeries`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "surgeries": [
    {
      "id": "surgery-uuid",
      "surgeryType": "Appendectomy",
      "date": "2025-03-21",
      "surgeon": "Dr. Smith",
      "theatre": "Theatre A",
      "duration": 125,
      "outcome": "successful",
      "notes": "Routine appendectomy"
    }
  ],
  "total": 2
}
```

---

### 10. Export Patient Record

**Endpoint:** `GET /patients/:id/export`

**Authentication:** Required

**Query Parameters:**
- `format` (optional, default: pdf): Export format (pdf, json, csv)

**Response:** Document download (PDF/JSON/CSV)

---

### 11. Delete Patient

**Endpoint:** `DELETE /patients/:id`

**Authentication:** Required (Admin)

**Description:** Delete patient record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

## NOTIFICATION ENDPOINTS

### 1. Create Notification

**Endpoint:** `POST /notifications`

**Authentication:** Required (System, Admin)

**Description:** Create a notification

**Request Body:**
```json
{
  "recipientId": "user-uuid",
  "type": "surgery_reminder",
  "title": "Surgery Reminder",
  "message": "Your surgery is scheduled for tomorrow at 09:00 AM",
  "priority": "high",
  "relatedEntityId": "surgery-uuid",
  "relatedEntityType": "surgery"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notification": {
    "id": "notification-uuid",
    "recipientId": "user-uuid",
    "title": "Surgery Reminder",
    "type": "surgery_reminder",
    "status": "sent",
    "createdAt": "2025-03-21T10:30:00Z"
  }
}
```

---

### 2. Get User Notifications

**Endpoint:** `GET /notifications`

**Authentication:** Required

**Description:** Get notifications for authenticated user

**Query Parameters:**
- `status` (optional): Filter by status (unread, read, archived)
- `type` (optional): Filter by type
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notification-uuid",
      "title": "Surgery Reminder",
      "message": "Your surgery is scheduled for tomorrow at 09:00 AM",
      "type": "surgery_reminder",
      "priority": "high",
      "status": "unread",
      "createdAt": "2025-03-21T10:30:00Z",
      "readAt": null
    }
  ],
  "total": 15,
  "unreadCount": 5
}
```

---

### 3. Get Notification by ID

**Endpoint:** `GET /notifications/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "notification": {
    "id": "notification-uuid",
    "recipientId": "user-uuid",
    "title": "Surgery Reminder",
    "message": "Your surgery is scheduled for tomorrow at 09:00 AM",
    "type": "surgery_reminder",
    "priority": "high",
    "status": "unread",
    "relatedEntityId": "surgery-uuid",
    "relatedEntityType": "surgery",
    "createdAt": "2025-03-21T10:30:00Z"
  }
}
```

---

### 4. Mark Notification as Read

**Endpoint:** `PATCH /notifications/:id/read`

**Authentication:** Required

**Description:** Mark notification as read

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "id": "notification-uuid",
    "status": "read",
    "readAt": "2025-03-21T11:00:00Z"
  }
}
```

---

### 5. Mark All Notifications as Read

**Endpoint:** `PATCH /notifications/read-all`

**Authentication:** Required

**Description:** Mark all user notifications as read

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "count": 5
}
```

---

### 6. Archive Notification

**Endpoint:** `PATCH /notifications/:id/archive`

**Authentication:** Required

**Description:** Archive a notification

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification archived",
  "notification": {
    "id": "notification-uuid",
    "status": "archived"
  }
}
```

---

### 7. Delete Notification

**Endpoint:** `DELETE /notifications/:id`

**Authentication:** Required

**Description:** Delete a notification

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 8. Get Notification Statistics

**Endpoint:** `GET /notifications/statistics`

**Authentication:** Required

**Description:** Get notification summary statistics

**Response (200 OK):**
```json
{
  "success": true,
  "statistics": {
    "totalNotifications": 150,
    "unreadNotifications": 5,
    "readNotifications": 145,
    "archivedNotifications": 0,
    "byType": {
      "surgery_reminder": 45,
      "staff_alert": 30,
      "system_notification": 75,
      "patient_update": 0
    },
    "byPriority": {
      "high": 10,
      "normal": 100,
      "low": 40
    }
  }
}
```

---

### 9. Send Bulk Notifications

**Endpoint:** `POST /notifications/bulk`

**Authentication:** Required (Admin, Coordinator)

**Description:** Send notifications to multiple recipients

**Request Body:**
```json
{
  "recipientIds": ["user-uuid-1", "user-uuid-2"],
  "type": "system_notification",
  "title": "System Maintenance",
  "message": "The system will be under maintenance tonight from 23:00 to 02:00",
  "priority": "high"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Notifications sent successfully",
  "sentCount": 2,
  "failedCount": 0
}
```

---

### 10. Configure Notification Preferences

**Endpoint:** `PUT /notifications/preferences`

**Authentication:** Required

**Description:** Update user's notification preferences

**Request Body:**
```json
{
  "emailNotifications": true,
  "pushNotifications": true,
  "smsNotifications": false,
  "surgeryReminders": true,
  "staffAlerts": true,
  "reminderTime": "24hours"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "surgeryReminders": true,
    "staffAlerts": true
  }
}
```

---

### 11. Get Notification Preferences

**Endpoint:** `GET /notifications/preferences`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "surgeryReminders": true,
    "staffAlerts": true,
    "reminderTime": "24hours"
  }
}
```

---

## Notification Types

| Type | Description |
|------|-------------|
| surgery_reminder | Surgery scheduled/upcoming reminders |
| staff_alert | Staff assignment/schedule changes |
| system_notification | System-wide announcements |
| patient_update | Patient information updates |
| theatre_maintenance | Theatre maintenance alerts |
| emergency_alert | Emergency notifications |

---

## Notification Priority Levels

| Priority | Description |
|----------|-------------|
| high | Urgent, requires immediate attention |
| normal | Standard notification |
| low | Informational, can be deferred |

---

## Notification Status Values

| Status | Description |
|--------|-------------|
| sent | Successfully sent |
| read | User has read |
| unread | Awaiting user to read |
| archived | Archived by user |
| failed | Failed to send |

---

## Error Response Format

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

---

## Integration Notes

- Patient records store comprehensive medical information
- Allergies and medical conditions are critical for surgery safety
- Medications tracked for drug interaction checks
- Surgical history maintained for compliance and research
- Notifications trigger automatically for key events
- Notification preferences respect user privacy settings
- Emergency contacts validated and kept current
- All data encrypted and HIPAA compliant
