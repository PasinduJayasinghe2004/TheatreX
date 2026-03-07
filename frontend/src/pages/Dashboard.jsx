
// Dashboard Page - Theatre Management Dashboard

// Created by: M4 (Oneli) - Day 7
// Updated by: M4 (Oneli) - UI Design Update (matching TheatreX design)
// Updated: Dashboard redesign with summary cards, upcoming table,
//          live theatre status, and staff status sections.


import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import DashboardModal from '../components/DashboardModal';
import TodaySurgeriesModal from '../components/TodaySurgeriesModal';
import StaffOnDutyModal from '../components/StaffOnDutyModal';
import AverageDurationModal from '../components/AverageDurationModal';
import { useAuth } from '../context/AuthContext';
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
        patient: 'Martin Smith',
        anesthesiologist: 'Dr.Perera',
        startTime: '08:30',
        progress: 78,
        duration: 240,
        preOpChecklist: { consent: true, bloodWork: true, imaging: true, anesthesia: true },
    },
    {
        name: 'Theatre 2',
        status: 'preparing',
        procedure: 'Hip Replacement',
        surgeon: 'Dr.Johnson',
        patient: 'John Cena',
        anesthesiologist: 'Dr.Silva',
        startTime: '10:30',
        progress: 0,
        duration: 240,
        preOpChecklist: { consent: true, bloodWork: true, imaging: false, anesthesia: false },
    },
    {
        name: 'Theatre 4',
        status: 'cleaning',
        procedure: null,
        surgeon: null,
        patient: null,
        anesthesiologist: null,
        startTime: null,
        progress: 0,
        duration: 0,
        preOpChecklist: null,
    },
    {
        name: 'Theatre 3',
        status: 'available',
        procedure: null,
        surgeon: null,
        patient: null,
        anesthesiologist: null,
        startTime: null,
        progress: 0,
        duration: 0,
        preOpChecklist: null,
    },
    {
        name: 'Theatre 5',
        status: 'available',
        procedure: null,
        surgeon: null,
        patient: null,
        anesthesiologist: null,
        startTime: null,
        progress: 0,
        duration: 0,
        preOpChecklist: null,
    },
];

const SAMPLE_STAFF = [
    { name: 'Dr.Jayasinghe', role: 'Surgeon', status: 'busy', specialty: 'Cardiac', id: 'staff1' },
    { name: 'Dr.Oneli', role: 'Surgeon', status: 'available-soon', specialty: 'Ortho', id: 'staff2' },
    { name: 'Dr.Chaminda', role: 'Surgeon', status: 'busy', specialty: 'General', id: 'staff3' },
    { name: 'Dr.Karavita', role: 'Surgeon', status: 'available', specialty: 'Neuro', id: 'staff4' },
    { name: 'Dr.Dilmith', role: 'Surgeon', status: 'busy', specialty: 'Cardiac', id: 'staff5' },
    { name: 'Dr.Inthusha', role: 'Surgeon', status: 'available', specialty: 'General', id: 'staff6' },
    { name: 'Dr.Herath', role: 'Surgeon', status: 'busy', specialty: 'Ortho', id: 'staff7' },
];

const SAMPLE_SURGERIES = [
    { id: 's1', time: '08:30', patient: 'John Cena', procedure: 'Hip Replacement', theatre: 'Theatre 2', surgeon: 'Dr.Johnson', status: 'scheduled' },
    { id: 's2', time: '10:30', patient: 'Sarah Connor', procedure: 'Cataract Surgery', theatre: 'Theatre 4', surgeon: 'Dr.Peter', status: 'scheduled' },
    { id: 's3', time: '11:00', patient: 'Martin Smith', procedure: 'Cardiac Bypass', theatre: 'Theatre 1', surgeon: 'Dr.Sam', status: 'scheduled' },
    { id: 's4', time: '14:00', patient: 'Kristina Rose', procedure: 'Appendectomy', theatre: 'Theatre 3', surgeon: 'Dr.Lee', status: 'scheduled' },
    { id: 's5', time: '16:30', patient: 'Jimmy Anderson', procedure: 'Gallbladder Removal', theatre: 'Theatre 2', surgeon: 'Dr.Gopal', status: 'scheduled' },
];

// Sample data for Weekly Surgery Chart
const WEEKLY_CHART_DATA = [
    { day: 'Mon', surgeries: 8 },
    { day: 'Tue', surgeries: 12 },
    { day: 'Wed', surgeries: 10 },
    { day: 'Thu', surgeries: 14 },
    { day: 'Fri', surgeries: 11 },
    { day: 'Sat', surgeries: 6 },
    { day: 'Sun', surgeries: 3 },
];

