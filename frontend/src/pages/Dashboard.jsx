
// Dashboard Page - Theatre Management Dashboard

// Created by: M4 (Oneli) - Day 7
// Updated by: M4 (Oneli) - UI Design Update (matching TheatreX design)
// Updated: Dashboard redesign with summary cards, upcoming table,
//          live theatre status, and staff status sections.


import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import DashboardModal from '../components/DashboardModal';
import TodaySurgeriesModal from '../components/TodaySurgeriesModal';
import StaffOnDutyModal from '../components/StaffOnDutyModal';
import AverageDurationModal from '../components/AverageDurationModal';
import { getDashboardStats, getDashboardSummary } from '../services/dashboardService';
import surgeryService from '../services/surgeryService';

// ──────────────────────────────────────────────────────────────────────────────
// Sample data for Live Theatre Status & Staff Status
// ──────────────────────────────────────────────────────────────────────────────

const SAMPLE_THEATRES = [
    {
        name: 'Theatre 1',
        status: 'in-use',
        procedure: 'Cardiac Bypass',
        surgeon: 'Dr.Sam',
        startTime: '08:30',
        progress: 78,
        duration: 240,
    },
    {
        name: 'Theatre 2',
        status: 'preparing',
        procedure: 'Hip Replacement',
        surgeon: 'Dr.Johnson',
        startTime: '10:30',
        progress: 0,
        duration: 240,
    },
    {
        name: 'Theatre 4',
        status: 'cleaning',
        procedure: null,
        surgeon: null,
        startTime: null,
        progress: 0,
        duration: 0,
    },
    {
        name: 'Theatre 3',
        status: 'available',
        procedure: null,
        surgeon: null,
        startTime: null,
        progress: 0,
        duration: 0,
    },
    {
        name: 'Theatre 5',
        status: 'available',
        procedure: null,
        surgeon: null,
        startTime: null,
        progress: 0,
        duration: 0,
    },
];

const SAMPLE_STAFF = [
    { name: 'Dr.Jayasinghe', role: 'Surgeon', status: 'busy' },
    { name: 'Dr.Oneli', role: 'Surgeon', status: 'available-soon' },
    { name: 'Dr.Chaminda', role: 'Surgeon', status: 'busy' },
    { name: 'Dr.Karavita', role: 'Surgeon', status: 'available' },
    { name: 'Dr.Dilmith', role: 'Surgeon', status: 'busy' },
    { name: 'Dr.Inthusha', role: 'Surgeon', status: 'available' },
    { name: 'Dr.Herath', role: 'Surgeon', status: 'busy' },
];

const SAMPLE_SURGERIES = [
    { id: 's1', time: '08:30', patient: 'John Cena', procedure: 'Hip Replacement', theatre: 'Theatre 2', surgeon: 'Dr.Johnson', status: 'scheduled' },
    { id: 's2', time: '10:30', patient: 'Sarah Connor', procedure: 'Cataract Surgery', theatre: 'Theatre 4', surgeon: 'Dr.Peter', status: 'scheduled' },
    { id: 's3', time: '11:00', patient: 'Martin Smith', procedure: 'Cardiac Bypass', theatre: 'Theatre 1', surgeon: 'Dr.Sam', status: 'scheduled' },
    { id: 's4', time: '14:00', patient: 'Kristina Rose', procedure: 'Appendectomy', theatre: 'Theatre 3', surgeon: 'Dr.Lee', status: 'scheduled' },
    { id: 's5', time: '16:30', patient: 'Jimmy Anderson', procedure: 'Gallbladder Removal', theatre: 'Theatre 2', surgeon: 'Dr.Gopal', status: 'scheduled' },
];

// ──────────────────────────────────────────────────────────────────────────────
// Theatre Status helpers
// ──────────────────────────────────────────────────────────────────────────────

const THEATRE_STATUS_STYLES = {
    'in-use': { bg: 'bg-red-100', text: 'text-red-700', label: 'In-use', iconBg: 'bg-red-50', iconColor: 'text-red-500', dotBg: 'bg-red-500' },
    preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Preparing', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-500', dotBg: 'bg-yellow-500' },
    cleaning: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cleaning', iconBg: 'bg-blue-50', iconColor: 'text-blue-500', dotBg: 'bg-blue-500' },
    available: { bg: 'bg-green-100', text: 'text-green-700', label: 'Available', iconBg: 'bg-green-50', iconColor: 'text-green-500', dotBg: 'bg-green-500' },
};

