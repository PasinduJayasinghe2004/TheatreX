// ============================================================================
// Role-Based Route Component
// ============================================================================
// Created by: M4 (Oneli) - Day 4
// 
// Wraps routes that require specific user roles
// Extends ProtectedRoute functionality with role checking
//
// USAGE:
// import RoleBasedRoute from './components/RoleBasedRoute';
// 
// <Route path="/admin" element={
//   <RoleBasedRoute allowedRoles={['admin']}>
//     <AdminPanel />
//   </RoleBasedRoute>
// } />
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();

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

    // Check if user has required role
    const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(user?.role);

    if (!hasRequiredRole) {
        // Show unauthorized message
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-4">
                        You don&apos;t have permission to access this page.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Required role: <span className="font-semibold">{allowedRoles.join(', ')}</span>
                        <br />
                        Your role: <span className="font-semibold">{user?.role}</span>
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Render children if role matches
    return children;
};

export default RoleBasedRoute;
