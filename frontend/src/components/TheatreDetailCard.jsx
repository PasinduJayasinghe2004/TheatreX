// ============================================================================
// Theatre Detail Card Component
// ============================================================================
// Created by: M2 (Chandeepa) - Day 10
// Updated by: M4 (Oneli)     - Day 10 (Status toggle buttons)
// Updated by: M1 (Pasindu)   - Day 11 (Progress slider integration)
//
// Rich detail card for a single theatre that displays:
// - Theatre metadata (name, location, type, capacity, equipment)
// - Status badge with colour coding
// - Status toggle buttons (coordinator / admin only)
// - Current in-progress surgery info with progress slider
// - Upcoming scheduled surgeries (next 7 days)
// - Recent surgery history (last 7 days)
// - Quick stats (completed, cancelled this week, upcoming total)
//
// Props:
//   theatre          - Full theatre detail object from GET /api/theatres/:id
//   onStatusChange   - Callback(theatreId, newStatus) for toggling status
//   onProgressChange - Callback(progress) for updating surgery progress (Day 11)
//   userRole         - Current user's role (for showing status toggle)
//   isUpdating       - Whether this theatre's status is currently being updated
//   isProgressUpdating - Whether progress is currently being updated (Day 11)
// ============================================================================

import { Link } from 'react-router-dom';
import {
    MapPin,
    Monitor,
    Users,
    Wrench,
    Activity,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    BarChart3,
    AlertTriangle
} from 'lucide-react';
import TheatreStatusBadge, { THEATRE_TYPE_LABELS } from './TheatreStatusBadge';
import { getAllowedTransitions, getStatusLabel } from '../utils/theatreStatusColors';
import CurrentSurgeryDisplay from './CurrentSurgeryDisplay';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Format an ISO / YYYY-MM-DD date string into a short readable date */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

/** Format a TIME (HH:mm:ss) or ISO string into HH:mm AM/PM */
const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    if (timeString.includes('T')) {
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    const [h, m] = timeString.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
};

