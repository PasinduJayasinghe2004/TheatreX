// ============================================================================
// Edit Surgery Modal Component
// ============================================================================
// Created by: M1 (Pasindu) - Day 6
// Updated by: M1 (Pasindu) - Day 9 (Surgeon availability filtering)
// Updated by: M2 (Chandeepa) - Day 9 (Multi-select nurses with availability)
// 
// Modal for editing existing surgeries
// Similar design to SurgeryForm but pre-populated with surgery data
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import surgeryService from '../services/surgeryService';

// Mock data for dropdowns (replace with API calls when available)
const MOCK_PATIENTS = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Michael Brown' },
    { id: 4, name: 'Emily Davis' },
];

const MOCK_ANAESTHETISTS = [
    { id: 1, name: 'Dr. James Wilson' },
    { id: 2, name: 'Dr. Lisa Anderson' },
    { id: 3, name: 'Dr. Robert Taylor' },
];

const MOCK_THEATRES = [
    { id: 1, name: 'Theatre 1 - General Surgery' },
    { id: 2, name: 'Theatre 2 - Cardiac' },
    { id: 3, name: 'Theatre 3 - Orthopedic' },
    { id: 4, name: 'Theatre 4 - Neuro' },
];

const EditSurgeryModal = ({ surgery, onSuccess, onCancel }) => {
    const { token } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [surgeons, setSurgeons] = useState([]);
    const [loadingSurgeons, setLoadingSurgeons] = useState(true);

    // Surgeon availability state - M1 (Pasindu) Day 9
    const [surgeonAvailability, setSurgeonAvailability] = useState(null);
    const [checkingSurgeonAvail, setCheckingSurgeonAvail] = useState(false);

    // Nurse state - M2 (Chandeepa) Day 9
    const [nurses, setNurses] = useState([]);
    const [loadingNurses, setLoadingNurses] = useState(true);
    const [nurseAvailability, setNurseAvailability] = useState(null);
    const [checkingNurseAvail, setCheckingNurseAvail] = useState(false);

    // Form state - pre-populated with surgery data
    const [formData, setFormData] = useState({
        procedure_name: '',
        patient_id: '',
        patient_name: '',
        surgeon_id: '',
        nurse_ids: [],  // M2 Day 9
        anaesthetist_id: '',
        theatre_id: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: '60',
        status: 'scheduled',
        priority: 'routine',
    });

    // Initialize form with surgery data
    useEffect(() => {
        if (surgery) {
            // Format date for input (YYYY-MM-DD)
            let formattedDate = '';
            if (surgery.scheduled_date) {
                const date = new Date(surgery.scheduled_date);
                formattedDate = date.toISOString().split('T')[0];
            }

            setFormData({
                procedure_name: surgery.surgery_type || '',
                patient_id: surgery.patient_id || '',
                patient_name: surgery.patient_name || '',
                surgeon_id: surgery.surgeon_id || '',
                nurse_ids: surgery.nurses ? surgery.nurses.map(n => n.id) : [],  // M2 Day 9
                anaesthetist_id: surgery.anaesthetist_id || '',
                theatre_id: surgery.theatre_id || '',
                scheduled_date: formattedDate,
                scheduled_time: surgery.scheduled_time || '',
                duration_minutes: surgery.duration_minutes?.toString() || '60',
                status: surgery.status || 'scheduled',
                priority: surgery.priority || 'routine',
            });
        }
    }, [surgery]);

    // Fetch surgeons for dropdown
    useEffect(() => {
        const fetchSurgeons = async () => {
            try {
                const response = await surgeryService.getSurgeons();
                if (response.success) {
                    setSurgeons(response.data);
                }
            } catch (error) {
                console.error('Error fetching surgeons:', error);
            } finally {
                setLoadingSurgeons(false);
            }
        };

        if (token) {
            fetchSurgeons();
        }
    }, [token]);

    // Check surgeon availability when date/time/duration change - M1 (Pasindu) Day 9
    const checkSurgeonAvailability = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes } = formData;
        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setSurgeonAvailability(null);
            return;
        }

        try {
            setCheckingSurgeonAvail(true);
            const result = await surgeryService.getAvailableSurgeons(
                scheduled_date,
                scheduled_time,
                duration_minutes,
                surgery?.id // exclude current surgery from conflict check
            );
            if (result.success) {
                setSurgeons(result.data);
                const availMap = {};
                result.data.forEach(s => {
                    availMap[s.id] = { available: s.available, conflict_reason: s.conflict_reason };
                });
                setSurgeonAvailability(availMap);
            }
        } catch (error) {
            console.error('Error checking surgeon availability:', error);
        } finally {
            setCheckingSurgeonAvail(false);
        }
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes, surgery?.id]);

    useEffect(() => {
        checkSurgeonAvailability();
    }, [checkSurgeonAvailability]);

    // Check nurse availability when date/time/duration change - M2 (Chandeepa) Day 9
    const checkNurseAvailability = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes } = formData;
        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setNurseAvailability(null);
            return;
        }

        try {
            setCheckingNurseAvail(true);
            const result = await surgeryService.getAvailableNurses(
                scheduled_date,
                scheduled_time,
                duration_minutes,
                surgery?.id
            );
            if (result.success) {
                setNurses(result.data);
                setLoadingNurses(false);
                const availMap = {};
                result.data.forEach(n => {
                    availMap[n.id] = { available: n.available, conflict_reason: n.conflict_reason };
                });
                setNurseAvailability(availMap);
            }
        } catch (error) {
            console.error('Error checking nurse availability:', error);
            if (nurses.length === 0) setLoadingNurses(false);
        } finally {
            setCheckingNurseAvail(false);
        }
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes, surgery?.id]);

    useEffect(() => {
        checkNurseAvailability();
    }, [checkNurseAvailability]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear patient_name if patient_id is selected
        if (name === 'patient_id' && value) {
            setFormData(prev => ({ ...prev, patient_name: '' }));
        }
        // Clear patient_id if patient_name is entered
        if (name === 'patient_name' && value) {
            setFormData(prev => ({ ...prev, patient_id: '' }));
        }
    };

    // Handle nurse checkbox toggle - M2 (Chandeepa) Day 9
    const handleNurseToggle = (nurseId) => {
        setFormData(prev => {
            const currentIds = prev.nurse_ids;
            if (currentIds.includes(nurseId)) {
                return { ...prev, nurse_ids: currentIds.filter(id => id !== nurseId) };
            } else if (currentIds.length < 3) {
                return { ...prev, nurse_ids: [...currentIds, nurseId] };
            }
            return prev;
        });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Basic validation
        if (!formData.procedure_name) {
            setMessage({ type: 'error', text: 'Please enter procedure name' });
            return;
        }

        if (!formData.patient_id && !formData.patient_name) {
            setMessage({ type: 'error', text: 'Please select a patient or enter patient name' });
            return;
        }

        if (!formData.scheduled_date || !formData.scheduled_time) {
            setMessage({ type: 'error', text: 'Please select date and time' });
            return;
        }

        try {
            setLoading(true);

            const updateData = {
                surgery_type: formData.procedure_name,
                patient_id: formData.patient_id ? parseInt(formData.patient_id) : null,
                patient_name: formData.patient_name || null,
                surgeon_id: formData.surgeon_id ? parseInt(formData.surgeon_id) : null,
                nurse_ids: formData.nurse_ids.map(Number),  // M2 Day 9: send nurse_ids array
                anaesthetist_id: formData.anaesthetist_id ? parseInt(formData.anaesthetist_id) : null,
                theatre_id: formData.theatre_id ? parseInt(formData.theatre_id) : null,
                scheduled_date: formData.scheduled_date,
                scheduled_time: formData.scheduled_time,
                duration_minutes: parseInt(formData.duration_minutes) || 60,
                status: formData.status,
                priority: formData.priority,
            };

            const response = await surgeryService.updateSurgery(surgery.id, updateData);

            if (response.success) {
                setMessage({ type: 'success', text: 'Surgery updated successfully!' });
                
                // Call onSuccess callback after short delay
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(response.data);
                    }
                }, 1000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Error updating surgery' });
        } finally {
            setLoading(false);
        }
    };

    // Input styles
    const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
    const labelClass = "block text-sm font-medium text-blue-600 mb-1.5";
    const selectClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2020%2020%22%20fill%3d%22%236b7280%22%3e%3cpath%20fill-rule%3d%22evenodd%22%20d%3d%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3d%22evenodd%22%2f%3e%3c%2fsvg%3e')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Surgery</h2>
                    <button
                        onClick={onCancel}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error/Success Message */}
                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm ${
                                message.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Surgery ID Badge */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded">ID: {surgery?.id}</span>
                        </div>

                        {/* Procedure Name */}
                        <div>
                            <label className={labelClass}>Procedure Name</label>
                            <input
                                type="text"
                                name="procedure_name"
                                value={formData.procedure_name}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. Appendectomy"
                            />
                        </div>

                        {/* Patient Details Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Patient Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Select Existing Patient</label>
                                    <select
                                        name="patient_id"
                                        value={formData.patient_id}
                                        onChange={handleChange}
                                        className={selectClass}
                                        disabled={!!formData.patient_name}
                                    >
                                        <option value="">-- Select Patient --</option>
                                        {MOCK_PATIENTS.map(patient => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Or Patient Name</label>
                                    <input
                                        type="text"
                                        name="patient_name"
                                        value={formData.patient_name}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Enter Name"
                                        disabled={!!formData.patient_id}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Staff Assignment - Surgeon & Anaesthetist */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className={labelClass}>Surgeon</label>
                                    {checkingSurgeonAvail && (
                                        <span className="text-xs text-blue-500 animate-pulse">Checking...</span>
                                    )}
                                    {surgeonAvailability && !checkingSurgeonAvail && (
                                        <span className="text-xs text-green-600">
                                            {Object.values(surgeonAvailability).filter(s => s.available).length} available
                                        </span>
                                    )}
                                </div>
                                <select
                                    name="surgeon_id"
                                    value={formData.surgeon_id}
                                    onChange={handleChange}
                                    className={selectClass}
                                    disabled={loadingSurgeons}
                                >
                                    <option value="">{loadingSurgeons ? 'Loading...' : 'Select Surgeon'}</option>
                                    {surgeons.map(surgeon => {
                                        const avail = surgeonAvailability?.[surgeon.id];
                                        const isUnavailable = avail && !avail.available;
                                        const label = `${surgeon.name}${avail ? (avail.available ? ' ✅' : ' ❌ Busy') : ''}`;
                                        return (
                                            <option
                                                key={surgeon.id}
                                                value={surgeon.id}
                                                disabled={isUnavailable}
                                            >
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                                {formData.surgeon_id && surgeonAvailability?.[formData.surgeon_id] && !surgeonAvailability[formData.surgeon_id].available && (
                                    <p className="text-xs text-red-500 mt-1">
                                        ⚠️ {surgeonAvailability[formData.surgeon_id].conflict_reason}
                                    </p>
                                )}
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

                        {/* Nurse Multi-Select - M2 (Chandeepa) Day 9 */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className={labelClass}>
                                    Nurses <span className="text-gray-400 font-normal">(select up to 3)</span>
                                </label>
                                {checkingNurseAvail && (
                                    <span className="text-xs text-blue-500 animate-pulse">Checking...</span>
                                )}
                                {nurseAvailability && !checkingNurseAvail && (
                                    <span className="text-xs text-green-600">
                                        {Object.values(nurseAvailability).filter(n => n.available).length} available
                                    </span>
                                )}
                                {formData.nurse_ids.length > 0 && (
                                    <span className="text-xs text-blue-600 font-medium">
                                        {formData.nurse_ids.length}/3 selected
                                    </span>
                                )}
                            </div>
                            {loadingNurses && !nurseAvailability ? (
                                <div className="text-sm text-gray-400 py-2">
                                    Enter date, time &amp; duration to see available nurses...
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg max-h-36 overflow-y-auto">
                                    {nurses.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-gray-400">No nurses found</div>
                                    ) : (
                                        nurses.map(nurse => {
                                            const avail = nurseAvailability?.[nurse.id];
                                            const isUnavailable = avail && !avail.available;
                                            const isSelected = formData.nurse_ids.includes(nurse.id) || formData.nurse_ids.includes(String(nurse.id));
                                            const isMaxReached = formData.nurse_ids.length >= 3 && !isSelected;

                                            return (
                                                <label
                                                    key={nurse.id}
                                                    className={`flex items-center px-3 py-2 text-sm border-b last:border-b-0 cursor-pointer transition-colors
                                                        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                                        ${(isUnavailable || isMaxReached) && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleNurseToggle(nurse.id)}
                                                        disabled={isUnavailable || (isMaxReached && !isSelected)}
                                                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className={`flex-1 ${isUnavailable ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                        {nurse.name}
                                                        {nurse.specialization && (
                                                            <span className="text-gray-400 ml-1">({nurse.specialization})</span>
                                                        )}
                                                    </span>
                                                    {avail && (
                                                        <span className={`text-xs ml-2 ${avail.available ? 'text-green-600' : 'text-red-500'}`}>
                                                            {avail.available ? '✅' : '❌ Busy'}
                                                        </span>
                                                    )}
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                            {formData.nurse_ids.map(nurseId => {
                                const avail = nurseAvailability?.[nurseId];
                                if (avail && !avail.available) {
                                    return (
                                        <p key={nurseId} className="text-xs text-red-500 mt-1">
                                            ⚠️ {avail.conflict_reason}
                                        </p>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        {/* Theatre */}
                        <div>
                            <label className={labelClass}>Theatre</label>
                            <select
                                name="theatre_id"
                                value={formData.theatre_id}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="">Select Theatre</option>
                                {MOCK_THEATRES.map(theatre => (
                                    <option key={theatre.id} value={theatre.id}>
                                        {theatre.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date, Time, Duration - 3 column grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="edit_scheduled_date" className={labelClass}>Date</label>
                                <input
                                    type="date"
                                    id="edit_scheduled_date"
                                    name="scheduled_date"
                                    value={formData.scheduled_date}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="edit_scheduled_time" className={labelClass}>Start Time</label>
                                <input
                                    type="time"
                                    id="edit_scheduled_time"
                                    name="scheduled_time"
                                    value={formData.scheduled_time}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="edit_duration_minutes" className={labelClass}>Duration (min)</label>
                                <input
                                    type="number"
                                    id="edit_duration_minutes"
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleChange}
                                    min="15"
                                    step="15"
                                    className={inputClass}
                                    placeholder="60"
                                />
                            </div>
                        </div>

                        {/* Status and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={selectClass}
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="postponed">Postponed</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className={selectClass}
                                >
                                    <option value="routine">Routine</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="px-8 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSurgeryModal;
