# M5 Day 3 - Auth Context Usage Guide

## Overview
This guide demonstrates how to use the Auth Context in your React components.

## Quick Start

### 1. Import the useAuth Hook
```javascript
import { useAuth } from '../context/AuthContext';
```

### 2. Use in Your Component
```javascript
function MyComponent() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Complete Login Example

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard'); // Redirect after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Protected Route Example

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Usage in routes:
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## Role-Based Access Example

```javascript
function AdminPanel() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin' && user.role !== 'coordinator') {
    return <div>Access Denied: Admin privileges required</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin content */}
    </div>
  );
}
```

## Available Auth Context Values

| Property | Type | Description |
|----------|------|-------------|
| `user` | Object \| null | Current user data (id, name, email, role, etc.) |
| `token` | String \| null | JWT authentication token |
| `loading` | Boolean | Loading state for async operations |
| `isAuthenticated` | Boolean | Whether user is logged in |
| `login(email, password)` | Function | Login function (returns Promise) |
| `logout()` | Function | Logout function |
| `checkAuth()` | Function | Manually check authentication status |

## Testing the Implementation

### Backend Test (JWT Utilities)

Create a test file `backend/test-jwt.js`:

```javascript
import dotenv from 'dotenv';
dotenv.config();

import { generateToken, verifyToken, isTokenExpired } from './utils/jwtUtils.js';

const testPayload = {
  id: 1,
  email: 'test@example.com',
  role: 'coordinator'
};

console.log('Testing JWT Utilities...\n');

// Test 1: Generate Token
console.log('1. Generating token...');
const token = generateToken(testPayload);
console.log('✅ Token generated:', token.substring(0, 50) + '...\n');

// Test 2: Verify Token
console.log('2. Verifying token...');
const decoded = verifyToken(token);
console.log('✅ Token verified:', decoded);
console.log('   User ID:', decoded.id);
console.log('   Email:', decoded.email);
console.log('   Role:', decoded.role, '\n');

// Test 3: Check Expiration
console.log('3. Checking if token is expired...');
const expired = isTokenExpired(token);
console.log('✅ Token expired?', expired, '\n');

console.log('All tests passed! ✅');
```

Run with: `node backend/test-jwt.js`

### Frontend Test (Auth Context)

Open browser console after starting the app and run:

```javascript
// Check if AuthProvider is working
console.log('Auth Context is available');

// After logging in, check localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

## Common Patterns

### Conditional Rendering Based on Auth
```javascript
const { isAuthenticated, user } = useAuth();

return (
  <nav>
    {isAuthenticated ? (
      <>
        <span>Hello, {user.name}</span>
        <button onClick={logout}>Logout</button>
      </>
    ) : (
      <Link to="/login">Login</Link>
    )}
  </nav>
);
```

### Auto-Redirect After Login
```javascript
const { isAuthenticated } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (isAuthenticated) {
    navigate('/dashboard');
  }
}, [isAuthenticated, navigate]);
```

### Display User Role Badge
```javascript
const { user } = useAuth();

const roleColors = {
  admin: 'bg-red-500',
  coordinator: 'bg-blue-500',
  surgeon: 'bg-green-500',
  nurse: 'bg-purple-500'
};

return (
  <span className={`badge ${roleColors[user.role]}`}>
    {user.role.toUpperCase()}
  </span>
);
```

## Troubleshooting

### Error: "useAuth must be used within an AuthProvider"
**Solution:** Make sure your component is wrapped with `<AuthProvider>` in `App.jsx`.

### Token not persisting after page refresh
**Solution:** Check that `authService.js` is correctly storing the token in localStorage.

### Login successful but user state is null
**Solution:** Verify that the backend is returning the correct user object structure.

## Next Steps

- Implement protected routes in your application
- Add role-based access control to sensitive pages
- Create a user profile page using the `user` object
- Add token refresh logic for expired tokens
