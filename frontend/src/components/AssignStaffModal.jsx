import React, { useState, useEffect } from 'react';
import { X, User, Check, AlertTriangle, Users, Save, Loader2 } from 'lucide-react';
import surgeryService from '../services/surgeryService';
import StaffConflictWarning from './StaffConflictWarning';

const AssignStaffModal = ({ isOpen, onClose, surgery, onStaffAssigned }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [surgeons, setSurgeons] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [anaesthetists, setAnaesthetists] = useState([]);

    // Form state
    const [selectedSurgeon, setSelectedSurgeon] = useState(surgery?.surgeon_id || '');
    const [selectedAnaesthetist, setSelectedAnaesthetist] = useState(surgery?.anaesthetist_id || '');
    const [selectedNurses, setSelectedNurses] = useState([]); // Array of IDs

    const [conflicts, setConflicts] = useState(null);
    const [error, setError] = useState(null);

    // Sync state with surgery prop when it changes or modal opens
    useEffect(() => {
        if (isOpen && surgery) {
            setSelectedSurgeon(surgery.surgeon_id || '');
            setSelectedAnaesthetist(surgery.anaesthetist_id || '');

            // Extract nurse IDs if available in surgery.nurses
            if (surgery.nurses && Array.isArray(surgery.nurses)) {
                setSelectedNurses(surgery.nurses.map(n => n.id));
            } else {
                setSelectedNurses([]);
            }

            fetchAvailableStaff();
        }
    }, [isOpen, surgery]);

    const fetchAvailableStaff = async () => {
        try {
            setLoading(true);
            setError(null);

            const { scheduled_date, scheduled_time, duration_minutes, id } = surgery;

            const [surgeonsRes, nursesRes, anaesthetistsRes] = await Promise.all([
                surgeryService.getAvailableSurgeons(scheduled_date, scheduled_time, duration_minutes, id),
                surgeryService.getAvailableNurses(scheduled_date, scheduled_time, duration_minutes, id),
                surgeryService.getAvailableAnaesthetists(scheduled_date, scheduled_time, duration_minutes, id)
            ]);

            setSurgeons(surgeonsRes.data);
            setNurses(nursesRes.data);
            setAnaesthetists(anaesthetistsRes.data);
        } catch (err) {
            console.error('Error fetching available staff:', err);
            setError(err.message || 'Failed to fetch available staff');
        } finally {
            setLoading(false);
        }
    };

    // Check for conflicts whenever staff selection changes
    useEffect(() => {
        if (!isOpen || !surgery) return;

        const checkConflicts = async () => {
            if (!selectedSurgeon && !selectedAnaesthetist && selectedNurses.length === 0) {
                setConflicts(null);
                return;
            }

            try {
                const conflictData = {
                    scheduled_date: surgery.scheduled_date,
                    scheduled_time: surgery.scheduled_time,
                    duration_minutes: surgery.duration_minutes,
                    surgeon_id: selectedSurgeon || null,
                    anaesthetist_id: selectedAnaesthetist || null,
                    nurse_ids: selectedNurses,
                    exclude_surgery_id: surgery.id
                };

                const res = await surgeryService.checkStaffConflicts(conflictData);
                setConflicts(res);
            } catch (err) {
                console.error('Error checking staff conflicts:', err);
            }
        };

        const timeoutId = setTimeout(checkConflicts, 500);
        return () => clearTimeout(timeoutId);
    }, [selectedSurgeon, selectedAnaesthetist, selectedNurses, isOpen, surgery]);

    const handleNurseToggle = (nurseId) => {
        setSelectedNurses(prev => {
            if (prev.includes(nurseId)) {
                return prev.filter(id => id !== nurseId);
            }
            if (prev.length >= 3) return prev; // Max 3 nurses
            return [...prev, nurseId];
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const staffData = {
                surgeon_id: selectedSurgeon || null,
                anaesthetist_id: selectedAnaesthetist || null,
                nurse_ids: selectedNurses
            };

            const res = await surgeryService.assignStaff(surgery.id, staffData);
            onStaffAssigned(res.data);
            onClose();
        } catch (err) {
            console.error('Error saving staff assignment:', err);
            setError(err.message || 'Failed to save staff assignment');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Assign Staff</h2>
                        <p className="text-sm text-gray-500">{surgery?.surgery_type} - {surgery?.patient_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-700 text-sm">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-gray-500 animate-pulse">Checking staff availability...</p>
                        </div>
                    ) : (
                        <>
                            {/* Surgeon Selection */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <User className="w-4 h-4 text-blue-500" />
                                    Lead Surgeon
                                </label>
                                <select
                                    value={selectedSurgeon}
                                    onChange={(e) => setSelectedSurgeon(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Select Surgeon (None)</option>
                                    {surgeons.map(s => (
                                        <option key={s.id} value={s.id} disabled={!s.available}>
                                            {s.name} {!s.available ? '(Busy)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Anaesthetist Selection */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <User className="w-4 h-4 text-purple-500" />
                                    Anaesthetist
                                </label>
                                <select
                                    value={selectedAnaesthetist}
                                    onChange={(e) => setSelectedAnaesthetist(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                >
                                    <option value="">Select Anaesthetist (None)</option>
                                    {anaesthetists.map(a => (
                                        <option key={a.id} value={a.id} disabled={!a.available}>
                                            {a.name} {!a.available ? '(Busy)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nurses Section */}
                            <div className="space-y-3">
                                <label className="flex items-center justify-between text-sm font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-emerald-500" />
                                        Nurses (Up to 3)
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {selectedNurses.length}/3 selected
                                    </span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {nurses.map(n => {
                                        const isSelected = selectedNurses.includes(n.id);
                                        const isBusy = !n.available;
                                        return (
                                            <button
                                                key={n.id}
                                                onClick={() => handleNurseToggle(n.id)}
                                                disabled={!isSelected && (selectedNurses.length >= 3 || isBusy)}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${isSelected
                                                        ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10'
                                                        : isBusy
                                                            ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                                            : 'bg-white border-gray-200 hover:border-emerald-500/50 hover:bg-emerald-50/30'
                                                    }`}
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className={`text-sm font-medium ${isSelected ? 'text-emerald-900' : 'text-gray-900'} truncate`}>
                                                        {n.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 truncate">{n.specialization || 'General Nurse'}</p>
                                                </div>
                                                {isSelected ? (
                                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                    </div>
                                                ) : isBusy ? (
                                                    <span className="text-[10px] font-bold text-gray-400">BUSY</span>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Conflict Warnings */}
                            {conflicts && conflicts.has_conflicts && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <StaffConflictWarning warnings={conflicts.warnings} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-2 transition-all"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? 'Saving...' : 'Save Staff Assignment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignStaffModal;
