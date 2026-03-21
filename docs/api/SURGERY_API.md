# Surgery Management API Documentation

**Developer:** M2 (Chandeepa) | **Day:** 27

## Overview

The Surgery API handles all operations related to surgical procedures, including creation, scheduling, status updates, staff assignment, and conflict detection. It provides comprehensive scheduling capabilities with automatic conflict resolution.

## Base URL

```
http://localhost:5000/api/surgeries
```

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Create Surgery

**Endpoint:** `POST /`

**Authentication:** Required (Coordinator, Admin)

**Description:** Create a new surgical procedure

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "surgeryType": "Appendectomy",
  "surgeryCategory": "General Surgery",
  "scheduledDate": "2025-04-15",
  "scheduledTime": "09:00",
  "estimatedDuration": 120,
  "surgeonId": "surgeon-uuid",
  "nurseIds": ["nurse-uuid1", "nurse-uuid2"],
  "anaesthetistId": "anaesthetist-uuid",
  "technicianId": "technician-uuid",
  "priority": "routine",
  "notes": "Routine appendicitis surgery"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Surgery created successfully",
  "surgery": {
    "id": "surgery-uuid",
    "patientId": "patient-uuid",
    "surgeryType": "Appendectomy",
    "surgeryCategory": "General Surgery",
    "scheduledDate": "2025-04-15",
    "scheduledTime": "09:00",
    "estimatedDuration": 120,
    "status": "scheduled",
    "surgeonId": "surgeon-uuid",
    "theatreId": null,
    "createdAt": "2025-03-21T10:30:00Z",
    "updatedAt": "2025-03-21T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `409 Conflict` - Scheduling conflict detected
- `422 Unprocessable Entity` - Validation failed

---

### 2. Get All Surgeries

**Endpoint:** `GET /`

**Authentication:** Required

**Description:** Retrieve all surgeries with optional filtering

**Query Parameters:**
- `status` (optional): Filter by status (scheduled, in-progress, completed, cancelled)
- `surgeonId` (optional): Filter by surgeon
- `theatreId` (optional): Filter by theatre
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "surgeries": [
    {
      "id": "surgery-uuid",
      "patientName": "John Doe",
      "surgeryType": "Appendectomy",
      "surgeryCategory": "General Surgery",
      "scheduledDate": "2025-04-15",
      "scheduledTime": "09:00",
      "estimatedDuration": 120,
      "status": "scheduled",
      "surgeonName": "Dr. Smith",
      "theatreId": "theatre-uuid",
      "theatreName": "Theatre A",
      "priority": "routine"
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

---

### 3. Get Surgery by ID

**Endpoint:** `GET /:id`

**Authentication:** Required

**Description:** Retrieve detailed information about a specific surgery

**Response (200 OK):**
```json
{
  "success": true,
  "surgery": {
    "id": "surgery-uuid",
    "patientId": "patient-uuid",
    "patientName": "John Doe",
    "patientAge": 45,
    "surgeryType": "Appendectomy",
    "surgeryCategory": "General Surgery",
    "scheduledDate": "2025-04-15",
    "scheduledTime": "09:00",
    "estimatedDuration": 120,
    "actualDuration": null,
    "status": "scheduled",
    "surgeonId": "surgeon-uuid",
    "surgeonName": "Dr. Smith",
    "theatreId": "theatre-uuid",
    "theatreName": "Theatre A",
    "nurseIds": ["nurse-uuid1", "nurse-uuid2"],
    "nurses": [
      {"id": "nurse-uuid1", "name": "Jane Doe"},
      {"id": "nurse-uuid2", "name": "Bob Smith"}
    ],
    "anaesthetistId": "anaesthetist-uuid",
    "anaesthetistName": "Dr. Brown",
    "technicianId": "technician-uuid",
    "technicianName": "Tech John",
    "priority": "routine",
    "notes": "Routine appendicitis surgery",
    "createdAt": "2025-03-21T10:30:00Z",
    "updatedAt": "2025-03-21T10:30:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Surgery not found

---

### 4. Update Surgery

**Endpoint:** `PUT /:id`

**Authentication:** Required (Coordinator, Admin)

**Description:** Update surgery details (except those in progress)

**Request Body:**
```json
{
  "surgeryType": "Appendectomy",
  "surgeryCategory": "General Surgery",
  "scheduledDate": "2025-04-16",
  "scheduledTime": "10:00",
  "estimatedDuration": 130,
  "surgeonId": "surgeon-uuid",
  "nurseIds": ["nurse-uuid1", "nurse-uuid2"],
  "anaesthetistId": "anaesthetist-uuid",
  "priority": "routine",
  "notes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Surgery updated successfully",
  "surgery": {
    "id": "surgery-uuid",
    "surgeryType": "Appendectomy",
    "scheduledDate": "2025-04-16",
    "scheduledTime": "10:00",
    "estimatedDuration": 130,
    "updatedAt": "2025-03-21T11:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid update
- `409 Conflict` - Scheduling conflict after update
- `422 Unprocessable Entity` - Cannot update surgery in progress

---

### 5. Update Surgery Status

**Endpoint:** `PATCH /:id/status`

**Authentication:** Required (Coordinator, Admin)

**Description:** Update surgery status (scheduled → in-progress → completed)

**Request Body:**
```json
{
  "status": "in-progress",
  "actualStartTime": "2025-04-15T09:05:00Z",
  "notes": "Surgery started"
}
```

**Status Flow:**
- `scheduled` → `in-progress` (when surgery starts)
- `in-progress` → `completed` (when surgery ends)
- `scheduled` → `cancelled` (if cancelled before start)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Surgery status updated successfully",
  "surgery": {
    "id": "surgery-uuid",
    "status": "in-progress",
    "actualStartTime": "2025-04-15T09:05:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid status transition
- `404 Not Found` - Surgery not found

---

### 6. Assign Theatre to Surgery

**Endpoint:** `PATCH /:id/assign-theatre`

**Authentication:** Required (Coordinator, Admin)

**Description:** Assign an available theatre to a surgery

**Request Body:**
```json
{
  "theatreId": "theatre-uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Theatre assigned successfully",
  "surgery": {
    "id": "surgery-uuid",
    "theatreId": "theatre-uuid",
    "theatreName": "Theatre A"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Theatre not available at scheduled time
- `404 Not Found` - Surgery or theatre not found

---

### 7. Get Unassigned Surgeries

**Endpoint:** `GET /unassigned`

**Authentication:** Required

**Description:** Get surgeries without assigned theatres

**Response (200 OK):**
```json
{
  "success": true,
  "surgeries": [
    {
      "id": "surgery-uuid",
      "patientName": "John Doe",
      "surgeryType": "Appendectomy",
      "scheduledDate": "2025-04-15",
      "scheduledTime": "09:00",
      "estimatedDuration": 120,
      "surgeonName": "Dr. Smith",
      "priority": "routine"
    }
  ],
  "total": 3
}
```

---

### 8. Get Surgery History

**Endpoint:** `GET /history`

**Authentication:** Required

**Description:** Get completed surgeries with details and outcomes

**Query Parameters:**
- `startDate` (optional): From date (YYYY-MM-DD)
- `endDate` (optional): To date (YYYY-MM-DD)
- `surgeonId` (optional): Filter by surgeon
- `category` (optional): Filter by category
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "history": [
    {
      "id": "surgery-uuid",
      "patientName": "John Doe",
      "surgeryType": "Appendectomy",
      "surgeryCategory": "General Surgery",
      "completedDate": "2025-04-15",
      "actualDuration": 125,
      "estimatedDuration": 120,
      "surgeonName": "Dr. Smith",
      "theatreName": "Theatre A",
      "outcome": "successful",
      "notes": "Completed without complications"
    }
  ],
  "total": 156
}
```

---

### 9. Export Surgery History as CSV

**Endpoint:** `GET /history/export/csv`

**Authentication:** Required

**Description:** Export surgery history to CSV file

**Query Parameters:**
- `startDate` (optional): From date (YYYY-MM-DD)
- `endDate` (optional): To date (YYYY-MM-DD)

**Response:** CSV file download

---

### 10. Export Surgery Detail as CSV

**Endpoint:** `GET /:id/export/csv`

**Authentication:** Required

**Description:** Export single surgery details to CSV

**Response:** CSV file download

---

### 11. Check Scheduling Conflicts

**Endpoint:** `POST /check-conflicts`

**Authentication:** Required

**Description:** Check for scheduling conflicts for a proposed surgery

**Request Body:**
```json
{
  "surgeonId": "surgeon-uuid",
  "scheduledDate": "2025-04-15",
  "scheduledTime": "09:00",
  "estimatedDuration": 120
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "hasConflict": false,
  "conflicts": []
}
```

**With Conflicts:**
```json
{
  "success": true,
  "hasConflict": true,
  "conflicts": [
    {
      "type": "surgeon_busy",
      "surgeryId": "other-surgery-uuid",
      "message": "Surgeon is assigned to another surgery at this time",
      "conflictingTime": "2025-04-15T08:30 - 09:45"
    }
  ]
}
```

---

### 12. Check Staff Conflicts

**Endpoint:** `POST /check-staff-conflicts`

**Authentication:** Required

**Description:** Check staff availability conflicts

**Request Body:**
```json
{
  "surgeonId": "surgeon-uuid",
  "nurseIds": ["nurse-uuid1", "nurse-uuid2"],
  "anaesthetistId": "anaesthetist-uuid",
  "technicianId": "technician-uuid",
  "scheduledDate": "2025-04-15",
  "scheduledTime": "09:00",
  "estimatedDuration": 120
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "availableStaff": {
    "surgeon": true,
    "nurses": [true, true],
    "anaesthetist": true,
    "technician": true
  },
  "unavailableStaff": [],
  "allAvailable": true
}
```

---

### 13. Get Available Surgeons

**Endpoint:** `GET /surgeons/available`

**Authentication:** Required

**Description:** Get surgeons available at specified time

**Query Parameters:**
- `date` (required): Date (YYYY-MM-DD)
- `time` (required): Time (HH:MM)
- `duration` (required): Duration in minutes

**Response (200 OK):**
```json
{
  "success": true,
  "surgeons": [
    {
      "id": "surgeon-uuid",
      "firstName": "John",
      "lastName": "Smith",
      "specialization": "Cardiothoracic Surgery",
      "available": true
    }
  ],
  "total": 5
}
```

---

### 14. Get Available Nurses

**Endpoint:** `GET /nurses/available`

**Authentication:** Required

**Description:** Get nurses available at specified time

**Query Parameters:**
- `date` (required): Date (YYYY-MM-DD)
- `time` (required): Time (HH:MM)
- `duration` (required): Duration in minutes

**Response (200 OK):**
```json
{
  "success": true,
  "nurses": [
    {
      "id": "nurse-uuid",
      "firstName": "Jane",
      "lastName": "Doe",
      "specialization": "Operating Theatre",
      "available": true
    }
  ],
  "total": 8
}
```

---

### 15. Get Available Anaesthetists

**Endpoint:** `GET /anaesthetists/available`

**Authentication:** Required

**Description:** Get anaesthetists available at specified time

**Query Parameters:**
- `date` (required): Date (YYYY-MM-DD)
- `time` (required): Time (HH:MM)
- `duration` (required): Duration in minutes

**Response (200 OK):**
```json
{
  "success": true,
  "anaesthetists": [
    {
      "id": "anaesthetist-uuid",
      "firstName": "Michael",
      "lastName": "Brown",
      "specialization": "Anaesthesia",
      "available": true
    }
  ],
  "total": 3
}
```

---

### 16. Get Surgeons Dropdown

**Endpoint:** `GET /surgeons`

**Authentication:** Required

**Description:** Get all surgeons for dropdown selection

**Response (200 OK):**
```json
{
  "success": true,
  "surgeons": [
    {
      "id": "surgeon-uuid",
      "firstName": "John",
      "lastName": "Smith",
      "specialization": "Cardiothoracic Surgery"
    }
  ],
  "total": 12
}
```

---

### 17. Get Calendar Events

**Endpoint:** `GET /events`

**Authentication:** Required

**Description:** Get surgeries formatted as calendar events

**Query Parameters:**
- `startDate` (optional): From date (YYYY-MM-DD)
- `endDate` (optional): To date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "events": [
    {
      "id": "surgery-uuid",
      "title": "Appendectomy - John Doe",
      "start": "2025-04-15T09:00:00Z",
      "end": "2025-04-15T11:00:00Z",
      "status": "scheduled",
      "surgeonName": "Dr. Smith",
      "theatreName": "Theatre A",
      "color": "#4CAF50"
    }
  ]
}
```

---

### 18. Delete Surgery

**Endpoint:** `DELETE /:id`

**Authentication:** Required (Coordinator, Admin)

**Description:** Delete a scheduled surgery (cannot delete in-progress or completed)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Surgery deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Surgery cannot be deleted (in progress or completed)
- `404 Not Found` - Surgery not found

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

## Priority Levels

| Priority | Description |
|----------|-------------|
| urgent | Emergency surgery, immediate scheduling |
| high | Important surgery, schedule ASAP |
| routine | Standard surgery, normal scheduling |
| elective | Non-urgent, flexible scheduling |

---

## Surgery Status Flow

```
scheduled → in-progress → completed
   ↓
cancelled
```

---

## Conflict Types

- **surgeon_busy**: Surgeon assigned to another surgery
- **nurse_busy**: One or more nurses assigned to another surgery
- **anaesthetist_busy**: Anaesthetist assigned to another surgery
- **technician_busy**: Technician assigned to another surgery
- **theatre_unavailable**: Theatre not available at requested time
- **insufficient_capacity**: Not enough staff available

---

## Filtering Examples

```bash
# Get surgeries for a date range
GET /api/surgeries?startDate=2025-04-01&endDate=2025-04-30

# Get surgeries by surgeon
GET /api/surgeries?surgeonId=surgeon-uuid

# Get cancelled surgeries
GET /api/surgeries?status=cancelled

# Get unassigned surgeries
GET /api/surgeries/unassigned
```

---

## Integration Notes

- Surgery creation automatically checks for conflicts
- Theatre assignment validates availability
- Status updates follow strict workflow rules
- History tracking maintains audit trail
- Export formats support CSV for reporting
- Time handling in ISO 8601 format (UTC)
