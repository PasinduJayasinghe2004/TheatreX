# Staff Management API Documentation

**Developers:** M4 (Oneli - Surgeons, Technicians), M3 (Janani - Nurses), M6 (Dinil - Anaesthetists) | **Day:** 27

## Overview

The Staff Management API handles all medical and support staff including surgeons, nurses, anaesthetists, and technicians. It includes scheduling, availability tracking, and qualifications management.

## Base URLs

```
http://localhost:5000/api/surgeons
http://localhost:5000/api/nurses
http://localhost:5000/api/anaesthetists
http://localhost:5000/api/technicians
```

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## SURGEONS ENDPOINTS

### 1. Create Surgeon

**Endpoint:** `POST /surgeons`

**Authentication:** Required (Admin)

**Description:** Create surgeon profile

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@hospital.com",
  "licenseNumber": "LIC-001234",
  "specialization": "Cardiothoracic Surgery",
  "yearsOfExperience": 15,
  "qualifications": ["MBBS", "MS Surgery", "Fellowship in Cardiac Surgery"],
  "phoneNumber": "+1-555-0123",
  "department": "Cardiothoracic",
  "availability": "Mon-Fri 08:00-17:00"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Surgeon created successfully",
  "surgeon": {
    "id": "surgeon-uuid",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@hospital.com",
    "specialization": "Cardiothoracic Surgery",
    "status": "active",
    "createdAt": "2025-03-21T10:30:00Z"
  }
}
```

---

### 2. Get All Surgeons

**Endpoint:** `GET /surgeons`

**Authentication:** Required

**Description:** Get list of all surgeons

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `status` (optional): Filter by status (active, inactive, on-leave)
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

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
      "yearsOfExperience": 15,
      "status": "active",
      "upcomingSurgeries": 3
    }
  ],
  "total": 12
}
```

---

### 3. Get Surgeon by ID

**Endpoint:** `GET /surgeons/:id`

**Authentication:** Required

**Description:** Get detailed surgeon information

**Response (200 OK):**
```json
{
  "success": true,
  "surgeon": {
    "id": "surgeon-uuid",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@hospital.com",
    "licenseNumber": "LIC-001234",
    "specialization": "Cardiothoracic Surgery",
    "yearsOfExperience": 15,
    "qualifications": ["MBBS", "MS Surgery", "Fellowship in Cardiac Surgery"],
    "phoneNumber": "+1-555-0123",
    "department": "Cardiothoracic",
    "availability": "Mon-Fri 08:00-17:00",
    "status": "active",
    "upcomingSurgeries": 3,
    "createdAt": "2025-03-21T10:30:00Z"
  }
}
```

---

### 4. Update Surgeon

**Endpoint:** `PUT /surgeons/:id`

**Authentication:** Required (Admin)

**Description:** Update surgeon information

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "specialization": "Cardiothoracic Surgery",
  "yearsOfExperience": 16,
  "availability": "Mon-Fri 08:00-17:00"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Surgeon updated successfully"
}
```

---

### 5. Update Surgeon Status

**Endpoint:** `PATCH /surgeons/:id/status`

**Authentication:** Required (Admin)

**Description:** Update surgeon status (active, inactive, on-leave)

**Request Body:**
```json
{
  "status": "on-leave",
  "leaveStartDate": "2025-04-01",
  "leaveEndDate": "2025-04-15",
  "reason": "Annual leave"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

---

### 6. Get Surgeon Schedule

**Endpoint:** `GET /surgeons/:id/schedule`

**Authentication:** Required

**Description:** Get surgeon's surgical schedule

**Query Parameters:**
- `startDate` (optional): From date (YYYY-MM-DD)
- `endDate` (optional): To date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "schedule": [
    {
      "surgeryId": "surgery-uuid",
      "patientName": "Albert Einstein",
      "surgeryType": "Bypass Surgery",
      "date": "2025-03-22",
      "time": "09:00",
      "duration": 240,
      "theatre": "Theatre A"
    }
  ],
  "total": 5
}
```

---

### 7. Delete Surgeon

**Endpoint:** `DELETE /surgeons/:id`

**Authentication:** Required (Admin)

**Description:** Remove surgeon (only if no upcoming surgeries)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Surgeon deleted successfully"
}
```

