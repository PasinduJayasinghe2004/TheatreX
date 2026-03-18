
import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // ========================================
    // Check authentication on mount
    // ========================================
    const checkAuth = async () => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Optional: Verify token with backend
                // const profile = await authService.getProfile();
                // if (profile.success) setUser(profile.user);
            }
        } catch (error) {
            console.error('Auth Check Error:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // ========================================
    // Login Function
    // ========================================
    const login = async (email, password) => {
        const data = await authService.login(email, password);
        if (data.success) {
            setUser(data.user);
            setToken(data.token);
            return data;
        }
    };

    // ========================================
    // Logout Function
    // ========================================
    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
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
