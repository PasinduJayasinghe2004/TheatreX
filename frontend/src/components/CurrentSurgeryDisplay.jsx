// ============================================================================
// Current Surgery Display Component
// ============================================================================
// Created by: M5 (Inthusha) - Day 10
//
// A reusable component to display details of a surgery currently in progress.
// Used in TheatreCard and TheatreDetailCard.
//
// Props:
//   surgery - Object containing current surgery details:
//             { id, surgery_type, patient_name, duration_minutes }
//   variant - 'compact' (for cards) or 'full' (for detail views)
// ============================================================================

import { Link } from 'react-router-dom';
import { Activity, Clock, ChevronRight } from 'lucide-react';

const CurrentSurgeryDisplay = ({ surgery, variant = 'compact' }) => {
    if (!surgery) return null;

    const isCompact = variant === 'compact';

    return (
        <div className={`rounded-xl border ${isCompact
                ? 'mt-4 p-3 bg-blue-50 border-blue-100'
                : 'p-4 bg-blue-50 border-blue-100 mb-6'
            }`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <Activity className="w-4 h-4" />
                    Surgery In Progress
                </div>
                {!isCompact && (
                    <Link
                        to={`/surgeries/${surgery.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                        View Details <ChevronRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            <p className={`text-blue-700 font-medium ${isCompact ? 'text-sm' : 'text-base'}`}>
                {surgery.surgery_type}
            </p>

            <p className="text-sm text-blue-600">
                Patient: {surgery.patient_name || 'N/A'}
            </p>

            {surgery.duration_minutes && (
                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Estimated: {surgery.duration_minutes} min
                </p>
            )}
        </div>
    );
};

export default CurrentSurgeryDisplay;
