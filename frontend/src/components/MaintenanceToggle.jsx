// ============================================================================
// Maintenance Toggle Component
// ============================================================================
// Created by: M4 (Oneli) - Day 12
//
// Dedicated toggle for entering/exiting theatre maintenance mode.
// Shows:
//   - An "Enter Maintenance" button when the theatre is available
//   - An inline reason input before confirming maintenance mode
//   - An "Exit Maintenance" button + current reason when in maintenance
//
// Props:
//   theatre            - Theatre object from the API
//   onMaintenanceToggle - Callback(theatreId, enable, reason) when toggled
//   userRole           - Current user's role
//   isUpdating         - Whether a request is in flight
// ============================================================================

import { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle, X } from 'lucide-react';

const MaintenanceToggle = ({ theatre, onMaintenanceToggle, userRole, isUpdating = false }) => {
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [reason, setReason] = useState('');
    const [confirmExit, setConfirmExit] = useState(false);

    const canToggle = userRole === 'coordinator' || userRole === 'admin';
    const isInMaintenance = theatre.status === 'maintenance';
    const canEnterMaintenance = theatre.status === 'available';

    if (!canToggle) return null;

    // Handle entering maintenance mode
    const handleEnter = () => {
        if (!showReasonInput) {
            setShowReasonInput(true);
            return;
        }
        onMaintenanceToggle(theatre.id, true, reason.trim() || null);
        setShowReasonInput(false);
        setReason('');
    };

    // Handle exiting maintenance mode
    const handleExit = () => {
        if (!confirmExit) {
            setConfirmExit(true);
            return;
        }
        onMaintenanceToggle(theatre.id, false, null);
        setConfirmExit(false);
    };

    // Cancel action
    const handleCancel = () => {
        setShowReasonInput(false);
        setConfirmExit(false);
        setReason('');
    };

    // ── MAINTENANCE ACTIVE STATE ────────────────────────────────────────────
    if (isInMaintenance) {
        return (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Maintenance Mode Active</span>
                </div>

                {/* Show reason if present */}
                {theatre.maintenance_reason && (
                    <p className="text-xs text-amber-700 mb-2 pl-6">
                        <span className="font-medium">Reason:</span> {theatre.maintenance_reason}
                    </p>
                )}

                {/* Exit confirmation flow */}
                {confirmExit ? (
                    <div className="flex items-center gap-2 pl-6">
                        <span className="text-xs text-amber-700">Exit maintenance?</span>
                        <button
                            onClick={handleExit}
                            disabled={isUpdating}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Confirm
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isUpdating}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleExit}
                        disabled={isUpdating}
                        className="ml-6 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                        Exit Maintenance
                    </button>
                )}
            </div>
        );
    }

    // ── AVAILABLE STATE — can enter maintenance ─────────────────────────────
    if (!canEnterMaintenance) return null;

    return (
        <div className="mt-3">
            {showReasonInput ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">Enter Maintenance Mode</span>
                    </div>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason (optional) — e.g. Equipment calibration"
                        maxLength={500}
                        className="w-full px-3 py-1.5 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white placeholder-gray-400"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={handleEnter}
                            disabled={isUpdating}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Wrench className="w-3.5 h-3.5 inline mr-1" />
                            Confirm Maintenance
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isUpdating}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50"
                        >
                            <X className="w-3.5 h-3.5 inline mr-1" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleEnter}
                    disabled={isUpdating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Wrench className="w-3.5 h-3.5" />
                    Enter Maintenance
                </button>
            )}
        </div>
    );
};

export default MaintenanceToggle;