// Sample data for Recent Activity Feed
const SAMPLE_ACTIVITIES = [
    { id: 'a1', time: '08:30', action: 'Dr. Sam started Cardiac Bypass', type: 'start', color: 'bg-green-500' },
    { id: 'a2', time: '08:15', action: 'Theatre 2 prepared for Hip Replacement', type: 'prep', color: 'bg-yellow-500' },
    { id: 'a3', time: '07:45', action: 'Dr. Johnson arrived for morning rounds', type: 'info', color: 'bg-blue-500' },
    { id: 'a4', time: '07:30', action: 'Surgery schedule finalized for today', type: 'info', color: 'bg-indigo-500' },
    { id: 'a5', time: '07:00', action: 'Morning sterilization completed', type: 'complete', color: 'bg-emerald-500' },
];

// Sample alerts
const INITIAL_ALERTS = [
    { id: 'alert1', message: 'Theatre 3 maintenance scheduled for tomorrow 6:00 AM – 8:00 AM', type: 'warning' },
    { id: 'alert2', message: 'Dr. Perera\'s 14:30 surgery delayed by 30 mins due to prior case overrun', type: 'delay' },
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
// Helper: Estimated finish time
// ──────────────────────────────────────────────────────────────────────────────

const getEstFinish = (startTime, duration) => {
    if (!startTime || !duration) return null;
    const [h, m] = startTime.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + duration;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const d = new Date(2000, 0, 1, endH, endM);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Helper: Progress bar color
const getProgressColor = (progress) => {
    if (progress >= 90) return 'from-red-400 to-red-600';
    if (progress >= 70) return 'from-yellow-400 to-yellow-600';
    return 'from-green-400 to-green-600';
};

// Specialty tag colors
const SPECIALTY_COLORS = {
    Cardiac: 'bg-red-50 text-red-600 border-red-200',
    Ortho: 'bg-blue-50 text-blue-600 border-blue-200',
    General: 'bg-gray-100 text-gray-600 border-gray-200',
    Neuro: 'bg-purple-50 text-purple-600 border-purple-200',
};

// ──────────────────────────────────────────────────────────────────────────────
// Live Theatre Card (Enhanced)
// ──────────────────────────────────────────────────────────────────────────────

const LiveTheatreCard = ({ theatre, isExpanded, onToggle, isGrid }) => {
    const style = THEATRE_STATUS_STYLES[theatre.status] || THEATRE_STATUS_STYLES.available;
    const estFinish = getEstFinish(theatre.startTime, theatre.duration);

    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${isGrid ? 'p-4' : 'p-5'
                }`}
            onClick={onToggle}
        >
            <div className="flex items-start gap-3 mb-3">
                <TheatreIcon status={theatre.status} />
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-slate-100">{theatre.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        {/* Pulsing status dot */}
                        <span className="relative flex h-2.5 w-2.5">
                            {theatre.status === 'in-use' && (
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dotBg} opacity-75`} />
                            )}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${style.dotBg}`} />
                        </span>
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                            {style.label}
                        </span>
                    </div>
                </div>
            </div>

            {theatre.procedure && (
                <div className="mt-2 space-y-0.5">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{theatre.procedure}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Surgeon: {theatre.surgeon}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Started: {theatre.startTime}</p>
                    {estFinish && (
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Est. finish: {estFinish}</p>
                    )}
                </div>
            )}

            {theatre.status === 'in-use' && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-500 dark:text-slate-400">Progress</span>
                        <span className="font-semibold text-gray-700 dark:text-slate-300">{theatre.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${getProgressColor(theatre.progress)} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${theatre.progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-2 text-right">Duration: {theatre.duration} mins</p>
                </div>
            )}

            {theatre.status === 'preparing' && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-500 dark:text-slate-400">Progress</span>
                        <span className="font-semibold text-gray-700 dark:text-slate-300">0%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-200 dark:bg-slate-600 rounded-full" style={{ width: '0%' }} />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mt-2 text-right">Duration: {theatre.duration} mins</p>
                </div>
            )}

            {/* Expandable Details */}
            {isExpanded && theatre.procedure && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wider">Patient</p>
                            <p className="text-gray-800 dark:text-slate-200 font-medium">{theatre.patient || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wider">Anesthesiologist</p>
                            <p className="text-gray-800 dark:text-slate-200 font-medium">{theatre.anesthesiologist || 'N/A'}</p>
                        </div>
                    </div>
                    {theatre.preOpChecklist && (
                        <div>
                            <p className="text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wider mb-2">Pre-Op Checklist</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(theatre.preOpChecklist).map(([key, done]) => (
                                    <span
                                        key={key}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${done
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-50 text-gray-400 border-gray-200'
                                            }`}
                                    >
                                        {done ? '✓' : '○'} {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Staff Status Card (Enhanced)
// ──────────────────────────────────────────────────────────────────────────────

const StaffCard = ({ staff, navigate }) => {
    const style = STAFF_STATUS_STYLES[staff.status] || STAFF_STATUS_STYLES.available;
    const initials = staff.name.split('.').pop()?.charAt(0).toUpperCase() || staff.name.charAt(0).toUpperCase();
    const specialtyStyle = SPECIALTY_COLORS[staff.specialty] || SPECIALTY_COLORS.General;

    return (
        <div
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => navigate && navigate(`/staff/surgeons`)}
            title={`View ${staff.name}'s profile`}
        >
            {/* Avatar with initials */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-slate-100 truncate">{staff.name}</p>
                <p className="text-sm text-gray-400 dark:text-slate-500">{staff.role}</p>
                {staff.specialty && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${specialtyStyle}`}>
                        {staff.specialty}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Pulsing status dot */}
                <span className="relative flex h-2 w-2">
                    {staff.status === 'busy' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${staff.status === 'busy' ? 'bg-red-500' :
                        staff.status === 'available-soon' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                    {style.label}
                </span>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ──────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [surgeries, setSurgeries] = useState([]);
    const [liveSurgeries, setLiveSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [theatreView, setTheatreView] = useState('list'); // 'list' | 'grid'
    const [expandedTheatre, setExpandedTheatre] = useState(null);
    const [staffFilter, setStaffFilter] = useState('all'); // 'all' | 'busy' | 'available-soon' | 'available'
    const refreshTimerRef = useRef(null);

    // ── Auto-refresh every 60 seconds ──
    useEffect(() => {
        fetchDashboardData();
        refreshTimerRef.current = setInterval(() => {
            fetchDashboardData();
            setLastRefresh(new Date());
        }, 60000);
        return () => clearInterval(refreshTimerRef.current);
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

    // Filter surgeries by search query
    const filteredSurgeries = displaySurgeries.filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const patientName = (s.patient_name || s.patient || '').toLowerCase();
        const procedure = (s.surgery_type || s.procedure || '').toLowerCase();
        const surgeon = (s.surgeon?.name || s.surgeon_name || s.surgeon || '').toLowerCase();
        return patientName.includes(q) || procedure.includes(q) || surgeon.includes(q);
    });

    // Manual refresh handler
    const handleManualRefresh = () => {
        fetchDashboardData();
        setLastRefresh(new Date());
    };

    // Dismiss alert
    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
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
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-slate-400">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Error state
    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-600 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
                        <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
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
            <div className="min-h-screen">

                {/* ─── Welcome Greeting + Alerts ─── */}
                <div className="px-6 pt-5 pb-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Welcome back, {user?.name?.split(' ')[0] || 'Doctor'} 👋
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Here's what's happening in your theatres today</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 dark:text-slate-500">
                                Last updated: {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <button
                                onClick={handleManualRefresh}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-200 shadow-sm"
                                title="Refresh dashboard data"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Alerts Banner */}
                    {alerts.length > 0 && (
                        <div className="space-y-2">
                            {alerts.map(alert => (
                                <div
                                    key={alert.id}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm ${alert.type === 'delay'
                                        ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-800'
                                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{alert.type === 'delay' ? '⏰' : '⚠️'}</span>
                                        <span>{alert.message}</span>
                                    </div>
                                    <button
                                        onClick={() => dismissAlert(alert.id)}
                                        className="p-1 hover:bg-black/5 rounded-full transition-colors"
                                        aria-label="Dismiss alert"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Summary Header ─── */}
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm px-6 py-4 rounded-3xl mx-6 mb-8 mt-2" data-testid="dashboard-title">
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
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Surgeries</h2>
                            {/* Search Input */}
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by patient, procedure, or surgeon..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-400 w-72 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-blue-50 dark:bg-blue-900/30 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Procedure</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Theatre</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Surgeon</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                                    {upcomingSurgeries.length > 0 ? (
                                        filteredSurgeries.map((surgery, idx) => (
                                            <tr key={surgery.id || idx} className={`hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors duration-150 group ${idx % 2 === 1 ? 'bg-gray-50/50 dark:bg-slate-700/30' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                                        {formatTime(surgery.scheduled_time)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 dark:text-slate-300">
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
                                        filteredSurgeries.map((s, idx) => (
                                            <tr key={s.id || idx} className={`hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors duration-150 group ${idx % 2 === 1 ? 'bg-gray-50/50 dark:bg-slate-700/30' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{s.time}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 dark:text-slate-300">{s.patient}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 dark:text-slate-300">{s.procedure}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 dark:text-slate-300">{s.theatre}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 dark:text-slate-300">{s.surgeon}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        Scheduled
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="View" aria-label="View surgery">
                                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors" title="Edit" aria-label="Edit surgery">
                                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors" title="Delete" aria-label="Delete surgery">
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
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>🏥</span> Live Theatre Status
                                </h2>
                                {/* Grid / List Toggle */}
                                <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
                                    <button
                                        onClick={() => setTheatreView('list')}
                                        className={`p-1.5 rounded-md transition-all ${theatreView === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200'}`}
                                        title="List view"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setTheatreView('grid')}
                                        className={`p-1.5 rounded-md transition-all ${theatreView === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200'}`}
                                        title="Grid view"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {SAMPLE_THEATRES.length > 0 ? (
                                <div className={theatreView === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                                    {SAMPLE_THEATRES.map((theatre, idx) => (
                                        <LiveTheatreCard
                                            key={idx}
                                            theatre={theatre}
                                            isGrid={theatreView === 'grid'}
                                            isExpanded={expandedTheatre === idx}
                                            onToggle={() => setExpandedTheatre(expandedTheatre === idx ? null : idx)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-12 text-center">
                                    <div className="text-5xl mb-3">🏥</div>
                                    <p className="text-gray-500 dark:text-slate-400 font-medium">No theatres in use</p>
                                    <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">All theatres are currently available</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column – Staff Status (1/3 width) */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span>👥</span> Staff Status
                            </h2>

                            {/* Staff Count Summary Bar */}
                            {(() => {
                                const busyCount = SAMPLE_STAFF.filter(s => s.status === 'busy').length;
                                const soonCount = SAMPLE_STAFF.filter(s => s.status === 'available-soon').length;
                                const availCount = SAMPLE_STAFF.filter(s => s.status === 'available').length;
                                const total = SAMPLE_STAFF.length;
                                return (
                                    <div className="mb-3">
                                        <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                            <div className="bg-red-400" style={{ width: `${(busyCount / total) * 100}%` }} />
                                            <div className="bg-yellow-400" style={{ width: `${(soonCount / total) * 100}%` }} />
                                            <div className="bg-green-400" style={{ width: `${(availCount / total) * 100}%` }} />
                                        </div>
                                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> {busyCount} Busy</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> {soonCount} Soon</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> {availCount} Available</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Staff Filter Tabs */}
                            <div className="flex gap-1 mb-3 flex-wrap">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'busy', label: 'Busy' },
                                    { key: 'available-soon', label: 'Soon' },
                                    { key: 'available', label: 'Available' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setStaffFilter(tab.key)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${staffFilter === tab.key
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Staff Cards */}
                            {(() => {
                                const filtered = staffFilter === 'all'
                                    ? SAMPLE_STAFF
                                    : SAMPLE_STAFF.filter(s => s.status === staffFilter);
                                return filtered.length > 0 ? (
                                    <div className="space-y-3">
                                        {filtered.map((staff, idx) => (
                                            <StaffCard key={staff.id || idx} staff={staff} navigate={navigate} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-8 text-center">
                                        <div className="text-4xl mb-2">👥</div>
                                        <p className="text-gray-500 dark:text-slate-400 font-medium text-sm">No staff found</p>
                                        <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">Try a different filter</p>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* ─── Third Section: Weekly Chart + Activity Feed ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Weekly Surgery Chart (2/3 width) */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Surgeries This Week</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={WEEKLY_CHART_DATA} barCategoryGap="20%">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="day" tick={{ fontSize: 13, fill: '#6b7280' }} />
                                        <YAxis tick={{ fontSize: 13, fill: '#6b7280' }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            }}
                                        />
                                        <Bar
                                            dataKey="surgeries"
                                            fill="url(#blueGradient)"
                                            radius={[6, 6, 0, 0]}
                                        />
                                        <defs>
                                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity Feed (1/3 width) */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {SAMPLE_ACTIVITIES.map((activity) => (
                                    <div key={activity.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${activity.color} flex-shrink-0 mt-1`} />
                                            <div className="w-0.5 flex-1 bg-gray-100 dark:bg-slate-700 mt-1" />
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{activity.action}</p>
                                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
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
