import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import RoleGuard from './RoleGuard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getRoleDisplayName, getRoleBadgeColor } from '../utils/roleUtils';
import theatrexLogo from '../assets/theatrex-logo.svg';

/**
 * Header Component
 * Professional dashboard header with live clock, notifications, and user menu
 * Created by: M4 (Oneli) - Day 2
 * Updated by: M1 (Pasindu) - Day 13 (Redesigned to match dashboard mockup)
 */
const Header = ({ pageTitle = 'Theatre Management Dashboard', pageSubtitle = 'Real - time monitoring and scheduling overview' }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live clock - updates every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time as "09:26 PM"
    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    // Format date as "Today - 25 Feb 2026"
    const today = new Date();
    const isToday =
        currentTime.getDate() === today.getDate() &&
        currentTime.getMonth() === today.getMonth() &&
        currentTime.getFullYear() === today.getFullYear();

    const formattedDate = isToday
        ? `Today - ${currentTime.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })}`
        : currentTime.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    const handleLogout = () => {
        setIsUserMenuOpen(false);
        logout();
        navigate('/login', { state: { loggedOut: true } });
    };

    const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 h-16 flex items-center transition-colors duration-300">
            <div className="flex items-center w-full h-full">

                {/* ── Brand / Logo Section ─────────────────────────────── */}
                <div className="flex items-center gap-2.5 px-5 h-full shrink-0 w-56">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <img src={theatrexLogo} alt="TheatreX Logo" className="w-5 h-5 brightness-0 invert" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight select-none">
                        TheatreX
                    </span>
                </div>

                {/* ── Vertical Divider ─────────────────────────────────── */}
                <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 shrink-0" />

                {/* ── Page Title Section ───────────────────────────────── */}
                <div className="flex-1 px-6">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100 leading-tight">
                        {pageTitle}
                    </h1>
                    <p className="text-xs text-gray-400 dark:text-slate-500 leading-tight mt-0.5">
                        {pageSubtitle}
                    </p>
                </div>

                {/* ── Right Controls ───────────────────────────────────── */}
                <div className="flex items-center gap-1 px-4 shrink-0">

                    {/* Search */}
                    <button
                        id="header-search-btn"
                        className="p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all duration-200"
                        aria-label="Search"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {/* Notifications */}
                    <button
                        id="header-notifications-btn"
                        className="relative p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all duration-200"
                        aria-label="Notifications"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {/* Notification dot */}
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white" />
                    </button>

                    {/* User Avatar */}
                    <div className="relative mx-1">
                        <button
                            id="header-user-menu-btn"
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 ring-2 ring-white hover:ring-blue-200"
                            aria-label="User menu"
                        >
                            {userInitial}
                        </button>

                        {/* User Dropdown */}
                        {isUserMenuOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsUserMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-50 animate-fadeIn">
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                                            {user?.email || 'user@theatrex.com'}
                                        </p>
                                        <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role || 'coordinator')}`}>
                                            {getRoleDisplayName(user?.role || 'coordinator')}
                                        </span>
                                    </div>

                                    <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </a>
                                    <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Settings
                                    </a>
                                    <RoleGuard allowedRoles={['admin']}>
                                        <a href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                            </svg>
                                            Admin Panel
                                        </a>
                                    </RoleGuard>
                                    <div className="border-t border-gray-100 dark:border-slate-700 mt-1" />
                                    <button
                                        onClick={handleLogout}
                                        id="header-logout-btn"
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Divider ─────────────────────────────────────── */}
                    <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-2 shrink-0" />

                    {/* ── Live Clock & Date ────────────────────────────── */}
                    <div className="flex flex-col items-end leading-tight select-none mr-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-slate-200 tabular-nums">
                            {formattedTime}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                            {formattedDate}
                        </span>
                    </div>

                    {/* ── Dark Mode Toggle ─────────────────────────────── */}
                    <button
                        id="header-dark-mode-btn"
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                        aria-label="Toggle dark mode"
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDark ? (
                            // Sun icon - shown in dark mode (click to go light)
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            // Moon icon - shown in light mode (click to go dark)
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    pageTitle: PropTypes.string,
    pageSubtitle: PropTypes.string,
    user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
    }),
};

export default Header;
