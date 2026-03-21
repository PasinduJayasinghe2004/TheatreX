# Authentication API Documentation

**Developer:** M1 (Pasindu) | **Day:** 27

## Overview

The Authentication API handles user registration, login, token management, and profile management. It includes JWT-based authentication with refresh tokens and comprehensive user account settings.

## Base URL

```
http://localhost:5000/api/auth
```

## Authentication

Most endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. User Registration

**Endpoint:** `POST /register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "surgeon",
  "department": "General Surgery"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "surgeon",
    "department": "General Surgery",
    "createdAt": "2025-03-21T10:30:00Z"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists
- `422 Unprocessable Entity` - Validation failed

**Validation Rules:**
- Email must be valid format
- Password minimum 8 characters, must include uppercase, lowercase, numbers, special characters
- firstName and lastName required
- Role must be valid (surgeon, nurse, anaesthetist, technician, coordinator, admin)

---

### 2. User Login

**Endpoint:** `POST /login`

**Description:** Authenticate user and get access token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "surgeon",
    "avatar": "https://api.example.com/uploads/profile_images/user.jpg"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `429 Too Many Requests` - Rate limited (max 30 attempts per 15 minutes)

---

### 3. Refresh Token

**Endpoint:** `POST /refresh`

**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

---

### 4. Get User Profile

**Endpoint:** `GET /profile`

**Authentication:** Required (Bearer token)

**Description:** Retrieve current user's profile information

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "surgeon",
    "department": "General Surgery",
    "avatar": "https://api.example.com/uploads/profile_images/user.jpg",
    "phoneNumber": "+1-555-0123",
    "specialization": "Cardiothoracic Surgery",
    "createdAt": "2025-03-21T10:30:00Z",
    "lastLogin": "2025-03-21T15:45:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `404 Not Found` - User not found

---

### 5. Update User Profile

**Endpoint:** `PUT /profile`

**Authentication:** Required (Bearer token)

**Description:** Update current user's profile information

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1-555-0123",
  "specialization": "Cardiothoracic Surgery",
  "department": "General Surgery"
}
```

**Request Body (with avatar - multipart/form-data):**
```
FormData:
  - firstName: "John"
  - lastName: "Doe"
  - phoneNumber: "+1-555-0123"
  - avatar: <file>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1-555-0123",
    "specialization": "Cardiothoracic Surgery"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Invalid token
- `413 Payload Too Large` - Avatar file too large (max 5MB)

---

### 6. Change Password

**Endpoint:** `POST /change-password`

**Authentication:** Required (Bearer token)

**Description:** Change user's password

**Request Body:**
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Current password incorrect or invalid new password
- `401 Unauthorized` - Invalid token

**Password Requirements:**
- Minimum 8 characters
- Must contain uppercase, lowercase, numbers, and special characters

---

### 7. Forgot Password

**Endpoint:** `POST /forgot-password`

**Description:** Request password reset token

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Error Responses:**
- `404 Not Found` - Email not found

**Note:** User receives email with reset token

---

### 8. Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Reset password using token from email

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired token

---

### 9. Get Settings

**Endpoint:** `GET /settings`

**Authentication:** Required (Bearer token)

**Description:** Retrieve user account settings

**Response (200 OK):**
```json
{
  "success": true,
  "settings": {
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "twoFactorAuth": false,
    "dataPrivacy": "private",
    "timezone": "UTC",
    "language": "en"
  }
}
```

---

### 10. Update Settings

**Endpoint:** `PUT /settings`

**Authentication:** Required (Bearer token)

**Description:** Update user account settings

**Request Body:**
```json
{
  "emailNotifications": true,
  "pushNotifications": true,
  "smsNotifications": false,
  "twoFactorAuth": false,
  "dataPrivacy": "private",
  "timezone": "UTC",
  "language": "en"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "emailNotifications": true,
    "pushNotifications": true,
    "twoFactorAuth": false
  }
}
```

---

### 11. Get Settings Audit History

**Endpoint:** `GET /settings/audit-history`

**Authentication:** Required (Bearer token)

**Description:** Get history of settings changes

**Query Parameters:**
- `limit` (optional, default: 50): Number of records to return
- `offset` (optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "changeType": "settings_update",
      "description": "Email notifications disabled",
      "timestamp": "2025-03-21T14:30:00Z",
      "ipAddress": "192.168.1.1"
    }
  ],
  "total": 15
}
```

---

### 12. Get Active Sessions

**Endpoint:** `GET /sessions`

**Authentication:** Required (Bearer token)

**Description:** List all active user sessions

**Response (200 OK):**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session_uuid",
      "deviceType": "web",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.100",
      "lastActivity": "2025-03-21T15:45:00Z",
      "createdAt": "2025-03-20T10:00:00Z"
    }
  ]
}
```

---

### 13. Logout Other Sessions

**Endpoint:** `POST /logout-others`

**Authentication:** Required (Bearer token)

**Description:** Logout all other active sessions

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All other sessions logged out successfully"
}
```

---

### 14. Export Personal Data

**Endpoint:** `GET /export-data`

**Authentication:** Required (Bearer token)

**Description:** Export user's personal data as JSON

**Response:** JSON file download

---

### 15. Deactivate Account

**Endpoint:** `POST /deactivate`

**Authentication:** Required (Bearer token)

**Description:** Temporarily deactivate account (can reactivate by logging in)

**Request Body:**
```json
{
  "password": "CurrentPassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

---

### 16. Delete Account

**Endpoint:** `DELETE /delete`

**Authentication:** Required (Bearer token)

**Description:** Permanently delete account and all associated data

**Request Body:**
```json
{
  "password": "CurrentPassword123!",
  "confirmDeletion": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account permanently deleted"
}
```

---

## Error Responses

All endpoints use consistent error response format:

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

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Failed |
| 429 | Too Many Requests |
| 500 | Server Error |

---

## Rate Limiting

- **General endpoints:** 120 requests per minute
- **Auth endpoints:** 30 requests per 15 minutes
- **Password reset:** 3 requests per hour

---

## Token Management

### Access Token
- **Validity:** 1 hour
- **Type:** JWT
- **Usage:** Include in Authorization header as `Bearer <token>`

### Refresh Token
- **Validity:** 7 days
- **Type:** Opaque token
- **Usage:** POST to `/refresh` endpoint to get new access token

---

## Security Considerations

1. **HTTPS Only:** Always use HTTPS in production
2. **Token Storage:** Store tokens securely (httpOnly cookies recommended)
3. **CORS:** Configured for allowed origins only
4. **Rate Limiting:** Protects against brute force attacks
5. **Password Security:** Bcrypt hashing with salt rounds
6. **Session Management:** Active session tracking and logout capabilities

---

## Examples

### Complete Authentication Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "surgeon"
  }'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# 3. Get Profile (using access token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <access_token>"

# 4. Refresh Token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

---

## Integration Notes

- Token automatically expires after 1 hour
- Use refresh token to get new access token without re-login
- Profile updates support avatar upload via multipart form data
- All timestamps in ISO 8601 format (UTC)
- Email validation required for all new registrations