---

## NURSES ENDPOINTS

### 1. Create Nurse

**Endpoint:** `POST /nurses`

**Authentication:** Required (Admin)

**Description:** Create nurse profile

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@hospital.com",
  "licenseNumber": "NUR-5678",
  "specialization": "Operating Theatre",
  "yearsOfExperience": 8,
  "qualifications": ["RN", "BSN", "CNOR"],
  "phoneNumber": "+1-555-0124",
  "department": "Surgical",
  "availability": "Mon-Fri 08:00-17:00, On-call weekends"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Nurse created successfully",
  "nurse": {
    "id": "nurse-uuid",
    "firstName": "Jane",
    "lastName": "Doe",
    "specialization": "Operating Theatre",
    "status": "active"
  }
}
```

---

### 2. Get All Nurses

**Endpoint:** `GET /nurses`

**Authentication:** Required

**Description:** Get list of all nurses

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `status` (optional): Filter by status
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

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
      "yearsOfExperience": 8,
      "status": "active",
      "upcomingSurgeries": 4
    }
  ],
  "total": 18
}
```

---

### 3. Get Nurse by ID

**Endpoint:** `GET /nurses/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "nurse": {
    "id": "nurse-uuid",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@hospital.com",
    "licenseNumber": "NUR-5678",
    "specialization": "Operating Theatre",
    "yearsOfExperience": 8,
    "qualifications": ["RN", "BSN", "CNOR"],
    "status": "active",
    "upcomingSurgeries": 4
  }
}
```

---

### 4. Update Nurse

**Endpoint:** `PUT /nurses/:id`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "specialization": "Operating Theatre",
  "yearsOfExperience": 9
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Nurse updated successfully"
}
```

---

### 5. Update Nurse Status

**Endpoint:** `PATCH /nurses/:id/status`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "status": "on-leave",
  "leaveStartDate": "2025-04-01",
  "leaveEndDate": "2025-04-10"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated"
}
```

---

### 6. Get Nurse Schedule

**Endpoint:** `GET /nurses/:id/schedule`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "schedule": [
    {
      "surgeryId": "surgery-uuid",
      "patientName": "Jane Cooper",
      "surgeryType": "Appendectomy",
      "date": "2025-03-22",
      "time": "10:00",
      "duration": 120
    }
  ],
  "total": 6
}
```

---

### 7. Delete Nurse

**Endpoint:** `DELETE /nurses/:id`

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Nurse deleted successfully"
}
```

---

## ANAESTHETISTS ENDPOINTS

### 1. Create Anaesthetist

**Endpoint:** `POST /anaesthetists`

**Authentication:** Required (Admin)

**Description:** Create anaesthetist profile

**Request Body:**
```json
{
  "firstName": "Michael",
  "lastName": "Brown",
  "email": "michael.brown@hospital.com",
  "licenseNumber": "ANA-9012",
  "specialization": "General Anaesthesia",
  "yearsOfExperience": 12,
  "qualifications": ["MBBS", "DA", "Fellowship in Anaesthesia"],
  "phoneNumber": "+1-555-0125",
  "department": "Anaesthesia",
  "availability": "Mon-Fri 07:00-18:00"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Anaesthetist created successfully",
  "anaesthetist": {
    "id": "anaesthetist-uuid",
    "firstName": "Michael",
    "lastName": "Brown",
    "specialization": "General Anaesthesia",
    "status": "active"
  }
}
```

---

### 2. Get All Anaesthetists

**Endpoint:** `GET /anaesthetists`

**Authentication:** Required

**Query Parameters:**
- `specialization` (optional)
- `status` (optional)
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "anaesthetists": [
    {
      "id": "anaesthetist-uuid",
      "firstName": "Michael",
      "lastName": "Brown",
      "specialization": "General Anaesthesia",
      "yearsOfExperience": 12,
      "status": "active",
      "upcomingSurgeries": 2
    }
  ],
  "total": 8
}
```

---

### 3. Get Anaesthetist by ID

**Endpoint:** `GET /anaesthetists/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "anaesthetist": {
    "id": "anaesthetist-uuid",
    "firstName": "Michael",
    "lastName": "Brown",
    "email": "michael.brown@hospital.com",
    "licenseNumber": "ANA-9012",
    "specialization": "General Anaesthesia",
    "yearsOfExperience": 12,
    "status": "active"
  }
}
```

---

### 4. Update Anaesthetist

**Endpoint:** `PUT /anaesthetists/:id`

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Anaesthetist updated successfully"
}
```

