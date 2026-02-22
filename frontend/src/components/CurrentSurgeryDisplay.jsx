// ============================================================================
// Current Surgery Display Component
// ============================================================================
// Created by: M5 (Inthusha) - Day 10
// Updated by: M1 (Pasindu) - Day 11 (Added progress slider integration)
//
// A reusable component to display details of a surgery currently in progress.
// Used in TheatreCard and TheatreDetailCard.
//
// Props:
//   surgery         - Object containing current surgery details:
//                     { id, surgery_type, patient_name, duration_minutes, progress_percent }
//   variant         - 'compact' (for cards) or 'full' (for detail views)
//   onProgressChange - Callback(progress) fired when progress slider value is committed
//   canEditProgress - Whether the user can edit progress (coordinator/admin)
//   isUpdating      - Whether progress is currently being updated
// ============================================================================

import { Link } from 'react-router-dom';
import { Activity, Clock, ChevronRight } from 'lucide-react';
import ProgressSlider from './ProgressSlider';

const CurrentSurgeryDisplay = ({
    surgery,
    variant = 'compact',
    onProgressChange,
    canEditProgress = false,
    isUpdating = false
}) => {
    if (!surgery) return null;

    const isCompact = variant === 'compact';
    const progress = surgery.progress_percent || 0;

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

            {/* Progress Slider - M1 (Pasindu) Day 11 */}
            <div className="mt-3">
                {isCompact ? (
                    // Compact view: show progress bar only
                    <ProgressSlider
                        value={progress}
                        variant="compact"
                        size="sm"
                        disabled={true}
                    />
                ) : (
                    // Full view: show interactive slider if allowed
                    <ProgressSlider
                        value={progress}
                        variant="default"
                        size="md"
                        disabled={!canEditProgress || isUpdating}
                        onCommit={onProgressChange}
                    />
                )}
            </div>
        </div>
    );
};

export default CurrentSurgeryDisplay;
