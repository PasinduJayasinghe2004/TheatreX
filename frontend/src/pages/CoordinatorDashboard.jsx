// ============================================================================
// Coordinator Dashboard Page
// ============================================================================
// Created by: M1 (Pasindu) - Day 12
// Updated by: M3 (Janani) - Day 12 (Added theatre assignment dropdown)
//
// Coordinator-specific mission-control view of all theatres.
// Fetches from GET /api/theatres/coordinator-overview and renders:
//   - Summary cards (total, available, in_use, maintenance, utilization, overdue)
//   - Theatre grid: status badge, current surgery, auto-progress bar, quick links
//
// Route: /coordinator  (coordinator + admin only)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import TheatreAssignmentDropdown from '../components/TheatreAssignmentDropdown';
import theatreService from '../services/theatreService';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    available: { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', card: 'border-l-emerald-400' },
    in_use: { label: 'In Use', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', card: 'border-l-blue-400' },
    maintenance: { label: 'Maintenance', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', card: 'border-l-amber-400' },
    cleaning: { label: 'Cleaning', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', card: 'border-l-purple-400' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
        const date = new Date(`2000-01-01T${timeStr}`);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
        return timeStr;
    }
};

const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
};

// Summary Card is now imported from ../components/SummaryCard

// ─────────────────────────────────────────────────────────────────────────────
// Theatre Card
// ─────────────────────────────────────────────────────────────────────────────

const TheatreCard = ({ theatre, onViewDetail, onViewLive, onQuickStatus, onAssignSurgery, showAssignment, onCloseAssignment, onAssigned }) => {
    const { id, name, location, status, theatre_type, capacity, current_surgery } = theatre;
    const cardBorderClass = STATUS_CONFIG[status]?.card || 'border-l-gray-200';

    const progressPercent = current_surgery?.auto_progress ?? current_surgery?.manual_progress ?? 0;
    const isOverdue = current_surgery?.is_overdue;

    const progressBarColour = isOverdue
        ? 'bg-red-500'
        : progressPercent >= 75
            ? 'bg-amber-500'
            : 'bg-blue-500';

    // Logically relevant quick actions based on status
    const quickActions = [];
    if (status === 'available') {
        quickActions.push({ label: 'Maintenance', target: 'maintenance', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' });
    } else if (status === 'maintenance' || status === 'cleaning') {
        quickActions.push({ label: 'Set Available', target: 'available', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' });
    } else if (status === 'in_use') {
        quickActions.push({ label: 'Complete & Clean', target: 'cleaning', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' });
    }

    // Show "Assign Surgery" button for available theatres without a current surgery
    const canAssign = (status === 'available' || (status !== 'maintenance' && !current_surgery));

    return (
        <div
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow border-l-4 ${cardBorderClass} flex flex-col`}
        >
            {/* Card Header */}
            <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-base">{name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {theatre_type ? theatre_type.charAt(0).toUpperCase() + theatre_type.slice(1) : 'General'}
                            {location && ` · ${location}`}
                            {capacity && ` · Cap: ${capacity}`}
                        </p>
                    </div>
                    <StatusBadge status={status} />
                </div>

                {/* Current Surgery */}
                {current_surgery ? (
                    <div className="mt-4 space-y-3">
                        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {current_surgery.surgery_type || 'Surgery'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                Patient: {current_surgery.patient_name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Started: {formatTime(current_surgery.scheduled_time)}
                                &nbsp;·&nbsp;Duration: {current_surgery.duration_minutes}min
                            </p>
                            {current_surgery.priority === 'emergency' && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 mt-1">
                                    🚨 Emergency
                                </span>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500">
                                    {isOverdue
                                        ? `Overdue by ${formatMinutes(current_surgery.elapsed_minutes - current_surgery.duration_minutes)}`
                                        : `${formatMinutes(current_surgery.elapsed_minutes)} elapsed · ${formatMinutes(current_surgery.remaining_minutes)} left`
                                    }
                                </span>
                                <span className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                                    {progressPercent}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${progressBarColour}`}
                                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                />
                            </div>
                            {current_surgery.estimated_end_time && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Est. end: {formatTime(current_surgery.estimated_end_time)}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        No active surgery
                    </div>
                )}
            </div>

            {/* Quick Actions (Dashboard Enhancement) */}
            {(quickActions.length > 0 || canAssign) && (
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Toggle</p>
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map(action => (
                            <button
                                key={action.target}
                                onClick={() => onQuickStatus(id, action.target)}
                                className={`flex-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98] ${action.color}`}
                            >
                                {action.label}
                            </button>
                        ))}
                        {canAssign && (
                            <button
                                onClick={() => onAssignSurgery(id)}
                                className="flex-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                            >
                                Assign Surgery
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Theatre Assignment Dropdown (M3 - Day 12) */}
            {showAssignment && (
                <div className="px-4 pb-4">
                    <TheatreAssignmentDropdown
                        theatre={theatre}
                        onAssigned={onAssigned}
                        onClose={onCloseAssignment}
                    />
                </div>
            )}

            {/* Card Footer Actions */}
            <div className="px-5 pb-4 flex gap-2 border-t border-gray-50 pt-3">
                <button
                    onClick={() => onViewDetail(id)}
                    className="flex-1 text-xs font-medium px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                    View Detail
                </button>
                <button
                    onClick={onViewLive}
                    className="flex-1 text-xs font-medium px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    Live Status
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const CoordinatorDashboard = () => {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Status filter: null = show all
    const [statusFilter, setStatusFilter] = useState(null);

    // Assignment dropdown state - M3 Day 12
    const [assignmentTheatreId, setAssignmentTheatreId] = useState(null);

    const fetchOverview = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const data = await theatreService.getCoordinatorOverview();
            setOverview(data);
            setLastRefresh(new Date());
        } catch (err) {
            setError(err.message || 'Failed to load coordinator overview');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    const handleQuickStatusUpdate = async (id, status) => {
        try {
            setRefreshing(true);
            await theatreService.quickUpdateStatus(id, status);
            await fetchOverview(true);
        } catch (err) {
            alert(err.message || 'Failed to update theatre status');
        } finally {
            setRefreshing(false);
        }
    };

    // ── Derived data ──────────────────────────────────────────────────────────
    const summary = overview?.summary ?? {};
    const theatres = overview?.data ?? [];

    const filteredTheatres = statusFilter
        ? theatres.filter(t => t.status === statusFilter)
        : theatres;

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-4 text-gray-500">Loading coordinator overview…</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load</h2>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={() => fetchOverview()}
                            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">

                {/* Page Header */}
                <div className="bg-white border border-gray-100 px-8 py-5 rounded-3xl mx-8 mt-6 mb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                All-theatre overview &amp; real-time surgery monitoring
                                {lastRefresh && (
                                    <span className="ml-2 text-gray-400">
                                        · Last updated {lastRefresh.toLocaleTimeString()}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/live-status')}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Live Status
                            </button>
                            <button
                                onClick={() => fetchOverview(true)}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                                <svg
                                    className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {refreshing ? 'Refreshing…' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <SummaryCard
                            label="Total Theatres"
                            value={summary.total ?? '--'}
                            colour="bg-gray-100"
                            icon={
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            }
                        />
                        <SummaryCard
                            label="Available"
                            value={summary.available ?? '--'}
                            colour="bg-emerald-100"
                            icon={
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                        />
                        <SummaryCard
                            label="In Use"
                            value={summary.in_use ?? '--'}
                            colour="bg-blue-100"
                            icon={
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            }
                        />
                        <SummaryCard
                            label="Maintenance"
                            value={summary.maintenance ?? '--'}
                            colour="bg-amber-100"
                            icon={
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                </svg>
                            }
                        />
                        <SummaryCard
                            label="Utilization"
                            value={`${summary.utilization_rate ?? 0}%`}
                            colour="bg-indigo-100"
                            icon={
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                        />
                        <SummaryCard
                            label="Overdue"
                            value={summary.overdue_count ?? 0}
                            colour={summary.overdue_count > 0 ? 'bg-red-100' : 'bg-gray-100'}
                            icon={
                                <svg
                                    className={`w-6 h-6 ${summary.overdue_count > 0 ? 'text-red-600' : 'text-gray-400'}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Filter Bar */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-500 mr-2">Filter:</span>
                        {[null, 'available', 'in_use', 'maintenance', 'cleaning'].map(s => {
                            const label = s === null ? 'All' : STATUS_CONFIG[s]?.label ?? s;
                            const active = statusFilter === s;
                            return (
                                <button
                                    key={s ?? 'all'}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {label}
                                    {s !== null && ` (${theatres.filter(t => t.status === s).length})`}
                                    {s === null && ` (${theatres.length})`}
                                </button>
                            );
                        })}
                    </div>

                    {/* Theatre Grid */}
                    {filteredTheatres.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-sm">No theatres match this filter</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredTheatres.map(theatre => (
                                <TheatreCard
                                    key={theatre.id}
                                    theatre={theatre}
                                    onViewDetail={(id) => navigate(`/theatres/${id}`)}
                                    onViewLive={() => navigate('/live-status')}
                                    onQuickStatus={handleQuickStatusUpdate}
                                    onAssignSurgery={(id) => setAssignmentTheatreId(prev => prev === id ? null : id)}
                                    showAssignment={assignmentTheatreId === theatre.id}
                                    onCloseAssignment={() => setAssignmentTheatreId(null)}
                                    onAssigned={() => { setAssignmentTheatreId(null); fetchOverview(true); }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Quick Actions Footer */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/surgeries/new')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Surgery
                            </button>
                            <button
                                onClick={() => navigate('/emergency')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Emergency
                            </button>
                            <button
                                onClick={() => navigate('/theatres')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                All Theatres
                            </button>
                            <button
                                onClick={() => navigate('/calendar')}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Calendar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CoordinatorDashboard;
