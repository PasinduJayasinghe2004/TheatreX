// ============================================================================
// Emergency Booking Page
// ============================================================================
// Created by: M1 (Pasindu) - Day 8
// Updated by: M4 (Oneli) - Day 9 - Added staff conflict warning integration
// 
// Dedicated page for emergency surgery booking with:
// - Streamlined form layout optimized for urgent cases
// - Real-time conflict detection
// - Manual patient entry (no need to pre-register)
// - Priority defaulted to "emergency"
// - Visual indicators for conflicts and availability
// - Staff conflict warnings (M4 Day 9)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStaff } from '../context/StaffContext';
import { useNavigate } from 'react-router-dom';
import surgeryService from '../services/surgeryService';
import axios from 'axios';
import Layout from '../components/Layout';
import StaffConflictWarning from '../components/StaffConflictWarning';
import { toast } from 'react-toastify';

// Mock data for staff (replace with API calls when available)
const MOCK_NURSES = [
    { id: 1, name: 'Nancy Williams' },
    { id: 2, name: 'Ruth Garcia' },
    { id: 3, name: 'Maria Martinez' },
];

const MOCK_ANAESTHETISTS = [
    { id: 1, name: 'Dr. James Wilson' },
    { id: 2, name: 'Dr. Lisa Anderson' },
    { id: 3, name: 'Dr. Robert Taylor' },
];

