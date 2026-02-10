// ============================================================================
// Role Guard Component
// ============================================================================
// Created by: M4 (Oneli) - Day 4
// 
// Component for conditional rendering based on user roles
// Only renders children if user has required role
//
// USAGE:
// import RoleGuard from './components/RoleGuard';
// 
// <RoleGuard allowedRoles={['admin', 'coordinator']}>
//   <AdminButton />
// </RoleGuard>
//
// <RoleGuard allowedRoles={['admin']} fallback={<p>Not authorized</p>}>
//   <AdminPanel />
// </RoleGuard>
// ============================================================================

import { useAuth } from '../context/AuthContext';
import { hasRole } from '../utils/roleUtils';

const RoleGuard = ({ children, allowedRoles = [], fallback = null }) => {
    const { user, isAuthenticated } = useAuth();

    // Don't render anything if not authenticated
    if (!isAuthenticated) {
        return fallback;
    }

    // Check if user has required role
    const hasRequiredRole = hasRole(user, allowedRoles);

    if (!hasRequiredRole) {
        return fallback;
    }

    // Render children if role matches
    return children;
};

export default RoleGuard;