---

### 5. Update Anaesthetist Status

**Endpoint:** `PATCH /anaesthetists/:id/status`

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated"
}
```

---

### 6. Get Anaesthetist Schedule

**Endpoint:** `GET /anaesthetists/:id/schedule`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "schedule": [
    {
      "surgeryId": "surgery-uuid",
      "patientName": "Robert Smith",
      "surgeryType": "Cardiac Surgery",
      "date": "2025-03-23",
      "time": "14:00",
      "duration": 300
    }
  ],
  "total": 3
}
```

---

### 7. Delete Anaesthetist

**Endpoint:** `DELETE /anaesthetists/:id`

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Anaesthetist deleted successfully"
}
```

---

## TECHNICIANS ENDPOINTS

### 1. Create Technician

**Endpoint:** `POST /technicians`

**Authentication:** Required (Admin)

**Description:** Create surgical technician profile

**Request Body:**
```json
{
  "firstName": "Robert",
  "lastName": "Johnson",
  "email": "robert.johnson@hospital.com",
  "licenseNumber": "TECH-3456",
  "specialization": "Surgical Technology",
  "yearsOfExperience": 7,
  "qualifications": ["Certified Surgical Technologist", "CST"],
  "phoneNumber": "+1-555-0126",
  "department": "Surgical",
  "availability": "Mon-Fri 06:00-16:00"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Technician created successfully",
  "technician": {
    "id": "technician-uuid",
    "firstName": "Robert",
    "lastName": "Johnson",
    "specialization": "Surgical Technology",
    "status": "active"
  }
}
```

---

### 2. Get All Technicians

**Endpoint:** `GET /technicians`

**Authentication:** Required

**Query Parameters:**
- `specialization` (optional)
- `status` (optional)
- `limit` (optional, default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "technicians": [
    {
      "id": "technician-uuid",
      "firstName": "Robert",
      "lastName": "Johnson",
      "specialization": "Surgical Technology",
      "yearsOfExperience": 7,
      "status": "active",
      "upcomingSurgeries": 3
    }
  ],
  "total": 6
}
```

---

### 3. Get Technician by ID

**Endpoint:** `GET /technicians/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "technician": {
    "id": "technician-uuid",
    "firstName": "Robert",
    "lastName": "Johnson",
    "email": "robert.johnson@hospital.com",
    "licenseNumber": "TECH-3456",
    "specialization": "Surgical Technology",
    "yearsOfExperience": 7,
    "status": "active"
  }
}
```

---

### 4. Update Technician

**Endpoint:** `PUT /technicians/:id`

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Technician updated successfully"
}
```

---

### 5. Update Technician Status

**Endpoint:** `PATCH /technicians/:id/status`

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated"
}
```

---

### 6. Get Technician Schedule

**Endpoint:** `GET /technicians/:id/schedule`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "schedule": [
    {
      "surgeryId": "surgery-uuid",
      "patientName": "Mary Davis",
      "surgeryType": "Hysterectomy",
      "date": "2025-03-24",
      "time": "11:00",
      "duration": 150
    }
  ],
  "total": 4
}
```

---

### 7. Delete Technician

**Endpoint:** `DELETE /technicians/:id`

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Technician deleted successfully"
}
```

---

## Common Error Response Format

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

## Staff Status Values

| Status | Description |
|--------|-------------|
| active | Available for surgeries |
| inactive | Not available |
| on-leave | Temporarily unavailable |
| suspended | Suspended from duties |

---

## Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Failed |
| 500 | Server Error |

---

## Integration Notes

- All staff members have availability calendars synced with surgery scheduling
- Status changes affect availability queries for surgery planning
- Qualifications are tracked for compliance reporting
- Experience levels used for surgery assignment recommendations
- Schedule conflicts automatically detected during surgery creation
