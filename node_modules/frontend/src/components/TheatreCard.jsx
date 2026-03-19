// ============================================================================
// Theatre Card Component
// ============================================================================
// Created by: M1 (Pasindu) - Day 10
// Updated by: M1 (Pasindu) - Day 11 (Added surgery progress display)
// Updated by: M4 (Oneli)   - Day 11 (Added duration display)
// Updated by: M4 (Oneli)   - Day 12 (Added maintenance toggle)
//
// Displays a single theatre in a card format with:
// - Theatre name, location, type
// - Status badge with colour coding
// - Current surgery info with progress (if in_use)
// - Status toggle buttons (for coordinators/admins)
//
// Props:
//   theatre     - Theatre object from the API
//   onStatusChange - Callback(theatreId, newStatus) for toggling status
//   userRole    - Current user's role (for showing status toggle)
//   isUpdating  - Whether this theatre's status is currently being updated
// ============================================================================

import { Link } from 'react-router-dom';
import { MapPin, Monitor, Users, Wrench, ChevronRight } from 'lucide-react';
import TheatreStatusBadge, { THEATRE_TYPE_LABELS } from './TheatreStatusBadge';
import CurrentSurgeryDisplay from './CurrentSurgeryDisplay';
import DurationDisplay from './DurationDisplay';
import MaintenanceToggle from './MaintenanceToggle';

// Status action buttons config
const STATUS_ACTIONS = {
    available: [
        { label: 'Start Surgery', status: 'in_use', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
        { label: 'Maintenance', status: 'maintenance', color: 'bg-amber-500 hover:bg-amber-600 text-white' }
    ],
    in_use: [
        { label: 'Mark Available', status: 'available', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
        { label: 'Cleaning', status: 'cleaning', color: 'bg-purple-500 hover:bg-purple-600 text-white' }
    ],
    maintenance: [
        { label: 'Mark Available', status: 'available', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' }
    ],
    cleaning: [
        { label: 'Mark Available', status: 'available', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' }
    ]
};

// Status card border color
const STATUS_BORDER = {
    available: 'border-l-emerald-500',
    in_use: 'border-l-blue-500',
    maintenance: 'border-l-amber-500',
    cleaning: 'border-l-purple-500'
};

const TheatreCard = ({ theatre, onStatusChange, onMaintenanceToggle, userRole, isUpdating = false }) => {
    const canChangeStatus = userRole === 'coordinator' || userRole === 'admin';
    const actions = STATUS_ACTIONS[theatre.status] || [];
    const borderColor = STATUS_BORDER[theatre.status] || 'border-l-gray-300';

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
            {/* Card Header */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <Link to={`/theatres/${theatre.id}`} className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {theatre.name}
                        </Link>
                        {theatre.location && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{theatre.location}</span>
                            </div>
                        )}
                    </div>
                    <TheatreStatusBadge status={theatre.status} size="md" />
                </div>

                {/* Theatre Info */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Monitor className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span>{THEATRE_TYPE_LABELS[theatre.theatre_type] || theatre.theatre_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Users className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span>Capacity: {theatre.capacity}</span>
                    </div>
                    {theatre.equipment && (
                        <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                            <Wrench className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                            <span className="truncate">{theatre.equipment}</span>
                        </div>
                    )}
                </div>

                {/* Current Surgery Info component - M5 Day 10 */}
                {/* Updated by M1 - Day 11: Added progress tracking */}
                {/* Updated by M2 - Day 11: Added scheduled_time for auto-progress */}
                {theatre.current_surgery_id && (
                    <>
                        <CurrentSurgeryDisplay
                            surgery={{
                                id: theatre.current_surgery_id,
                                surgery_type: theatre.current_surgery_type,
                                patient_name: theatre.current_patient_name,
                                duration_minutes: theatre.current_surgery_duration,
                                progress_percent: theatre.current_surgery_progress,
                                scheduled_time: theatre.current_surgery_time
                            }}
                            variant="compact"
                        />
                        {/* Duration Display - M4 (Oneli) Day 11 */}
                        <DurationDisplay
                            scheduledTime={theatre.current_surgery_time}
                            durationMinutes={theatre.current_surgery_duration}
                            variant="compact"
                        />
                    </>
                )}

                {/* View Details Link - M2 Day 10 */}
                <Link
                    to={`/theatres/${theatre.id}`}
                    className="mt-4 flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors"
                >
                    View Details <ChevronRight className="w-4 h-4" />
                </Link>

                {/* Maintenance Toggle - M4 (Oneli) Day 12 */}
                <MaintenanceToggle
                    theatre={theatre}
                    onMaintenanceToggle={onMaintenanceToggle}
                    userRole={userRole}
                    isUpdating={isUpdating}
                />
            </div>

            {/* Status Toggle Actions */}
            {canChangeStatus && actions.length > 0 && (
                <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-3 bg-gray-50 dark:bg-slate-700/60 flex gap-2">
                    {actions.map(action => (
                        <button
                            key={action.status}
                            onClick={() => onStatusChange(theatre.id, action.status)}
                            disabled={isUpdating}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${action.color} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TheatreCard;
