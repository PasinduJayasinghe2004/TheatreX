# Operating Theatre API Documentation

**Developer:** M3 (Janani) | **Day:** 27

## Overview

The Theatre API manages operating theatre resources including room management, maintenance schedules, equipment tracking, and availability management.

## Base URL

```
http://localhost:5000/api/theatres
```

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Create Theatre

**Endpoint:** `POST /`

**Authentication:** Required (Admin)

**Description:** Create a new operating theatre

**Request Body:**
```json
{
  "name": "Theatre A",
  "theatreNumber": "OT-001",
  "location": "Block B, Floor 3",
  "capacity": 8,
  "equipmentList": [
    "Surgical Light",
    "Operating Table",
    "Anesthesia Machine",
    "Monitor"
  ],
  "availableFrom": "07:00",
  "availableTo": "20:00",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Theatre created successfully",
  "theatre": {
    "id": "theatre-uuid",
    "name": "Theatre A",
    "theatreNumber": "OT-001",
    "location": "Block B, Floor 3",
    "capacity": 8,
    "status": "active",
    "createdAt": "2025-03-21T10:30:00Z"
  }
}
```

---

### 2. Get All Theatres

**Endpoint:** `GET /`

**Authentication:** Required

**Description:** Retrieve all operating theatres

**Query Parameters:**
- `status` (optional): Filter by status (active, maintenance, closed)
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "theatres": [
    {
      "id": "theatre-uuid",
      "name": "Theatre A",
      "theatreNumber": "OT-001",
      "location": "Block B, Floor 3",
      "capacity": 8,
      "status": "active",
      "nextMaintenanceDate": "2025-04-15",
      "surgeries_today": 3,
      "isAvailable": true
    }
  ],
  "total": 5
}
```

---

### 3. Get Theatre by ID

**Endpoint:** `GET /:id`

**Authentication:** Required

**Description:** Get detailed theatre information

**Response (200 OK):**
```json
{
  "success": true,
  "theatre": {
    "id": "theatre-uuid",
    "name": "Theatre A",
    "theatreNumber": "OT-001",
    "location": "Block B, Floor 3",
    "capacity": 8,
    "status": "active",
    "availableFrom": "07:00",
    "availableTo": "20:00",
    "equipmentList": [
      "Surgical Light",
      "Operating Table",
      "Anesthesia Machine",
      "Monitor",
      "Sterilization Equipment"
    ],
    "maintenanceSchedule": {
      "lastMaintenance": "2025-02-15T10:00:00Z",
      "nextMaintenance": "2025-04-15T14:00:00Z",
      "maintenanceInterval": 60
    },
    "surgeries": [
      {
        "id": "surgery-uuid",
        "patientName": "John Doe",
        "surgeryType": "Appendectomy",
        "scheduledTime": "2025-03-22T09:00:00Z",
        "estimatedDuration": 120
      }
    ],
    "createdAt": "2025-03-21T10:30:00Z",
    "updatedAt": "2025-03-21T10:30:00Z"
  }
}
```

---

### 4. Update Theatre

**Endpoint:** `PUT /:id`

**Authentication:** Required (Admin)

**Description:** Update theatre information

**Request Body:**
```json
{
  "name": "Theatre A",
  "location": "Block B, Floor 3",
  "capacity": 9,
  "availableFrom": "07:00",
  "availableTo": "20:00",
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Theatre updated successfully",
  "theatre": {
    "id": "theatre-uuid",
    "name": "Theatre A",
    "capacity": 9,
    "updatedAt": "2025-03-21T11:00:00Z"
  }
}
```

---

### 5. Update Theatre Status

**Endpoint:** `PATCH /:id/status`

**Authentication:** Required (Admin)

**Description:** Change theatre status (active, maintenance, closed)

**Request Body:**
```json
{
  "status": "maintenance",
  "maintenanceReason": "Quarterly maintenance",
  "maintenanceEndTime": "2025-03-25T17:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Theatre status updated",
  "theatre": {
    "id": "theatre-uuid",
    "status": "maintenance",
    "maintenanceEndTime": "2025-03-25T17:00:00Z"
  }
}
```

---

### 6. Add Equipment

**Endpoint:** `POST /:id/equipment`

**Authentication:** Required (Admin)

**Description:** Add equipment to theatre

**Request Body:**
```json
{
  "equipmentName": "New Surgical Light",
  "quantity": 2,
  "purchaseDate": "2025-03-20",
  "warrantyExpiry": "2027-03-20"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipment added successfully",
  "equipment": {
    "id": "equipment-uuid",
    "equipmentName": "New Surgical Light",
    "quantity": 2,
    "status": "active"
  }
}
```

---

### 7. Update Equipment

**Endpoint:** `PATCH /:id/equipment/:equipmentId`

**Authentication:** Required (Admin)

**Description:** Update equipment details

**Request Body:**
```json
{
  "status": "under_maintenance",
  "maintenanceNote": "Light bulb replacement scheduled"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipment updated successfully",
  "equipment": {
    "id": "equipment-uuid",
    "status": "under_maintenance"
  }
}
```

---

### 8. Delete Equipment

**Endpoint:** `DELETE /:id/equipment/:equipmentId`

**Authentication:** Required (Admin)

**Description:** Remove equipment from theatre

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipment removed successfully"
}
```

---

### 9. Get Theatre Availability

**Endpoint:** `GET /:id/availability`

**Authentication:** Required

**Description:** Check theatre availability for specified dates/times

**Query Parameters:**
- `date` (required): Date (YYYY-MM-DD)
- `startTime` (required): Start time (HH:MM)
- `endTime` (required): End time (HH:MM)

