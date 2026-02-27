// ============================================================================
// Role-Based Utility Functions
// ============================================================================
// Created by: M4 (Oneli) - Day 4
// 
// Helper functions for role-based access control in UI components
//
// USAGE:
// import { hasRole, hasAnyRole, hasAllRoles } from '../utils/roleUtils';
// 
// if (hasRole(user, ['admin'])) {
//   // Show admin content
// }
// ============================================================================

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object with role property
 * @param {Array<string>} roles - Array of role strings to check
 * @returns {boolean} - True if user has any of the roles
 */
export const hasRole = (user, roles = []) => {
    if (!user || !user.role) return false;
    if (roles.length === 0) return true; // No role restriction
    return roles.includes(user.role);
};

/**
 * Alias for hasRole - checks if user has any of the specified roles
 * @param {Object} user - User object with role property
 * @param {Array<string>} roles - Array of role strings to check
 * @returns {boolean} - True if user has any of the roles
 */
export const hasAnyRole = (user, roles = []) => {
    return hasRole(user, roles);
};

/**
 * Check if user has all of the specified roles
 * Note: In most systems, a user has only one role, so this will return true
 * only if the roles array has exactly one item matching the user's role
 * @param {Object} user - User object with role property
 * @param {Array<string>} roles - Array of role strings to check
 * @returns {boolean} - True if user has all roles (typically one role)
 */
export const hasAllRoles = (user, roles = []) => {
    if (!user || !user.role) return false;
    if (roles.length === 0) return true;
    // Since users typically have one role, check if that role is in the array
    // and the array has only one item
    return roles.length === 1 && roles.includes(user.role);
};

/**
 * Check if user is admin
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
    return hasRole(user, ['admin']);
};

/**
 * Check if user is coordinator
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is coordinator
 */
export const isCoordinator = (user) => {
    return hasRole(user, ['coordinator']);
};

/**
 * Check if user is staff (surgeon, nurse, anaesthetist, technician)
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is staff
 */
export const isStaff = (user) => {
    return hasRole(user, ['surgeon', 'nurse', 'anaesthetist', 'technician']);
};

/**
 * Get role display name
 * @param {string} role - Role string
 * @returns {string} - Formatted role name
 */
export const getRoleDisplayName = (role) => {
    const roleNames = {
        admin: 'Administrator',
        coordinator: 'Coordinator',
        surgeon: 'Surgeon',
        nurse: 'Nurse',
        anaesthetist: 'Anaesthetist',
        technician: 'Technician'
    };
    return roleNames[role] || role;
};

/**
 * Get role badge color
 * @param {string} role - Role string
 * @returns {string} - Tailwind color class
 */
export const getRoleBadgeColor = (role) => {
    const colors = {
        admin: 'bg-red-100 text-red-800',
        coordinator: 'bg-blue-100 text-blue-800',
        surgeon: 'bg-purple-100 text-purple-800',
        nurse: 'bg-green-100 text-green-800',
        anaesthetist: 'bg-yellow-100 text-yellow-800',
        technician: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
};
