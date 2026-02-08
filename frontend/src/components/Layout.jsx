import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Sidebar from './Sidebar';
import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';

/**
 * Layout Component
 * Main application layout wrapper with Header, Sidebar, and content area
 * Created by: M6 (Dinil) - Day 2
 * Updated by: M4 (Oneli) - Day 2 (Added Header component)
 * Updated by: M5 - Day 2 (Integrated Sidebar component)
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Main content to render
 * @param {boolean} props.showHeader - Whether to show the header (default: true)
 * @param {boolean} props.showSidebar - Whether to show the sidebar (default: true)
 */
const Layout = ({ children, showHeader = true, showSidebar = true }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleSidebarToggle = () => {
        setIsSidebarCollapsed(prev => !prev);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Component - Created by M4 */}
            {showHeader && <Header />}

            <div className="flex">
                {/* Sidebar Component - Created by M5 */}
                {showSidebar && (
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        onToggle={handleSidebarToggle}
                    />
                {/* Sidebar - Placeholder for M5's Sidebar component */}
                {showSidebar && (
                    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
                        <nav className="p-4">
                            <div className="space-y-2">
                                <div className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg">
                                    Dashboard
                                </div>
                                <div className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                    Surgeries
                                </div>
                                <div className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                    Theatres
                                </div>
                                <div className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                    Staff
                                </div>
                                <div className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                                    Patients
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="px-4 text-xs text-gray-500">
                                        Sidebar Component (M5)
                                    </p>
                                </div>
                            </div>
                        </nav>
                    </aside>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
    showHeader: PropTypes.bool,
    showSidebar: PropTypes.bool,
};

export default Layout;

