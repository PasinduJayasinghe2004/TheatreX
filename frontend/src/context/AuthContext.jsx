/* eslint-disable react-refresh/only-export-components */

// Authentication Context - Clerk Integration
// This file bridges Clerk authentication with the existing application context

import { createContext, useState, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Clerk hooks
    const { user: clerkUser, isLoaded } = useUser();
    const { getToken, signOut } = useClerkAuth();

    // Internal state to mirror Clerk for convenience/compatibility
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sync Clerk user with local state
    useEffect(() => {
        if (isLoaded) {
            if (clerkUser) {
                // Map Clerk user to the format expected by the app
                const mappedUser = {
                    id: clerkUser.id,
                    email: clerkUser.primaryEmailAddress?.emailAddress,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    fullName: clerkUser.fullName,
                    role: clerkUser.publicMetadata.role || 'user', // Assuming role is stored in metadata
                    imageUrl: clerkUser.imageUrl
                };
                setUser(mappedUser);

                // Also store in localStorage if authService still needs it
                localStorage.setItem('user', JSON.stringify(mappedUser));

                // Fetch JWT token
                const updateToken = async () => {
                    try {
                        const t = await getToken();
                        setToken(t);
                        if (t) localStorage.setItem('token', t);
                    } catch (err) {
                        console.error('Error fetching Clerk token:', err);
                    }
                };
                updateToken();
            } else {
                setUser(null);
                setToken(null);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            setLoading(false);
        }
    }, [clerkUser, isLoaded, getToken]);

    // Computed state
    const isAuthenticated = !!clerkUser;

    // Bridge functions
    const logout = async () => {
        try {
            await signOut();
            authService.logout(); // Clear any remaining legacy items
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Placeholder for login (Clerk uses its own UI components for login)
    const login = () => {
        console.warn('Manual login() called. Please use Clerk <SignIn /> or <SignUp /> components.');
    };

    const contextValue = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth: () => { } // Managed by Clerk now
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

