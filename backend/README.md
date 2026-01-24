# TheatreX Backend API

Operating Theatre Management System - Backend Server

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MySQL Database (Aiven Cloud configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your database credentials (already configured for Aiven)

3. Start development server:
```bash
npm run dev
```

4. Start production server:
```bash
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Users (Day 1 - Basic Setup)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Coming in Day 3)
- `PUT /api/users/:id` - Update user (Coming in Day 3)
- `DELETE /api/users/:id` - Delete user (Coming in Day 3)

## 🗄️ Database Tables

### Users Table (M1 - Day 1)
- `id` - Primary key
- `name` - User full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (admin, coordinator, surgeon, nurse, anaesthetist, technician)
- `phone` - Contact number
- `is_active` - Account status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Coming Soon (Day 1 - Other Members)
- Surgeries table (M2)
- Theatres table (M3)
- Patients table (M4)
- Notifications table (M5)
- And more...

## 🔧 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (Aiven Cloud)
- **ORM:** mysql2 (Promise-based)
- **Security:** bcryptjs, jsonwebtoken (for future auth)
- **Environment:** dotenv
- **CORS:** cors

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection configuration
├── controllers/
│   └── userController.js    # User business logic
├── models/
│   └── userModel.js         # User table schema
├── routes/
│   └── userRoutes.js        # User API routes
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=development
DB_HOST=your-database-host
DB_PORT=26057
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=defaultdb
DB_SSL=true
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

## 👥 Team Members

- **M1:** GitHub setup, Express server, MySQL config, users table
- **M2:** Surgeries table (Day 1)
- **M3:** Theatres table (Day 1)
- **M4:** Patients table (Day 1)
- **M5:** Notifications table (Day 1)
- **M6:** Additional tables (Day 1)

## 📝 Development Notes

- Server runs on port 5000
- Database uses SSL connection (Aiven Cloud)
- All API responses follow standard format:
  ```json
  {
    "success": true/false,
    "message": "...",
    "data": {...}
  }
  ```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `.env` credentials
- Check SSL configuration
- Ensure Aiven database is accessible

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📅 Next Steps (Day 2-3)

- Day 2: Additional tables (patients, notifications, etc.)
- Day 3: Authentication (register, login, JWT)
- Day 4: RBAC and protected routes

---

**Built by TheatreX Team - 30 Day Full-Stack Challenge** 🚀
