
// Dashboard Page - Theatre Management Dashboard

// Created by: M4 (Oneli) - Day 7
// Updated by: M4 (Oneli) - UI Design Update (matching TheatreX design)
// 
// Main dashboard page with:
// - Real-time clock and date display
// - Today's surgeries, staff on duty, average duration stats
// - Quick action buttons (Add Surgery, Emergency, Calendar)
// - Live surgeries & status with progress tracking
// - Upcoming surgeries table


import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { getDashboardStats } from '../services/dashboardService';
import surgeryService from '../services/surgeryService';

// Clock component for real-time display
const LiveClock = memo(() => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="flex items-center gap-2 text-gray-600">
            <span className="text-lg font-semibold text-gray-800">{formatTime(time)}</span>
            <span className="text-sm">Today - {formatDate(time)}</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </div>
    );
});

// Live Theatre Card component
const LiveTheatreCard = ({ theatre, surgery }) => {
    const progress = surgery?.progress || Math.floor(Math.random() * 60 + 20); // Mock progress if not available
    const duration = surgery?.elapsed_minutes || 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                {/* Heartbeat Icon */}
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                <div className="flex-1">
                    {/* Theatre Name & Status */}
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                            {theatre?.name || 'Theatre 1'} 
                            <span className="text-gray-400 font-normal ml-1">
                                ({theatre?.type || 'General'})
                            </span>
                        </h3>
                    </div>
                    {surgery ? (
                        <StatusBadge status="in_progress" />
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Available
                        </span>
                    )}

                    {/* Surgery Info */}
                    <div className="mt-3">
                        <p className="font-medium text-gray-800">
                            {surgery?.surgery_type || 'No Active Surgery'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Surgeon: {surgery?.surgeon?.name || surgery?.surgeon_name || 'Not assigned'}
                        </p>
                        {surgery?.start_time && (
                            <p className="text-sm text-gray-500">Started: {surgery.start_time}</p>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {surgery && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium text-gray-700">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Duration: {duration} mins
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [surgeries, setSurgeries] = useState([]);
    const [liveSurgeries, setLiveSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch dashboard stats
            const statsResponse = await getDashboardStats();
            if (statsResponse.success) {
                setStats(statsResponse.data);
            }

            // Fetch today's surgeries
            const today = new Date().toISOString().split('T')[0];
            try {
                const surgeriesResponse = await surgeryService.getAllSurgeries({
                    startDate: today,
                    endDate: today
                });
                if (surgeriesResponse.success) {
                    setSurgeries(surgeriesResponse.data || []);
                    // Filter live/in-progress surgeries
                    setLiveSurgeries(
                        (surgeriesResponse.data || []).filter(s => s.status === 'in_progress')
                    );
                }
            } catch (surgeryErr) {
                console.error('Error fetching surgeries:', surgeryErr);
                // Surface surgeries-specific error to the UI
                setError(
                    surgeryErr.response?.data?.message || 'Failed to load today\'s surgeries'
                );
                // Ensure we don't show stale surgery data on error
                setSurgeries([]);
                setLiveSurgeries([]);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Handle surgery deletion with confirmation
    const handleDeleteSurgery = async (surgeryId) => {
        if (!window.confirm('Are you sure you want to delete this surgery? This action cannot be undone.')) {
            return;
        }
        try {
            await surgeryService.deleteSurgery(surgeryId);
            setSurgeries(prev => prev.filter(s => s.id !== surgeryId));
        } catch (err) {
            console.error('Error deleting surgery:', err);
            alert(err.message || 'Failed to delete surgery. Please try again.');
        }
    };

    // Calculate today's stats
    const todaysSurgeries = surgeries.length;
    const yesterdayComparison = stats?.yesterdayComparison ?? null;
    const staffOnDuty = stats?.staffOnDuty ?? null;
    const avgDuration = stats?.avgDuration ?? null;

    // Get upcoming surgeries (scheduled, not in progress)
    const upcomingSurgeries = surgeries
        .filter(s => s.status === 'scheduled')
        .slice(0, 5);

    // Delete surgery with confirmation
    const handleDelete = async (surgeryId) => {
        if (!window.confirm('Are you sure you want to delete this surgery?')) return;
        try {
            await surgeryService.deleteSurgery(surgeryId);
            setSurgeries(prev => prev.filter(s => s.id !== surgeryId));
        } catch (err) {
            console.error('Error deleting surgery:', err);
            alert(err.message || 'Failed to delete surgery');
        }
    };

    // Format time for display
    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        try {
            const date = new Date(`2000-01-01T${timeStr}`);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return timeStr;
        }
    };

    // Loading state
    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Error state
    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-center">
                        <div className="text-red-600 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="bg-white border-b border-gray-100 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Theatre Management Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Real-time monitoring and scheduling overview</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <button
                                aria-label="Search"
                                title="Search"
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                onClick={() => navigate('/surgeries')}
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            {/* Notifications */}
                            <button
                                aria-label="Notifications"
                                title="Notifications (coming soon)"
                                className="p-2 rounded-full transition-colors opacity-50 cursor-not-allowed"
                                disabled
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            {/* User Avatar */}
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </div>
                            {/* Clock */}
                            <LiveClock />
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Today's Surgeries */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium mb-1">Today&apos;s Surgeries</p>
                                    <p className="text-4xl font-bold text-gray-900">{todaysSurgeries}</p>
                                    <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                                        {yesterdayComparison !== null ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                </svg>
                                                +{yesterdayComparison} from yesterday
                                            </>
                                        ) : (
                                            <span className="text-gray-400">No comparison data</span>
                                        )}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Staff on Duty */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium mb-1">Staff on Duty</p>
                                    <p className="text-4xl font-bold text-gray-900">{staffOnDuty?.total ?? '--'}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {staffOnDuty ? (
                                            `${staffOnDuty.surgeons ?? '--'} surgeons, ${staffOnDuty.nurses ?? '--'} nurses, ${staffOnDuty.anaesthetists ?? '--'} anaesthetists, ${staffOnDuty.technicians ?? '--'} techs`
                                        ) : 'No staff data available'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Average Duration */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium mb-1">Avg Duration</p>
                                    <p className="text-4xl font-bold text-gray-900">{avgDuration ?? '--'}</p>
                                    <p className="text-sm text-gray-500 mt-2">minutes per surgery</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 mb-8 max-w-md">
                        <button
                            onClick={() => navigate('/surgeries/new')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Surgery
                        </button>
                        <button
                            onClick={() => navigate('/emergency')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Emergency Surgery
                        </button>
                        <button
                            onClick={() => navigate('/calendar')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Calendar View
                        </button>
                    </div>

                    {/* Live Surgeries & Status */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Live Surgeries & Status</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {liveSurgeries.length > 0 ? (
                                liveSurgeries.map((surgery, idx) => (
                                    <LiveTheatreCard 
                                        key={surgery.id || idx}
                                        theatre={{ 
                                            name: `Theatre ${surgery.theatre_id || idx + 1}`,
                                            type: 'General',
                                            status: 'in_progress'
                                        }}
                                        surgery={surgery}
                                    />
                                ))
                            ) : (
                                <LiveTheatreCard 
                                    theatre={{ name: 'Theatre 1', type: 'General', status: 'available' }}
                                    surgery={null}
                                />
                            )}
                        </div>
                    </div>

                    {/* Upcoming Surgeries Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Upcoming Surgeries</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theatre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surgeon</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {upcomingSurgeries.length > 0 ? (
                                        upcomingSurgeries.map((surgery, idx) => (
                                            <tr key={surgery.id || idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatTime(surgery.scheduled_time)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">
                                                        {surgery.patient_name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">
                                                        {surgery.surgery_type || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">
                                                        Theatre {surgery.theatre_id || '--'}
                                                        {surgery.priority === 'emergency' && (
                                                            <span className="text-red-500 ml-1">(Emergency)</span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">
                                                        {surgery.surgeon?.name || surgery.surgeon_name || 'Not assigned'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={surgery.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => navigate(`/surgeries/${surgery.id}`)}
                                                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                                            title="View"
                                                            aria-label="View surgery"
                                                        >
                                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => navigate(`/surgeries/${surgery.id}`)}
                                                            className="p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="Edit"
                                                            aria-label="Edit surgery"
                                                        >
                                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteSurgery(surgery.id)}
                                                            className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Delete"
                                                            aria-label="Delete surgery"
                                                        >
                                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                No upcoming surgeries scheduled for today
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
