// ============================================================================
// Live Status Page
// ============================================================================
// Created by: M3 (Janani) - Day 11
//
// A real-time theatre monitoring dashboard that auto-refreshes every 30 s
// using the usePolling hook and the lightweight /api/theatres/live-status
// endpoint. Shows all active theatres with their status, current surgery,
// and auto-calculated progress at a glance.
//
// Features:
//   - 30-second auto-polling with pause/resume controls
//   - Manual refresh button
//   - "Last updated" timestamp
//   - Summary stat cards (available / in-use / maintenance / cleaning / overdue)
//   - Colour-coded theatre tiles with live progress bars
//   - Click-through to theatre detail page
// ============================================================================

import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    MapPin,
    Monitor,
    Pause,
    Play,
    RefreshCw,
    Timer,
    Zap
} from 'lucide-react';
import Layout from '../components/Layout';
import theatreService from '../services/theatreService';
import usePolling from '../hooks/usePolling';
import TheatreStatusBadge from '../components/TheatreStatusBadge';

// ── Polling interval (30 seconds) ───────────────────────────────────────────

const POLL_INTERVAL = 30_000;

// ── Helper: format minutes → "1h 23m" / "45m" ──────────────────────────────

const fmtMin = (m) => {
    if (!m || m <= 0) return '0m';
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h > 0 && r > 0) return `${h}h ${r}m`;
    return h > 0 ? `${h}h` : `${r}m`;
};

// ── Progress-colour helpers ─────────────────────────────────────────────────

const barColor = (v) => {
    if (v < 25) return 'bg-red-500';
    if (v < 50) return 'bg-amber-500';
    if (v < 75) return 'bg-blue-500';
    return 'bg-emerald-500';
};
const barBg = (v) => {
    if (v < 25) return 'bg-red-100';
    if (v < 50) return 'bg-amber-100';
    if (v < 75) return 'bg-blue-100';
    return 'bg-emerald-100';
};
const txtColor = (v) => {
    if (v < 25) return 'text-red-600';
    if (v < 50) return 'text-amber-600';
    if (v < 75) return 'text-blue-600';
    return 'text-emerald-600';
};

// ── Status border colours (left accent) ─────────────────────────────────────

const STATUS_BORDER = {
    available: 'border-l-emerald-500',
    in_use: 'border-l-blue-500',
    maintenance: 'border-l-amber-500',
    cleaning: 'border-l-purple-500'
};

// ── Summary card config ─────────────────────────────────────────────────────