const EmergencyBooking = () => {
    const { token } = useAuth();
    const { subscribe } = useStaff();
    const navigate = useNavigate();

    // Loading states
    const [loading, setLoading] = useState(false);

    // Data states
    const [surgeons, setSurgeons] = useState([]);
    const [loadingSurgeons, setLoadingSurgeons] = useState(true);
    const [theatres, setTheatres] = useState([]);
    const [loadingTheatres, setLoadingTheatres] = useState(true);

    // Conflict detection states - M1 Day 8
    const [conflicts, setConflicts] = useState(null);
    const [checkingConflicts, setCheckingConflicts] = useState(false);
    const [theatreAvailability, setTheatreAvailability] = useState(null);

    // Staff conflict warnings - M4 (Oneli) Day 9
    const [staffConflicts, setStaffConflicts] = useState(null);
    const [checkingStaffConflicts, setCheckingStaffConflicts] = useState(false);

    // Form state - emergency defaults
    const [formData, setFormData] = useState({
        procedure_name: '',
        patient_name: '',
        patient_age: '',
        patient_gender: '',
        surgeon_id: '',
        nurse_id: '',
        anaesthetist_id: '',
        theatre_id: '',
        scheduled_date: new Date().toISOString().split('T')[0], // Default to today
        scheduled_time: '',
        duration_minutes: '60',
        priority: 'emergency', // Emergency by default
        notes: '',
    });

    // Function to fetch surgeons and theatres
    const fetchStaffData = useCallback(async () => {
        try {
            const [surgeonRes, theatreRes] = await Promise.all([
                axios.get(
                    'http://localhost:5000/api/surgeries/surgeons',
                    { headers: { Authorization: `Bearer ${token}` } }
                ).catch(error => {
                    console.error('Error fetching surgeons:', error);
                    return { data: { success: false, data: [] } };
                }),
                surgeryService.getTheatres().catch(error => {
                    console.error('Error fetching theatres:', error);
                    return { success: false, data: [] };
                })
            ]);

            if (surgeonRes.data.success) {
                setSurgeons(surgeonRes.data.data);
            }

            if (theatreRes.success) {
                setTheatres(theatreRes.data);
            }
        } catch (error) {
            console.error('Error fetching staff data:', error);
        } finally {
            setLoadingSurgeons(false);
            setLoadingTheatres(false);
        }
    }, [token]);

    // Fetch surgeons and theatres on component mount
    useEffect(() => {
        if (token) {
            fetchStaffData();
        }
    }, [token, fetchStaffData]);

    // Subscribe to staff data changes - when staff is added/updated/deleted, refetch
    useEffect(() => {
        const unsubscribe = subscribe(() => {
            // Reset loading states and refetch
            setLoadingSurgeons(true);
            setLoadingTheatres(true);
            fetchStaffData();
        });

        return unsubscribe;
    }, [subscribe, fetchStaffData]);

    // Check theatre availability when date/time/duration change
    const checkAvailability = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes } = formData;
        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setTheatreAvailability(null);
            return;
        }

        try {
            const result = await surgeryService.checkTheatreAvailability(
                scheduled_date,
                scheduled_time,
                duration_minutes
            );
            if (result.success) {
                const availMap = {};
                result.data.forEach(t => {
                    availMap[t.id] = { available: t.available, conflict_reason: t.conflict_reason };
                });
                setTheatreAvailability(availMap);
            }
        } catch (error) {
            console.error('Error checking availability:', error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes]);

    useEffect(() => {
        checkAvailability();
    }, [checkAvailability]);

    // Check all conflicts (theatre, surgeon, staff) - M1 Day 8
    const checkAllConflicts = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes, theatre_id, surgeon_id, anaesthetist_id } = formData;

        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setConflicts(null);
            return;
        }

        try {
            setCheckingConflicts(true);
            const response = await axios.post(
                'http://localhost:5000/api/surgeries/check-conflicts',
                {
                    scheduled_date,
                    scheduled_time,
                    duration_minutes: parseInt(duration_minutes),
                    theatre_id: theatre_id ? parseInt(theatre_id) : null,
                    surgeon_id: surgeon_id ? parseInt(surgeon_id) : null,
                    anaesthetist_id: anaesthetist_id ? parseInt(anaesthetist_id) : null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setConflicts(response.data);
            }
        } catch (error) {
            console.error('Error checking conflicts:', error);
        } finally {
            setCheckingConflicts(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes,
    formData.theatre_id, formData.surgeon_id, formData.anaesthetist_id, token]);

    // Debounced conflict check
    useEffect(() => {
        const timer = setTimeout(() => {
            checkAllConflicts();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [checkAllConflicts]);

    // Check staff conflicts when staff selections change - M4 (Oneli) Day 9
    const checkStaffConflictsCallback = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes, surgeon_id, anaesthetist_id } = formData;

        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setStaffConflicts(null);
            return;
        }

        const hasStaff = surgeon_id || anaesthetist_id;
        if (!hasStaff) {
            setStaffConflicts(null);
            return;
        }

        try {
            setCheckingStaffConflicts(true);
            const result = await surgeryService.checkStaffConflicts({
                scheduled_date,
                scheduled_time,
                duration_minutes: parseInt(duration_minutes),
                surgeon_id: surgeon_id ? parseInt(surgeon_id) : null,
                anaesthetist_id: anaesthetist_id ? parseInt(anaesthetist_id) : null,
                nurse_ids: []
            });
            if (result.success) {
                setStaffConflicts(result);
            }
        } catch (error) {
            console.error('Error checking staff conflicts:', error);
        } finally {
            setCheckingStaffConflicts(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes,
    formData.surgeon_id, formData.anaesthetist_id]);

    // Debounced staff conflict check
    useEffect(() => {
        const timer = setTimeout(() => {
            checkStaffConflictsCallback();
        }, 500);

        return () => clearTimeout(timer);
    }, [checkStaffConflictsCallback]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.procedure_name) {
            toast.error('Please enter procedure name');
            return;
        }
        if (!formData.patient_name) {
            toast.error('Patient name is required for emergency booking');
            return;
        }
        if (!formData.scheduled_date || !formData.scheduled_time) {
            toast.error('Please select date and time');
            return;
        }

        // Warning if there are conflicts (but allow submission with confirmation for emergencies)
        if (conflicts?.has_conflicts) {
            const confirmProceed = window.confirm(
                `⚠️ There are ${conflicts.conflict_count} scheduling conflict(s). ` +
                `This is an EMERGENCY booking - do you want to proceed anyway?`
            );
            if (!confirmProceed) return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                'http://localhost:5000/api/surgeries',
                {
                    surgery_type: formData.procedure_name,
                    patient_name: formData.patient_name,
                    patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
                    patient_gender: formData.patient_gender || null,
                    surgeon_id: formData.surgeon_id ? parseInt(formData.surgeon_id) : null,
                    theatre_id: formData.theatre_id ? parseInt(formData.theatre_id) : null,
                    scheduled_date: formData.scheduled_date,
                    scheduled_time: formData.scheduled_time,
                    duration_minutes: parseInt(formData.duration_minutes) || 60,
                    status: 'scheduled',
                    priority: 'emergency',
                    notes: formData.notes || 'Emergency booking',
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('🚨 Emergency surgery scheduled successfully!');
                setTimeout(() => navigate('/surgeries'), 1500);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error scheduling emergency surgery';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Styling
    const inputClass = "w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-200 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all";
    const labelClass = "block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5";
    const selectClass = "w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none bg-white dark:bg-slate-800";

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-950 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-red-600 rounded-t-2xl px-6 py-5">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">🚨</span>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Emergency Surgery Booking</h1>
                                <p className="text-red-100 text-sm mt-1">
                                    Fast-track scheduling for urgent cases
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-xl border border-transparent dark:border-slate-700">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Conflict Warning Banner - M1 Day 8 */}
                            {conflicts?.has_conflicts && (
                                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">⚠️</span>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-amber-800">
                                                {conflicts.conflict_count} Scheduling Conflict(s) Detected
                                            </h3>
                                            <ul className="mt-2 space-y-1 text-sm text-amber-700">
                                                {conflicts.conflicts.map((c, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="font-medium capitalize">{c.type}:</span>
                                                        <span>{c.message}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="mt-2 text-xs text-amber-600 italic">
                                                * Emergency bookings can proceed with conflicts
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Row 1: Procedure & Priority Badge */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="procedure_name" className={labelClass}>Procedure Name *</label>
                                    <input
                                        id="procedure_name"
                                        type="text"
                                        name="procedure_name"
                                        value={formData.procedure_name}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="e.g. Emergency Appendectomy"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Priority</label>
                                    <div className="flex items-center h-[50px] px-4 bg-red-100 border-2 border-red-500 rounded-lg">
                                        <span className="text-red-700 font-bold">🚨 EMERGENCY</span>
                                    </div>
                                </div>
                            </div>

                            {/* Patient Information Section */}
                            <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200">
                                <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Patient Information
                                    <span className="text-xs font-normal text-red-600 ml-2">(Manual entry for emergencies)</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Patient Name *</label>
                                        <input
                                            type="text"
                                            name="patient_name"
                                            value={formData.patient_name}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Full Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Age</label>
                                        <input
                                            type="number"
                                            name="patient_age"
                                            value={formData.patient_age}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Age"
                                            min="0"
                                            max="150"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Gender</label>
                                        <select
                                            name="patient_gender"
                                            value={formData.patient_gender}
                                            onChange={handleChange}
                                            className={selectClass}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Section */}
                            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-5 border border-gray-200 dark:border-slate-600">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Schedule
                                    {checkingConflicts && (
                                        <span className="text-xs text-blue-500 animate-pulse ml-2">Checking conflicts...</span>
                                    )}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Date *</label>
                                        <input
                                            type="date"
                                            name="scheduled_date"
                                            value={formData.scheduled_date}
                                            onChange={handleChange}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Time *</label>
                                        <input
                                            type="time"
                                            name="scheduled_time"
                                            value={formData.scheduled_time}
                                            onChange={handleChange}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Duration (minutes)</label>
                                        <input
                                            type="number"
                                            name="duration_minutes"
                                            value={formData.duration_minutes}
                                            onChange={handleChange}
                                            className={inputClass}
                                            min="15"
                                            step="15"
                                            placeholder="60"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Theatre Selection with Availability */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className={labelClass}>Theatre</label>
                                    {theatreAvailability && (
                                        <span className="text-xs text-green-600">
                                            {Object.values(theatreAvailability).filter(t => t.available).length} available
                                        </span>
                                    )}
                                </div>
                                <select
                                    name="theatre_id"
                                    value={formData.theatre_id}
                                    onChange={handleChange}
                                    className={selectClass}
                                    disabled={loadingTheatres}
                                >
                                    <option value="">{loadingTheatres ? 'Loading...' : 'Select Theatre'}</option>
                                    {theatres.map(theatre => {
                                        const avail = theatreAvailability?.[theatre.id];
                                        const isUnavailable = avail && !avail.available;
                                        return (
                                            <option
                                                key={theatre.id}
                                                value={theatre.id}
                                                disabled={isUnavailable}
                                            >
                                                {theatre.name}
                                                {theatre.location ? ` - ${theatre.location}` : ''}
                                                {avail ? (avail.available ? ' ✅' : ' ❌') : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                                {formData.theatre_id && theatreAvailability?.[formData.theatre_id] &&
                                    !theatreAvailability[formData.theatre_id].available && (
                                        <p className="text-xs text-red-500 mt-1">
                                            ⚠️ {theatreAvailability[formData.theatre_id].conflict_reason}
                                        </p>
                                    )}
                            </div>

                            {/* Staff Assignment */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Surgeon</label>
                                    <select
                                        name="surgeon_id"
                                        value={formData.surgeon_id}
                                        onChange={handleChange}
                                        className={selectClass}
                                        disabled={loadingSurgeons}
                                    >
                                        <option value="">Select Surgeon</option>
                                        {surgeons.map(surgeon => (
                                            <option key={surgeon.id} value={surgeon.id}>
                                                {surgeon.name}
                                            </option>
                                        ))}
                                    </select>
                                    {conflicts?.conflicts?.find(c => c.type === 'surgeon') && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠️ Surgeon has conflicting surgery
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Nurse</label>
                                    <select
                                        name="nurse_id"
                                        value={formData.nurse_id}
                                        onChange={handleChange}
                                        className={selectClass}
                                    >
                                        <option value="">Select Nurse</option>
                                        {MOCK_NURSES.map(nurse => (
                                            <option key={nurse.id} value={nurse.id}>
                                                {nurse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Anaesthetist</label>
                                    <select
                                        name="anaesthetist_id"
                                        value={formData.anaesthetist_id}
                                        onChange={handleChange}
                                        className={selectClass}
                                    >
                                        <option value="">Select Anaesthetist</option>
                                        {MOCK_ANAESTHETISTS.map(anaesthetist => (
                                            <option key={anaesthetist.id} value={anaesthetist.id}>
                                                {anaesthetist.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Staff Conflict Warnings - M4 (Oneli) Day 9 */}
                            <StaffConflictWarning
                                warnings={staffConflicts?.warnings || []}
                                loading={checkingStaffConflicts}
                                className="mt-2"
                            />

                            {/* Notes */}
                            <div>
                                <label className={labelClass}>Emergency Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className={`${inputClass} resize-none`}
                                    rows="3"
                                    placeholder="Additional details about the emergency..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-4 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                    className="px-8 py-3 text-gray-600 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Scheduling...
                                        </>
                                    ) : (
                                        <>
                                            🚨 Schedule Emergency Surgery
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EmergencyBooking;
