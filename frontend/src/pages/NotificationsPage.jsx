// ============================================================================
// Notifications Page
// ============================================================================
// Main page for viewing and managing user notifications
// Created by: M1 (Pasindu) - Day 16
// ============================================================================

import Layout from '../components/Layout';
import NotificationList from '../components/NotificationList';

const NotificationsPage = () => {
    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-outfit">Notifications</h1>
                        <p className="text-sm text-gray-500 mt-1">Stay updated with surgery reminders and system alerts</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        All Notifications
                    </h2>

                    <NotificationList />
                </div>
            </div>
        </Layout>
    );
};

export default NotificationsPage;
