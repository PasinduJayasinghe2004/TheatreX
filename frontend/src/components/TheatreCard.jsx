// ============================================================================
// Theatre Card Component
// ============================================================================
// Created by: M1 (Pasindu) - Day 10
//
// Displays a single theatre in a card format with:
// - Theatre name, location, type
// - Status badge with colour coding
// - Current surgery info (if in_use)
// - Status toggle buttons (for coordinators/admins)
//
// Props:
//   theatre     - Theatre object from the API
//   onStatusChange - Callback(theatreId, newStatus) for toggling status
//   userRole    - Current user's role (for showing status toggle)
// ============================================================================

import { MapPin, Monitor, Users, Wrench, Activity } from 'lucide-react';
import TheatreStatusBadge, { THEATRE_TYPE_LABELS } from './TheatreStatusBadge';

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

const TheatreCard = ({ theatre, onStatusChange, userRole }) => {
    const canChangeStatus = userRole === 'coordinator' || userRole === 'admin';
    const actions = STATUS_ACTIONS[theatre.status] || [];
    const borderColor = STATUS_BORDER[theatre.status] || 'border-l-gray-300';

    return (
        <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
            {/* Card Header */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{theatre.name}</h3>
                        {theatre.location && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{theatre.location}</span>
                            </div>
                        )}
                    </div>
                    <TheatreStatusBadge status={theatre.status} size="md" />
                </div>

                {/* Theatre Info */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <span>{THEATRE_TYPE_LABELS[theatre.theatre_type] || theatre.theatre_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>Capacity: {theatre.capacity}</span>
                    </div>
                    {theatre.equipment && (
                        <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                            <Wrench className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{theatre.equipment}</span>
                        </div>
                    )}
                </div>

                {/* Current Surgery Info */}
                {theatre.current_surgery_id && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
                            <Activity className="w-4 h-4" />
                            Surgery In Progress
                        </div>
                        <p className="text-sm text-blue-600">
                            {theatre.current_surgery_type} — {theatre.current_patient_name}
                        </p>
                        {theatre.current_surgery_duration && (
                            <p className="text-xs text-blue-500 mt-1">
                                Duration: {theatre.current_surgery_duration} min
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Status Toggle Actions */}
            {canChangeStatus && actions.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex gap-2">
                    {actions.map(action => (
                        <button
                            key={action.status}
                            onClick={() => onStatusChange(theatre.id, action.status)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${action.color}`}
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
