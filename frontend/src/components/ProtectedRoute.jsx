// ============================================================================
// Protected Route Component
// ============================================================================
// Created by: M4 (Oneli) - Day 4
// 
// Wraps routes that require authentication
// Redirects to login page if user is not authenticated
//
// USAGE:
// import ProtectedRoute from './components/ProtectedRoute';
// 
// <Route path="/dashboard" element={
//   <ProtectedRoute>
//     <Dashboard />
//   </ProtectedRoute>
// } />
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render children if authenticated
    return children;
};

export default ProtectedRoute;