/** Priority badge classes */
const getPriorityStyle = (priority) => {
    switch (priority) {
        case 'emergency':
            return 'bg-red-100 text-red-700';
        case 'urgent':
            return 'bg-orange-100 text-orange-700';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

// ── Status color for the top banner ────────────────────────────────────────

const STATUS_BG = {
    available: 'from-emerald-500 to-emerald-600',
    in_use: 'from-blue-500 to-blue-600',
    maintenance: 'from-amber-500 to-amber-600',
    cleaning: 'from-purple-500 to-purple-600'
};

// ── Status action button styles (M4 - Oneli - Day 10) ──────────────────────

const STATUS_ACTION_STYLES = {
    available: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    in_use: 'bg-blue-600 hover:bg-blue-700 text-white',
    maintenance: 'bg-amber-500 hover:bg-amber-600 text-white',
    cleaning: 'bg-purple-500 hover:bg-purple-600 text-white'
};

// ── Component ───────────────────────────────────────────────────────────────

const TheatreDetailCard = ({ theatre, onStatusChange, onProgressChange, userRole, isUpdating = false, isProgressUpdating = false }) => {
    if (!theatre) return null;

    const bgGradient = STATUS_BG[theatre.status] || 'from-gray-500 to-gray-600';
    const upcoming = theatre.upcoming_surgeries || [];
    const history = theatre.surgery_history || [];
    const stats = theatre.stats || {};

    // Status toggle (M4 - Oneli - Day 10)
    const canChangeStatus = userRole === 'coordinator' || userRole === 'admin';
    const allowedTransitions = getAllowedTransitions(theatre.status);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* ── Colour Banner ─────────────────────────────────────────── */}
            <div className={`bg-gradient-to-r ${bgGradient} px-6 py-5 text-white`}>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{theatre.name}</h2>
                        {theatre.location && (
                            <div className="flex items-center gap-1.5 mt-1 text-white/80 text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>{theatre.location}</span>
                            </div>
                        )}
                    </div>
                    <TheatreStatusBadge status={theatre.status} size="md" />
                </div>
            </div>

            {/* ── Status Toggle Buttons (M4 - Oneli - Day 10) ─────────── */}
            {canChangeStatus && allowedTransitions.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Change Status:</span>
                    <div className="flex gap-2">
                        {allowedTransitions.map(nextStatus => (
                            <button
                                key={nextStatus}
                                onClick={() => onStatusChange(theatre.id, nextStatus)}
                                disabled={isUpdating}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                    ${STATUS_ACTION_STYLES[nextStatus] || 'bg-gray-500 hover:bg-gray-600 text-white'}
                                    ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {getStatusLabel(nextStatus)}
                            </button>
                        ))}
                    </div>
                    {isUpdating && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2" />
                    )}
                </div>
            )}

            <div className="p-6 space-y-6">
                {/* ── Theatre Info Grid ─────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2.5 text-sm">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Type</p>
                            <p className="font-medium text-gray-900">
                                {THEATRE_TYPE_LABELS[theatre.theatre_type] || theatre.theatre_type}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Users className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Capacity</p>
                            <p className="font-medium text-gray-900">{theatre.capacity}</p>
                        </div>
                    </div>
                    {theatre.equipment && (
                        <div className="col-span-2 flex items-center gap-2.5 text-sm">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Wrench className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Equipment</p>
                                <p className="font-medium text-gray-900 truncate max-w-xs">
                                    {theatre.equipment}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Quick Stats ───────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-700">{stats.completed_this_week || 0}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">Completed (7d)</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-700">{stats.cancelled_this_week || 0}</p>
                        <p className="text-xs text-red-600 mt-0.5">Cancelled (7d)</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-700">{stats.upcoming_total || 0}</p>
                        <p className="text-xs text-blue-600 mt-0.5">Upcoming</p>
                    </div>
                </div>

                {/* Current Surgery Info component - M5 Day 10 */}
                {/* Updated by M1 - Day 11: Added interactive progress slider */}
                {/* Updated by M2 - Day 11: Added scheduled_time for auto-progress bar */}
                {theatre.current_surgery_id && (
                    <CurrentSurgeryDisplay
                        surgery={{
                            id: theatre.current_surgery_id,
                            surgery_type: theatre.current_surgery_type,
                            patient_name: theatre.current_patient_name || 'N/A',
                            duration_minutes: theatre.current_surgery_duration,
                            progress_percent: theatre.current_surgery_progress,
                            scheduled_time: theatre.current_surgery_time
                        }}
                        variant="full"
                        canEditProgress={canChangeStatus}
                        onProgressChange={onProgressChange}
                        isUpdating={isProgressUpdating}
                    />
                )}

                {/* ── Upcoming Surgeries ────────────────────────────────── */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-700">
                            Upcoming Surgeries
                        </h3>
                        <span className="text-xs text-gray-400 ml-1">(next 7 days)</span>
                    </div>

                    {upcoming.length === 0 ? (
                        <p className="text-sm text-gray-400 italic pl-6">
                            No upcoming surgeries scheduled.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {upcoming.map(s => (
                                <Link
                                    key={s.id}
                                    to={`/surgeries/${s.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {s.surgery_type}
                                            </p>
                                            {s.priority !== 'routine' && (
                                                <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${getPriorityStyle(s.priority)}`}>
                                                    {s.priority?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {s.patient_name || 'Unknown'} • {s.duration_minutes} min
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0 ml-3">
                                        <span>{formatDate(s.scheduled_date)}</span>
                                        <span>{formatTime(s.scheduled_time)}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Surgery History ───────────────────────────────────── */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-700">
                            Recent History
                        </h3>
                        <span className="text-xs text-gray-400 ml-1">(last 7 days)</span>
                    </div>

                    {history.length === 0 ? (
                        <p className="text-sm text-gray-400 italic pl-6">
                            No recent surgery history.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {history.map(s => (
                                <Link
                                    key={s.id}
                                    to={`/surgeries/${s.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {s.status === 'completed' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {s.surgery_type}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {s.patient_name || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0 ml-3">
                                        <span>{formatDate(s.scheduled_date)}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TheatreDetailCard;