**Response (200 OK):**
```json
{
  "success": true,
  "theatre": {
    "id": "theatre-uuid",
    "name": "Theatre A",
    "date": "2025-03-22",
    "isAvailable": true,
    "availableSlots": [
      {
        "startTime": "07:00",
        "endTime": "09:00",
        "duration": 120
      },
      {
        "startTime": "11:30",
        "endTime": "14:00",
        "duration": 150
      }
    ],
    "bookedSlots": [
      {
        "startTime": "09:00",
        "endTime": "11:30",
        "surgeryId": "surgery-uuid",
        "surgeryType": "Appendectomy"
      }
    ]
  }
}
```

---

### 10. Get Theatre Schedule

**Endpoint:** `GET /:id/schedule`

**Authentication:** Required

**Description:** Get theatre schedule for specified period

**Query Parameters:**
- `startDate` (required): From date (YYYY-MM-DD)
- `endDate` (required): To date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "schedule": [
    {
      "date": "2025-03-22",
      "surgeries": [
        {
          "id": "surgery-uuid",
          "startTime": "09:00",
          "endTime": "11:30",
          "patientName": "John Doe",
          "surgeryType": "Appendectomy",
          "surgeonName": "Dr. Smith",
          "status": "scheduled"
        }
      ]
    }
  ]
}
```

---

### 11. Schedule Theatre Maintenance

**Endpoint:** `POST /:id/maintenance`

**Authentication:** Required (Admin)

**Description:** Schedule maintenance for theatre

**Request Body:**
```json
{
  "maintenanceType": "preventive",
  "scheduledDate": "2025-04-15",
  "scheduledTime": "08:00",
  "estimatedDuration": 480,
  "description": "Quarterly preventive maintenance"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Maintenance scheduled successfully",
  "maintenance": {
    "id": "maintenance-uuid",
    "scheduledDate": "2025-04-15",
    "estimatedDuration": 480,
    "status": "scheduled"
  }
}
```

---

### 12. Get Maintenance History

**Endpoint:** `GET /:id/maintenance`

**Authentication:** Required

**Description:** Get theatre maintenance history

**Query Parameters:**
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "maintenance": [
    {
      "id": "maintenance-uuid",
      "type": "preventive",
      "scheduledDate": "2025-04-15",
      "completedDate": "2025-04-15T12:30:00Z",
      "actualDuration": 475,
      "description": "Quarterly preventive maintenance",
      "status": "completed"
    }
  ],
  "total": 8
}
```

---

### 13. Clean/Disinfect Theatre

**Endpoint:** `POST /:id/clean`

**Authentication:** Required (Coordinator, Admin)

**Description:** Record theatre cleaning/disinfection

**Request Body:**
```json
{
  "cleaningType": "standard",
  "cleanedBy": "staff-uuid",
  "cleaningTime": 30,
  "notes": "Post-surgery disinfection"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Cleaning recorded successfully",
  "cleaning": {
    "id": "cleaning-uuid",
    "cleanedAt": "2025-03-21T12:00:00Z",
    "cleaningType": "standard",
    "status": "completed"
  }
}
```

---

### 14. Get Cleaning History

**Endpoint:** `GET /:id/cleaning-history`

**Authentication:** Required

**Description:** Get theatre cleaning records

**Response (200 OK):**
```json
{
  "success": true,
  "cleaningHistory": [
    {
      "id": "cleaning-uuid",
      "cleanedAt": "2025-03-21T12:00:00Z",
      "cleaningType": "standard",
      "cleanedBy": "Staff Name",
      "duration": 30,
      "status": "completed"
    }
  ],
  "total": 25
}
```

---

### 15. Get Theatre Statistics

**Endpoint:** `GET /:id/statistics`

**Authentication:** Required

**Description:** Get theatre usage statistics

**Query Parameters:**
- `startDate` (optional): From date (YYYY-MM-DD)
- `endDate` (optional): To date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "statistics": {
    "totalSurgeries": 156,
    "avgSurgeryDuration": 95,
    "utilizationRate": 78.5,
    "maintenanceDowntime": 12,
    "surgeryByCategory": {
      "General Surgery": 45,
      "Cardiothoracic": 32,
      "Orthopedic": 38,
      "Other": 41
    },
    "topUsageDays": {
      "Monday": 28,
      "Tuesday": 26
    }
  }
}
```

---

### 16. Delete Theatre

**Endpoint:** `DELETE /:id`

**Authentication:** Required (Admin)

**Description:** Delete theatre (only if no surgeries scheduled)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Theatre deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Theatre has scheduled surgeries

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

## Theatre Status Values

| Status | Description |
|--------|-------------|
| active | Ready for use |
| maintenance | Under maintenance, not available |
| closed | Permanently closed |
| cleaning | Being cleaned between surgeries |

---

## Equipment Status Values

| Status | Description |
|--------|-------------|
| active | Operational and available |
| under_maintenance | Temporarily unavailable |
| faulty | Not operational, needs repair |
| retired | No longer in use |

---

## Maintenance Types

| Type | Description |
|------|-------------|
| preventive | Routine scheduled maintenance |
| reactive | Emergency repair |
| compliance | Safety/compliance checks |

---

## Availability Query Examples

```bash
# Check availability on specific date and time
GET /api/theatres/theatre-uuid/availability?date=2025-03-22&startTime=09:00&endTime=11:00

# Get schedule for month
GET /api/theatres/theatre-uuid/schedule?startDate=2025-03-01&endDate=2025-03-31

# Get maintenance history
GET /api/theatres/theatre-uuid/maintenance
```

---

## Integration Notes

- Theatre availability automatically updates based on scheduled surgeries
- Maintenance scheduling prevents conflicting bookings
- Status changes cascade to affect scheduling
- Equipment tracking maintains warranty and service dates
- Cleaning records maintain hygiene compliance
- Statistics calculated from historical data