const STAFF_STATUS_STYLES = {
    busy: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Busy' },
    'available-soon': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', label: 'Available Soon' },
    available: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', label: 'Available' },
};

// ──────────────────────────────────────────────────────────────────────────────
// Theatre Status Icons
// ──────────────────────────────────────────────────────────────────────────────

const TheatreIcon = ({ status }) => {
    const style = THEATRE_STATUS_STYLES[status] || THEATRE_STATUS_STYLES.available;
    if (status === 'in-use') {
        return (
            <div className={`w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${style.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        );
    }
    if (status === 'preparing') {
        return (
            <div className={`w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${style.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        );
    }
    if (status === 'cleaning') {
        return (
            <div className={`w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${style.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        );
    }
    return (
        <div className={`w-10 h-10 ${style.iconBg} rounded-full flex items-center justify-center`}>
            <svg className={`w-5 h-5 ${style.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Live Theatre Card
// ──────────────────────────────────────────────────────────────────────────────

const LiveTheatreCard = ({ theatre }) => {
    const style = THEATRE_STATUS_STYLES[theatre.status] || THEATRE_STATUS_STYLES.available;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-3 mb-3">
                <TheatreIcon status={theatre.status} />
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{theatre.name}</h4>
                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                        {style.label}
                    </span>
                </div>
            </div>

            {theatre.procedure && (
                <div className="mt-2 space-y-0.5">
                    <p className="text-sm font-semibold text-gray-800">{theatre.procedure}</p>
                    <p className="text-sm text-gray-500">Surgeon: {theatre.surgeon}</p>
                    <p className="text-sm text-gray-500">Started: {theatre.startTime}</p>
                </div>
            )}

            {theatre.status === 'in-use' && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-gray-700">{theatre.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${theatre.progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-right">Duration: {theatre.duration} mins</p>
                </div>
            )}

            {theatre.status === 'preparing' && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-gray-700">0%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-200 rounded-full" style={{ width: '0%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-right">Duration: {theatre.duration} mins</p>
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Staff Status Card
// ──────────────────────────────────────────────────────────────────────────────

const StaffCard = ({ staff }) => {
    const style = STAFF_STATUS_STYLES[staff.status] || STAFF_STATUS_STYLES.available;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-all duration-300">
            <div>
                <p className="font-semibold text-gray-800">{staff.name}</p>
                <p className="text-sm text-gray-400">{staff.role}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                {style.label}
            </span>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ──────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [surgeries, setSurgeries] = useState([]);
    const [liveSurgeries, setLiveSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'surgeries' | 'staff' | 'duration' | null

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch dashboard stats and summary in parallel (graceful – failures don't block UI)
            try {
                const [statsResponse, summaryResponse] = await Promise.all([
                    getDashboardStats(),
                    getDashboardSummary()
                ]);

                if (statsResponse?.success) {
                    setStats(statsResponse.data);
                }

                if (summaryResponse?.success) {
                    setSummary(summaryResponse.data);
                }
            } catch (statsErr) {
                console.warn('Dashboard stats/summary unavailable, using defaults:', statsErr.message);
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
                console.warn('Surgeries data unavailable, using sample data:', surgeryErr.message);
                setSurgeries([]);
                setLiveSurgeries([]);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
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


    // Get upcoming surgeries (scheduled, not in progress)
    const upcomingSurgeries = surgeries
        .filter(s => s.status === 'scheduled')
        .slice(0, 10);

    // Use sample data when no real surgeries loaded
    const displaySurgeries = upcomingSurgeries.length > 0 ? upcomingSurgeries : SAMPLE_SURGERIES;

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
                {/* ─── Summary Header ─── */}
                <div className="bg-white border-b border-gray-100 shadow-sm px-6 py-4" data-testid="dashboard-title">
                    <div className="flex items-stretch gap-4 flex-wrap">
                        {/* Summary Cards */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
                            {/* Today's Surgeries */}
                            <div onClick={() => setActiveModal('surgeries')} className="cursor-pointer">
                                <SummaryCard
                                    label="Today's Surgeries"
                                    value={summary?.today_stats?.total_surgeries ?? 12}
                                    comparison={summary?.today_stats?.yesterday_comparison ?? 2}
                                    colour="bg-blue-50"
                                    icon={
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                            </div>

                            {/* Staff on Duty */}
                            <div onClick={() => setActiveModal('staff')} className="cursor-pointer">
                                <SummaryCard
                                    label="Staff on Duty"
                                    value={summary?.today_stats?.staff_on_duty?.total ?? 24}
                                    subtitle="6 surgeons, 18 nurses"
                                    colour="bg-indigo-50"
                                    icon={
                                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    }
                                />
                            </div>

                            {/* Avg Duration */}
                            <div onClick={() => setActiveModal('duration')} className="cursor-pointer">
                                <SummaryCard
                                    label="Avg Duration"
                                    value={stats?.avgDuration || 125}
                                    subtitle="minutes per surgery"
                                    colour="bg-amber-50"
                                    icon={
                                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 justify-center shrink-0">
                            <button
                                onClick={() => navigate('/surgeries/new')}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add New Surgery
                            </button>
                            <button
                                onClick={() => navigate('/calendar')}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 font-medium rounded-xl hover:bg-yellow-500 transition-all duration-200 shadow-sm hover:shadow-md text-sm whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Calendar View
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Main Content ─── */}
                <div className="p-6 space-y-8">

                    {/* ─── Upcoming Surgeries Table ─── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Upcoming Surgeries</h2>
                        </div>
                        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-blue-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Procedure</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Theatre</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Surgeon</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {upcomingSurgeries.length > 0 ? (
                                        upcomingSurgeries.map((surgery, idx) => (
                                            <tr key={surgery.id || idx} className="hover:bg-blue-50/40 transition-colors duration-150 group">
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
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => navigate(`/surgeries/${surgery.id}`)}
                                                            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="View"
                                                            aria-label="View surgery"
                                                        >
                                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/surgeries/${surgery.id}`)}
                                                            className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                                                            title="Edit"
                                                            aria-label="Edit surgery"
                                                        >
                                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSurgery(surgery.id)}
                                                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
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
                                        /* Show sample data when no real surgeries */
                                        displaySurgeries.map((s, idx) => (
                                            <tr key={s.id || idx} className="hover:bg-blue-50/40 transition-colors duration-150 group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">{s.time}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">{s.patient}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">{s.procedure}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">{s.theatre}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">{s.surgeon}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        Scheduled
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <button className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors" title="View" aria-label="View surgery">
                                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-1.5 hover:bg-green-100 rounded-lg transition-colors" title="Edit" aria-label="Edit surgery">
                                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-1.5 hover:bg-red-100 rounded-lg transition-colors" title="Delete" aria-label="Delete surgery">
                                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ─── Second Section: Live Theatre Status + Staff Status ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column – Live Theatre Status (2/3 width) */}
                        <div className="lg:col-span-2">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Live Theatre Status</h2>
                            <div className="space-y-4">
                                {SAMPLE_THEATRES.map((theatre, idx) => (
                                    <LiveTheatreCard key={idx} theatre={theatre} />
                                ))}
                            </div>
                        </div>

                        {/* Right Column – Staff Status (1/3 width) */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Staff Status</h2>
                            <div className="space-y-3">
                                {SAMPLE_STAFF.map((staff, idx) => (
                                    <StaffCard key={idx} staff={staff} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Modal Popups ─── */}
            <DashboardModal
                isOpen={activeModal === 'surgeries'}
                onClose={() => setActiveModal(null)}
                title="Today's Surgeries"
            >
                <TodaySurgeriesModal />
            </DashboardModal>

            <DashboardModal
                isOpen={activeModal === 'staff'}
                onClose={() => setActiveModal(null)}
                title="Staff on Duty"
            >
                <StaffOnDutyModal />
            </DashboardModal>

            <DashboardModal
                isOpen={activeModal === 'duration'}
                onClose={() => setActiveModal(null)}
                title="Average Surgery Duration"
            >
                <AverageDurationModal />
            </DashboardModal>
        </Layout>
    );
};

export default Dashboard;