const summaryCards = (s) => [
    { label: 'Available', value: s.available, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'In Use', value: s.in_use, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Maintenance', value: s.maintenance, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Cleaning', value: s.cleaning, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Overdue', value: s.overdue, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
];

// ── Component ───────────────────────────────────────────────────────────────

const LiveStatusPage = () => {
    // Fetch function for the polling hook
    const fetchLiveStatus = useCallback(async () => {
        const [liveResponse, statsResponse] = await Promise.all([
            theatreService.getLiveStatus(),
            theatreService.getTheatreStats()
        ]);
        return {
            ...liveResponse,
            stats: statsResponse.data
        };
    }, []);

    const {
        data: response,
        loading,
        error,
        lastPolledAt,
        refresh,
        pause,
        resume,
        paused
    } = usePolling(fetchLiveStatus, { interval: POLL_INTERVAL });

    const theatres = response?.data ?? [];
    const summary = response?.summary ?? { total: 0, available: 0, in_use: 0, maintenance: 0, cleaning: 0, overdue: 0 };
    const extendedStats = response?.stats;

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* ── Page Header ─────────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Live Theatre Status</h1>
                                <p className="text-sm text-gray-500">
                                    Auto-refreshes every {POLL_INTERVAL / 1000}s
                                    {lastPolledAt && (
                                        <span className="ml-2 text-gray-400">
                                            &middot; Last updated {lastPolledAt.toLocaleTimeString()}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={refresh}
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>

                            <button
                                onClick={paused ? resume : pause}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${paused
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    }`}
                            >
                                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                {paused ? 'Resume' : 'Pause'}
                            </button>

                            {paused && (
                                <span className="text-xs text-amber-600 font-medium">Polling paused</span>
                            )}
                        </div>
                    </div>

                    {/* ── Summary Cards ───────────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                        {summaryCards(summary).map((card) => (
                            <div
                                key={card.label}
                                className={`${card.bg} border ${card.border} rounded-3xl p-4 text-center`}
                            >
                                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Extended Stats (M5 Day 11) ─────────────────────────── */}
                    {extendedStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Timer className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Current Utilization Rate</p>
                                        <p className="text-xs text-gray-500">Based on {extendedStats.total_theatres} active theatres</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">{extendedStats.utilization.utilization_rate}%</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Avg. Surgery Progress</p>
                                        <p className="text-xs text-gray-500">Across all in-progress procedures</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-emerald-600">{extendedStats.average_surgery_progress}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Loading State ───────────────────────────────────────── */}
                    {loading && !response && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                        </div>
                    )}

                    {/* ── Error State ─────────────────────────────────────────── */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-700">Polling Error</p>
                                <p className="text-xs text-red-600">{error}</p>
                            </div>
                            <button onClick={refresh} className="ml-auto text-xs text-red-700 underline hover:text-red-900">
                                Retry
                            </button>
                        </div>
                    )}

                    {/* ── Theatre Grid ────────────────────────────────────────── */}
                    {theatres.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {theatres.map((theatre) => {
                                const s = theatre.current_surgery;
                                const border = STATUS_BORDER[theatre.status] || 'border-l-gray-300';

                                return (
                                    <Link
                                        key={theatre.id}
                                        to={`/theatres/${theatre.id}`}
                                        className={`bg-white rounded-xl border border-gray-200 border-l-4 ${border} shadow-sm hover:shadow-md transition-shadow p-5 block`}
                                    >
                                        {/* Theatre header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{theatre.name}</h3>
                                                {theatre.location && (
                                                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                        <MapPin className="w-3 h-3" /> {theatre.location}
                                                    </p>
                                                )}
                                            </div>
                                            <TheatreStatusBadge status={theatre.status} size="sm" />
                                        </div>

                                        {/* Theatre type */}
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                                            <Monitor className="w-3.5 h-3.5 text-gray-400" />
                                            {theatre.theatre_type?.replace('_', ' ') || 'General'}
                                        </div>

                                        {/* Current surgery (if any) */}
                                        {s ? (
                                            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
                                                    <Activity className="w-3.5 h-3.5" />
                                                    Surgery In Progress
                                                </div>
                                                <p className="text-sm font-medium text-blue-800">{s.surgery_type}</p>
                                                <p className="text-xs text-blue-600">Patient: {s.patient_name || 'N/A'}</p>

                                                {/* Progress bar */}
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] text-gray-500">Progress</span>
                                                        <div className="flex items-center gap-1.5">
                                                            {s.is_overdue && (
                                                                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-600">
                                                                    <AlertTriangle className="w-3 h-3" /> Overdue
                                                                </span>
                                                            )}
                                                            {s.auto_progress === 100 && !s.is_overdue && (
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                            )}
                                                            <span className={`text-xs font-bold ${txtColor(s.auto_progress)}`}>
                                                                {s.auto_progress}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`w-full h-1.5 ${barBg(s.auto_progress)} rounded-full overflow-hidden`}>
                                                        <div
                                                            className={`h-full ${barColor(s.auto_progress)} rounded-full transition-all duration-500`}
                                                            style={{ width: `${s.auto_progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Time info */}
                                                <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                                                    <span className="flex items-center gap-0.5">
                                                        <Timer className="w-3 h-3" /> {fmtMin(s.elapsed_minutes)} elapsed
                                                    </span>
                                                    <span className="flex items-center gap-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {s.is_overdue
                                                            ? `+${fmtMin(s.elapsed_minutes - s.duration_minutes)} over`
                                                            : `${fmtMin(s.remaining_minutes)} left`
                                                        }
                                                    </span>
                                                </div>
                                                {s.estimated_end_time && (
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        Est. end: {s.estimated_end_time}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            /* No current surgery */
                                            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center text-xs text-gray-400">
                                                No surgery in progress
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Empty State ─────────────────────────────────────────── */}
                    {!loading && theatres.length === 0 && !error && (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-700">No Active Theatres</h3>
                            <p className="text-sm text-gray-500 mt-1">No active theatres found in the system.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default LiveStatusPage;
