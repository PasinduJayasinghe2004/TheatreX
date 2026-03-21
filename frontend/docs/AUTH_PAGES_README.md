# Authentication Module README

**Developer:** M1 (Pasindu) | **Day:** 27

## Overview

The Authentication module handles user registration, login, token management, and account security for TheatreX. It provides JWT-based authentication with comprehensive session management.

## Features

✅ **User Registration**
- Email validation and uniqueness checks
- Secure password hashing with bcrypt
- Role-based user types
- Automatic welcome email

✅ **User Login**
- Email and password authentication
- JWT access and refresh tokens
- Session tracking
- Rate limiting protection

✅ **Token Management**
- Access tokens (1 hour expiration)
- Refresh tokens (7 days expiration)
- Automatic token refresh capability
- Multiple device support

✅ **Profile Management**
- User profile view and update
- Profile picture upload
- Personal information management
- Contact details

✅ **Security Features**
- Password reset via secure token
- Change password functionality
- Account deactivation
- Permanent account deletion
- Session management
- Active sessions tracking
- Logout other sessions option
- Data export (GDPR compliant)

✅ **Account Settings**
- Notification preferences
- Privacy settings
- Timezone and language selection
- Settings audit history

## Project Structure

```
backend/
├── routes/
│   └── authRoutes.js           # Authentication endpoints
├── controllers/
│   └── authController.js       # Auth logic
├── middleware/
│   ├── authMiddleware.js       # JWT verification
│   ├── validateUser.js         # Input validation
│   └── securityMiddleware.js   # Security headers
├── models/
│   └── userModel.js            # User schema and database
└── tests/
    └── auth.test.js            # Auth tests
```

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh` - Refresh access token

### Protected Endpoints
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/settings` - Get account settings
- `PUT /api/auth/settings` - Update settings
- `GET /api/auth/settings/audit-history` - Settings history
- `GET /api/auth/sessions` - Active sessions
- `POST /api/auth/logout-others` - Logout other sessions
- `GET /api/auth/export-data` - Export personal data
- `POST /api/auth/deactivate` - Deactivate account
- `DELETE /api/auth/delete` - Delete account

## Quick Start

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "surgeon@hospital.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Smith",
    "role": "surgeon"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "surgeon@hospital.com",
    "password": "SecurePass123!"
  }'
```

### 3. Use Access Token

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| admin | System administrator | Full access |
| coordinator | Surgery coordinator | Create/manage surgeries, assign staff |
| surgeon | Surgical physician | View surgeries, patient info |
| nurse | Operating theatre nurse | View surgeries, theatre info |
| anaesthetist | Anaesthesia specialist | View surgeries, patient info |
| technician | Surgical technician | View surgeries, technical info |

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** - Use httpOnly cookies when possible
3. **Don't share credentials** - Never commit credentials to version control
4. **Rotate credentials regularly** - Change passwords periodically
5. **Monitor active sessions** - Check sessions regularly
6. **Enable 2FA** - Set up two-factor authentication if available
7. **Logout properly** - Logout from other sessions when suspicious activity detected

## Error Handling

All errors include consistent error format:

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

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Invalid credentials | Wrong email or password |
| 401 | Unauthorized | Invalid or expired token |
| 409 | Email exists | Email already registered |
| 422 | Validation failed | Invalid input data |
| 429 | Rate limited | Too many attempts |

## Environment Variables

```
JWT_SECRET=your-secret-key
JWT_EXPIRE=1h
REFRESH_TOKEN_EXPIRE=7d
BCRYPT_ROUNDS=10
DATABASE_URL=postgresql://user:pass@localhost/theatrex
```

## Testing

### Run Tests

```bash
npm test -- auth.test.js
```

### Test Coverage

- User registration and validation
- Login authentication
- Token refresh mechanism
- Password reset flow
- Profile updates
- Session management
- Security headers

## Troubleshooting

### Login Fails
- Verify email and password are correct
- Check if account is active (not suspended/deleted)
- Clear browser cookies and try again
- Check network connectivity

### Token Expired
- Use refresh token to get new access token
- Check token expiration time (1 hour)
- Re-login if refresh token also expired

### Profile Update Fails
- Verify JWT token is valid
- Check input data format
- Ensure file size < 5MB for avatar
- Verify email uniqueness if changing email

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email address
- `password` (VARCHAR) - Hashed password
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `role` (ENUM) - User role
- `avatar` (VARCHAR) - Profile image URL
- `status` (ENUM) - active/inactive/suspended
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)
- And other profile fields...

## Integration with Other Modules

- **Surgery Module**: Requires authenticated user for creating/managing surgeries
- **Theatre Module**: Requires authenticated user for theatre bookings
- **Staff Module**: User accounts linked to staff profiles
- **Notification Module**: Sends notifications on auth events

## Performance Metrics

- Login response time: < 500ms
- Token refresh: < 200ms
- Rate limiting: 30 requests per 15 minutes on auth endpoints

## Compliance

- ✅ GDPR compliant (data export, account deletion)
- ✅ Secure password hashing (bcrypt)
- ✅ JWT standard implementation
- ✅ CORS enabled for allowed origins
- ✅ Rate limiting for brute force protection

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Social login support
- [ ] Biometric authentication
- [ ] API key support for integrations
- [ ] Advanced security audit logs

## Support & Documentation

- **API Documentation**: See [AUTH_API.md](../docs/api/AUTH_API.md)
- **Setup Guide**: See [SETUP_GUIDE.md](../docs/guides/SETUP_GUIDE.md)
- **Issues**: Report to development team

---

**Last Updated:** March 21, 2025
**Version:** 1.0.0
