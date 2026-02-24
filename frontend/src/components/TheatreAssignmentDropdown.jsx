// ============================================================================
// Theatre Assignment Dropdown Component
// ============================================================================
// Created by: M3 (Janani) - Day 12
//
// A dropdown panel for assigning unassigned (theatre_id IS NULL) surgeries
// to a specific theatre. Designed to be embedded into the Coordinator
// Dashboard's TheatreCard or used standalone.
//
// Props:
//   theatre      – { id, name, status }  the target theatre
//   onAssigned   – callback after a successful assignment (refresh parent)
//   onClose      – callback to dismiss / collapse the dropdown
//
// Flow:
//   1. Fetches unassigned surgeries via surgeryService.getUnassignedSurgeries()
//   2. User picks a surgery from the list
//   3. Calls surgeryService.assignSurgeryToTheatre(surgeryId, theatreId)
//   4. On success → calls onAssigned(); on conflict → shows inline error
// ============================================================================

import { useState, useEffect } from 'react';
import surgeryService from '../services/surgeryService';

// Priority badge helper
const PriorityBadge = ({ priority }) => {
    const cfg = {
        emergency: 'bg-red-50 text-red-700 border-red-200',
        urgent: 'bg-amber-50 text-amber-700 border-amber-200',
        routine: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return (
        <span className={`inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${cfg[priority] || cfg.routine}`}>
            {priority}
        </span>
    );
};

const TheatreAssignmentDropdown = ({ theatre, onAssigned, onClose }) => {
    const [surgeries, setSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null);   // surgery ID being assigned
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Fetch unassigned surgeries on mount
    useEffect(() => {
        let cancelled = false;
        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await surgeryService.getUnassignedSurgeries();
                if (!cancelled) setSurgeries(data.data || []);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetch();
        return () => { cancelled = true; };
    }, []);

    const handleAssign = async (surgeryId) => {
        setAssigning(surgeryId);
        setError(null);
        setSuccessMsg(null);
        try {
            const result = await surgeryService.assignSurgeryToTheatre(surgeryId, theatre.id);
            setSuccessMsg(result.message || 'Surgery assigned successfully');
            // Remove the assigned surgery from the local list
            setSurgeries(prev => prev.filter(s => s.id !== surgeryId));
            // Notify parent to refresh
            if (onAssigned) onAssigned();
        } catch (err) {
            setError(err.message);
        } finally {
            setAssigning(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '--';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { return dateStr; }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        try {
            return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true
            });
        } catch { return timeStr; }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-96 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-gray-800">Assign Surgery</h4>
                    <p className="text-[11px] text-gray-400">to {theatre.name}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Feedback messages */}
            {error && (
                <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-600">
                    {successMsg}
                </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    </div>
                ) : surgeries.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <p className="text-sm text-gray-400">No unassigned surgeries</p>
                        <p className="text-[11px] text-gray-300 mt-1">All surgeries have been assigned to theatres</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {surgeries.map((surgery) => (
                            <li
                                key={surgery.id}
                                className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-medium text-gray-800 truncate">
                                            {surgery.surgery_type}
                                        </span>
                                        <PriorityBadge priority={surgery.priority} />
                                    </div>
                                    <p className="text-[11px] text-gray-400 truncate">
                                        {surgery.patient_name || 'Unknown'} · {formatDate(surgery.scheduled_date)} {formatTime(surgery.scheduled_time)} · {surgery.duration_minutes}min
                                    </p>
                                    {surgery.surgeon_name && (
                                        <p className="text-[11px] text-gray-400 truncate">
                                            Surgeon: {surgery.surgeon_name}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAssign(surgery.id)}
                                    disabled={assigning === surgery.id}
                                    className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {assigning === surgery.id ? (
                                        <span className="flex items-center gap-1">
                                            <span className="animate-spin inline-block h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full" />
                                            Assigning…
                                        </span>
                                    ) : (
                                        'Assign'
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TheatreAssignmentDropdown;
