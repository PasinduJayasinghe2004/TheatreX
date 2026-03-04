import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import RoleGuard from './RoleGuard';
import NotificationDropdown from './NotificationDropdown';
import notificationService from '../services/notificationService';
import { getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';

/**
 * Header Component
 * Professional header with navigation, user menu, and notifications
 * Created by: M4 (Oneli) - Day 2
 * Updated by: M4 (Oneli) - Day 16 (unread badge + notification dropdown)
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with name, email, role
 * @param {Function} props.onLogout - Logout handler function
 */
const Header = ({ user, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count on mount and every 30 seconds
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.count || 0);
        } catch {
            // Silently fail – user may not be authenticated yet
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const navigationLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: [] },
        { name: 'Surgeries', href: '/surgeries', icon: '🏥', roles: [] },
        { name: 'Theatres', href: '/theatres', icon: '🎭', roles: [] },
        { name: 'Staff', href: '/staff', icon: '👥', roles: ['admin', 'coordinator'] },
        { name: 'Patients', href: '/patients', icon: '🧑‍⚕️', roles: [] },
        { name: 'Admin Panel', href: '/admin', icon: '⚙️', roles: ['admin'] },
    ];

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        setIsUserMenuOpen(false);
    };

    const handleBellClick = () => {
        setIsNotifOpen((prev) => !prev);
        // Refresh unread count when closing
        if (isNotifOpen) {
            fetchUnreadCount();
        }
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                                <span className="text-3xl">🎭</span>
                                TheatreX
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:ml-10 md:flex md:space-x-1">
                            {navigationLinks.map((link) => (
                                <RoleGuard key={link.name} allowedRoles={link.roles}>
                                    <a
                                        href={link.href}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <span>{link.icon}</span>
                                        {link.name}
                                    </a>
                                </RoleGuard>
                            ))}
                        </nav>
                    </div>

                    {/* Right Section - Notifications & User Menu */}
                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={handleBellClick}
                                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                aria-label="Notifications"
                                id="notification-bell"
                            >
                                <span className={`text-xl ${isNotifOpen ? 'animate-bounce' : ''}`}>🔔</span>
                                {/* Unread Badge – hidden when count is 0 */}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none shadow">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            <NotificationDropdown
                                isOpen={isNotifOpen}
                                onClose={() => {
                                    setIsNotifOpen(false);
                                    fetchUnreadCount();
                                }}
                            />
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                aria-label="User menu"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.name || 'User'}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role || 'coordinator')}`}>
                                        {getRoleDisplayName(user?.role || 'coordinator')}
                                    </span>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {user?.email || 'user@theatrex.com'}
                                        </p>
                                    </div>
                                    <a
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                        👤 Profile
                                    </a>
                                    <a
                                        href="/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                        ⚙️ Settings
                                    </a>
                                    <RoleGuard allowedRoles={['admin']}>
                                        <a
                                            href="/admin"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            🔧 Admin Panel
                                        </a>
                                    </RoleGuard>
                                    <div className="border-t border-gray-100 mt-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            aria-label="Toggle mobile menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-3">
                        <nav className="space-y-1">
                            {navigationLinks.map((link) => (
                                <RoleGuard key={link.name} allowedRoles={link.roles}>
                                    <a
                                        href={link.href}
                                        className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <span>{link.icon}</span>
                                        {link.name}
                                    </a>
                                </RoleGuard>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

Header.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
    }),
    onLogout: PropTypes.func,
};

Header.defaultProps = {
    user: {
        name: 'User',
        email: 'user@theatrex.com',
        role: 'coordinator',
    },
    onLogout: () => console.log('Logout clicked'),
};

export default Header;
