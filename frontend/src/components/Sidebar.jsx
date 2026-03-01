import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import theatrexLogo from '../assets/theatrex-logo.svg';

/**
 * Sidebar Component
 * Navigation sidebar for the main application layout
 * Created by: M5 - Day 2
 * Updated by: M1 (Pasindu) - Day 8 (Added Emergency Booking link)
 * Updated by: M3 (Janani)  - Day 11 (Added Live Status link)
 * Updated by: M1 (Pasindu) - Day 12 (Added Coordinator Dashboard link)
 * Updated by: M1 (Pasindu) - Day 13 (Surgeons sub-link wired to /staff/surgeons)
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isCollapsed - Whether the sidebar is collapsed (default: false)
 * @param {function} props.onToggle - Callback when toggle button is clicked
 */

// Navigation items configuration
const navigationItems = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: 'Surgeries',
        path: '/surgeries',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
    },
    {
        name: 'Theatres',
        path: '/theatres',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        name: 'Live Status',
        path: '/live-status',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        name: 'Coordinator',
        path: '/coordinator',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        name: 'Calendar',
        path: '/calendar',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        name: 'Staff',
        path: '/staff',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        subItems: [
            { name: 'Surgeons', path: '/staff/surgeons' },
            { name: 'Nurses', path: '/staff/nurses' },
            { name: 'Anaesthetists', path: '/staff/anaesthetists' },
            { name: 'Technicians', path: '/staff/technicians' },
        ],
    },
    {
        name: 'Patients',
        path: '/patients',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        name: 'Analytics',
        path: '/analytics',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        name: 'History',
        path: '/history',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

const Sidebar = ({ isCollapsed = false, onToggle }) => {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState({});

    // Toggle sub-menu expansion
    const toggleSubMenu = (itemName) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    // Check if current path matches
    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <aside
            className={`
                ${isCollapsed ? 'w-16' : 'w-64'} 
                bg-white dark:bg-slate-900
                border-r border-gray-200 dark:border-slate-700
                min-h-screen sticky top-16 
                transition-all duration-300 ease-in-out
                flex flex-col
            `}
        >
            {/* Toggle Button */}
            <div className="p-2 flex justify-end">
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Emergency Booking Button - M1 Day 8 */}
            <div className="px-2 mb-4">
                <Link
                    to="/emergency"
                    className={`
                        flex items-center gap-2 px-3 py-3 rounded-lg
                        bg-red-600 hover:bg-red-700 text-white font-semibold
                        transition-all duration-200 shadow-md hover:shadow-lg
                        ${isCollapsed ? 'justify-center' : ''}
                        ${isActive('/emergency') ? 'ring-2 ring-red-300 dark:ring-red-800' : ''}
                    `}
                >
                    <span className="text-xl">🚨</span>
                    {!isCollapsed && <span>Emergency</span>}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigationItems.map((item) => (
                    <div key={item.name}>
                        {/* Main Nav Item */}
                        {item.subItems ? (
                            // Item with sub-menu
                            <button
                                onClick={() => toggleSubMenu(item.name)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    text-sm font-medium transition-all duration-200
                                    ${isActive(item.path)
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-700 dark:border-blue-500'
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100'
                                    }
                                    ${isCollapsed ? 'justify-center' : 'justify-between'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={isActive(item.path) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && <span>{item.name}</span>}
                                </div>
                                {!isCollapsed && (
                                    <svg
                                        className={`w-4 h-4 transition-transform ${expandedItems[item.name] ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>
                        ) : (
                            // Regular link item
                            <Link
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    text-sm font-medium transition-all duration-200
                                    ${isActive(item.path)
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-700 dark:border-blue-500'
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                            >
                                <span className={isActive(item.path) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        )}

                        {/* Sub-menu Items */}
                        {item.subItems && !isCollapsed && expandedItems[item.name] && (
                            <div className="mt-1 ml-8 space-y-1">
                                {item.subItems.map((subItem) => (
                                    <Link
                                        key={subItem.name}
                                        to={subItem.path}
                                        className={`
                                            block px-3 py-2 rounded-lg text-sm
                                            transition-colors duration-200
                                            ${isActive(subItem.path)
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                                                : 'text-gray-500 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300'
                                            }
                                        `}
                                    >
                                        {subItem.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                        <img src={theatrexLogo} alt="TheatreX Logo" className="w-5 h-5 dark:brightness-0 dark:invert dark:opacity-50" />
                        <span>TheatreX v1.0</span>
                    </div>
                </div>
            )}
        </aside>
    );
};

Sidebar.propTypes = {
    isCollapsed: PropTypes.bool,
    onToggle: PropTypes.func,
};

export default Sidebar;
