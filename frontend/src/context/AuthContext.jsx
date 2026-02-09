// ============================================================================
// Authentication Context
// ============================================================================
// This file provides global authentication state management using React Context
// Created by: M5 (Inthusha) - Day 3
// 
// PURPOSE:
// - Manage authentication state across the entire application
// - Provide login/logout functionality to all components
// - Handle token storage and retrieval
// - Auto-check authentication status on app load
//
// USAGE:
// 1. Wrap your app with AuthProvider in App.jsx:
//    <AuthProvider><App /></AuthProvider>
//
// 2. Use the hook in any component:
//    const { user, login, logout, isAuthenticated } = useAuth();
//
// EXPORTS:
// - AuthContext: The context object (rarely used directly)
// - AuthProvider: Wrapper component for the app
// - useAuth: Custom hook to access auth state and functions
// ============================================================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// ============================================================================
// Create Authentication Context
// ============================================================================
// This context will hold the authentication state and functions
// Default value is null (will be replaced by Provider)
const AuthContext = createContext(null);

// ============================================================================
// COMPONENT: AuthProvider
// ============================================================================
// Wraps the application and provides authentication state to all children
//
// STATE:
// - user: Current user object { id, name, email, role, ... } or null
// - token: JWT token string or null
// - loading: Boolean indicating if auth check is in progress
// - isAuthenticated: Boolean indicating if user is logged in
//
// FUNCTIONS:
// - login(email, password): Authenticate user and update state
// - logout(): Clear auth state and redirect to login
// - checkAuth(): Verify token and restore user session
// ============================================================================
export const AuthProvider = ({ children }) => {
    // ========================================
    // STATE MANAGEMENT
    // ========================================

    // User object containing user details (null if not logged in)
    const [user, setUser] = useState(null);

    // JWT token for API authentication (null if not logged in)
    const [token, setToken] = useState(null);

    // Loading state for async operations (login, auth check)
    const [loading, setLoading] = useState(true);

    // Computed state: user is authenticated if both user and token exist
    const isAuthenticated = !!user && !!token;

    // ========================================
    // FUNCTION: Check Authentication Status
    // ========================================
    // Runs on component mount to restore user session from localStorage
    // If valid token exists, restore user data
    // If no token or invalid token, clear auth state
    const checkAuth = () => {
        try {
            // Get token from localStorage (via authService)
            const storedToken = authService.getToken();
            const storedUser = authService.getCurrentUser();

            if (storedToken && storedUser) {
                // Token and user exist in localStorage
                // Restore them to state
                setToken(storedToken);
                setUser(storedUser);
                console.log('✅ User session restored from localStorage');
            } else {
                // No valid session found
                console.log('ℹ️ No existing user session found');
            }
        } catch (error) {
            console.error('❌ Error checking authentication:', error);
            // If error occurs, clear auth state to be safe
            setUser(null);
            setToken(null);
        } finally {
            // Always set loading to false when check is complete
            setLoading(false);
        }
    };

    // ========================================
    // FUNCTION: Login User
    // ========================================
    // Authenticates user with email and password
    // Updates state and localStorage on success
    //
    // PARAMETERS:
    // @param {String} email - User email
    // @param {String} password - User password
    //
    // RETURNS:
    // @returns {Promise<Object>} - Response data with user and token
    //
    // THROWS:
    // @throws {Error} - If login fails (invalid credentials, network error, etc.)
    //
    // EXAMPLE:
    // try {
    //   await login('user@example.com', 'password123');
    //   console.log('Login successful!');
    // } catch (error) {
    //   console.error('Login failed:', error.message);
    // }
    const login = async (email, password) => {
        try {
            setLoading(true);

            // Call authService to perform login API request
            // This will also store token and user in localStorage
            const response = await authService.login(email, password);

            if (response.success) {
                // Update state with user data and token
                setUser(response.user);
                setToken(response.token);

                console.log('✅ Login successful:', response.user.email);

                return response;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Login error:', error.message);
            // Clear state on login failure
            setUser(null);
            setToken(null);
            throw error; // Re-throw so calling component can handle it
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // FUNCTION: Logout User
    // ========================================
    // Clears authentication state and localStorage
    // Redirects user to login page (optional)
    //
    // EXAMPLE:
    // const handleLogout = () => {
    //   logout();
    //   navigate('/login');
    // };
    const logout = () => {
        try {
            // Clear localStorage (via authService)
            authService.logout();

            // Clear state
            setUser(null);
            setToken(null);

            console.log('✅ User logged out successfully');
        } catch (error) {
            console.error('❌ Logout error:', error);
        }
    };

    // ========================================
    // EFFECT: Check Auth on Mount
    // ========================================
    // Runs once when component mounts
    // Restores user session if valid token exists
    useEffect(() => {
        checkAuth();
    }, []); // Empty dependency array = run once on mount

    // ========================================
    // CONTEXT VALUE
    // ========================================
    // This object is provided to all consuming components
    // Contains all state and functions needed for authentication
    const contextValue = {
        // State
        user,              // Current user object or null
        token,             // JWT token or null
        loading,           // Loading state for async operations
        isAuthenticated,   // Boolean: is user logged in?

        // Functions
        login,             // Login function
        logout,            // Logout function
        checkAuth          // Manual auth check function (rarely needed)
    };

    // ========================================
    // RENDER PROVIDER
    // ========================================
    // Wrap children with Context Provider
    // All child components can now access auth state via useAuth()
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// ============================================================================
// CUSTOM HOOK: useAuth
// ============================================================================
// Provides easy access to authentication context
// Must be used within AuthProvider
//
// RETURNS:
// @returns {Object} - Auth context value
//   - user: Current user object or null
//   - token: JWT token or null
//   - loading: Loading state
//   - isAuthenticated: Boolean
//   - login: Login function
//   - logout: Logout function
//   - checkAuth: Auth check function
//
// THROWS:
// @throws {Error} - If used outside of AuthProvider
//
// EXAMPLE:
// const MyComponent = () => {
//   const { user, isAuthenticated, logout } = useAuth();
//   
//   if (!isAuthenticated) {
//     return <div>Please log in</div>;
//   }
//   
//   return (
//     <div>
//       <h1>Welcome, {user.name}!</h1>
//       <button onClick={logout}>Logout</button>
//     </div>
//   );
// };
// ============================================================================
export const useAuth = () => {
    // Get context value
    const context = useContext(AuthContext);

    // Ensure hook is used within AuthProvider
    if (!context) {
        throw new Error(
            'useAuth must be used within an AuthProvider. ' +
            'Wrap your app with <AuthProvider> in App.jsx'
        );
    }

    return context;
};

// ============================================================================
// Export Context (for advanced use cases)
// ============================================================================
// Typically you should use useAuth() hook instead
// This is exported for testing or advanced scenarios
export default AuthContext;
