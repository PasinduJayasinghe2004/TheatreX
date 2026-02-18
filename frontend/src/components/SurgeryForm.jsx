
// Surgery Form Component - Modal Style

// Created by: M1 (Pasindu) - Day 5
// Updated by: M6 (Dinil) - Day 5 - New modal UI design
// 
// Clean modal form for scheduling surgeries


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import surgeryService from '../services/surgeryService';

// Mock data for dropdowns (replace with API calls when available)
const MOCK_PATIENTS = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Michael Brown' },
    { id: 4, name: 'Emily Davis' },
];

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

// MOCK_THEATRES removed — now fetched from API (M2 - Day 8)

const SurgeryForm = ({ onSuccess, onCancel, isModal = true }) => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [surgeons, setSurgeons] = useState([]);
    const [loadingSurgeons, setLoadingSurgeons] = useState(true);

    // Theatre state - M2 (Chandeepa) Day 8
    const [theatres, setTheatres] = useState([]);
    const [loadingTheatres, setLoadingTheatres] = useState(true);
    const [theatreAvailability, setTheatreAvailability] = useState(null); // map of id -> { available, conflict_reason }
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Form state - enhanced for emergency booking with manual patient entry
    const [formData, setFormData] = useState({
        procedure_name: '',
        patient_id: '',
        patient_name: '',
        patient_age: '',
        patient_gender: '',
        surgeon_id: '',
        nurse_id: '',
        anaesthetist_id: '',
        theatre_id: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: '60',
        priority: 'routine',
    });

    // Fetch surgeons for dropdown
    useEffect(() => {
        const fetchSurgeons = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:5000/api/surgeries/surgeons',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                if (response.data.success) {
                    setSurgeons(response.data.data);
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

    // Fetch theatres for dropdown - M2 (Chandeepa) Day 8
    useEffect(() => {
        const fetchTheatres = async () => {
            try {
                const result = await surgeryService.getTheatres();
                if (result.success) {
                    setTheatres(result.data);
                }
            } catch (error) {
                console.error('Error fetching theatres:', error);
            } finally {
                setLoadingTheatres(false);
            }
        };

        fetchTheatres();
    }, []);

    // Check theatre availability when date/time/duration change - M2 Day 8
    const checkAvailability = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes } = formData;
        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setTheatreAvailability(null);
            return;
        }

        try {
            setCheckingAvailability(true);
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
        } finally {
            setCheckingAvailability(false);
        }
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes]);

    useEffect(() => {
        checkAvailability();
    }, [checkAvailability]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear manual patient fields if patient_id is selected
        if (name === 'patient_id' && value) {
            setFormData(prev => ({ ...prev, patient_name: '', patient_age: '', patient_gender: '' }));
        }
        // Clear patient_id if manual patient fields are entered
        if ((name === 'patient_name' || name === 'patient_age' || name === 'patient_gender') && value) {
            setFormData(prev => ({ ...prev, patient_id: '' }));
        }
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

        // Patient validation - either existing patient or complete manual entry
        if (!formData.patient_id && !formData.patient_name) {
            setMessage({ type: 'error', text: 'Please select a patient or enter patient details manually' });
            return;
        }

        // If manual patient entry, validate all required fields
        if (!formData.patient_id) {
            if (!formData.patient_name) {
                setMessage({ type: 'error', text: 'Patient name is required' });
                return;
            }
            if (!formData.patient_age) {
                setMessage({ type: 'error', text: 'Patient age is required for manual entry' });
                return;
            }
            if (!formData.patient_gender) {
                setMessage({ type: 'error', text: 'Patient gender is required for manual entry' });
                return;
            }
        }

        if (!formData.scheduled_date || !formData.scheduled_time) {
            setMessage({ type: 'error', text: 'Please select date and time' });
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                'http://localhost:5000/api/surgeries',
                {
                    surgery_type: formData.procedure_name,
                    patient_id: formData.patient_id ? parseInt(formData.patient_id) : null,
                    patient_name: formData.patient_name || null,
                    patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
                    patient_gender: formData.patient_gender || null,
                    surgeon_id: formData.surgeon_id ? parseInt(formData.surgeon_id) : null,
                    nurse_id: formData.nurse_id ? parseInt(formData.nurse_id) : null,
                    anaesthetist_id: formData.anaesthetist_id ? parseInt(formData.anaesthetist_id) : null,
                    theatre_id: formData.theatre_id ? parseInt(formData.theatre_id) : null,
                    scheduled_date: formData.scheduled_date,
                    scheduled_time: formData.scheduled_time,
                    duration_minutes: parseInt(formData.duration_minutes) || 60,
                    status: 'scheduled',
                    priority: formData.priority || 'routine',
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Surgery scheduled successfully!' });

                // Reset form
                setFormData({
                    procedure_name: '',
                    patient_id: '',
                    patient_name: '',
                    patient_age: '',
                    patient_gender: '',
                    surgeon_id: '',
                    nurse_id: '',
                    anaesthetist_id: '',
                    theatre_id: '',
                    scheduled_date: '',
                    scheduled_time: '',
                    duration_minutes: '60',
                    priority: 'routine',
                });

                // Callback or navigate
                if (onSuccess) {
                    onSuccess(response.data.data);
                } else {
                    setTimeout(() => {
                        navigate('/surgeries');
                    }, 1500);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error scheduling surgery';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate(-1);
        }
    };

    // Input styles
    const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
    const labelClass = "block text-sm font-medium text-blue-600 mb-1.5";
    const selectClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2020%2020%22%20fill%3d%22%236b7280%22%3e%3cpath%20fill-rule%3d%22evenodd%22%20d%3d%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3d%22evenodd%22%2f%3e%3c%2fsvg%3e')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]";

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error/Success Message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

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

            {/* Priority Selector */}
            <div>
                <label className={labelClass}>Priority Level</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: 'routine' }))}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${formData.priority === 'routine'
                                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                            }`}
                    >
                        Routine
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: 'urgent' }))}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${formData.priority === 'urgent'
                                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                            }`}
                    >
                        Urgent
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: 'emergency' }))}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${formData.priority === 'emergency'
                                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                            }`}
                    >
                        🚨 Emergency
                    </button>
                </div>
            </div>

            {/* Patient Details Section */}
            <div className={`rounded-lg p-4 border-2 ${formData.priority === 'emergency'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Patient Details</h3>
                    {formData.priority === 'emergency' && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                            Emergency - Manual Entry Available
                        </span>
                    )}
                </div>

                {/* Existing Patient Selection */}
                <div className="mb-3">
                    <label className={labelClass}>Select Existing Patient</label>
                    <select
                        name="patient_id"
                        value={formData.patient_id}
                        onChange={handleChange}
                        className={selectClass}
                        disabled={!!(formData.patient_name || formData.patient_age || formData.patient_gender)}
                    >
                        <option value="">-- Select Patient --</option>
                        {MOCK_PATIENTS.map(patient => (
                            <option key={patient.id} value={patient.id}>
                                {patient.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Manual Patient Entry */}
                <div className="border-t border-gray-300 pt-3 mt-3">
                    <p className="text-xs text-gray-600 mb-3">
                        <strong>Or enter patient details manually</strong> (for emergency cases or new patients)
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className={labelClass}>Patient Name</label>
                            <input
                                type="text"
                                name="patient_name"
                                value={formData.patient_name}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Full Name"
                                disabled={!!formData.patient_id}
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
                                disabled={!!formData.patient_id}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Gender</label>
                            <select
                                name="patient_gender"
                                value={formData.patient_gender}
                                onChange={handleChange}
                                className={selectClass}
                                disabled={!!formData.patient_id}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Assignment - 3 column grid */}
            <div className="grid grid-cols-3 gap-4">
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

            {/* Theatre - Updated by M2 (Chandeepa) Day 8: API-driven with availability */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className={labelClass}>Theatre</label>
                    {checkingAvailability && (
                        <span className="text-xs text-blue-500 animate-pulse">Checking availability...</span>
                    )}
                    {theatreAvailability && !checkingAvailability && (
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
                    <option value="">{loadingTheatres ? 'Loading theatres...' : 'Select Theatre'}</option>
                    {theatres.map(theatre => {
                        const avail = theatreAvailability?.[theatre.id];
                        const isUnavailable = avail && !avail.available;
                        const label = `${theatre.name}${theatre.location ? ` - ${theatre.location}` : ''}${avail ? (avail.available ? ' ✅' : ' ❌ Unavailable') : ''}`;
                        return (
                            <option
                                key={theatre.id}
                                value={theatre.id}
                                disabled={isUnavailable}
                            >
                                {label}
                            </option>
                        );
                    })}
                </select>
                {formData.theatre_id && theatreAvailability?.[formData.theatre_id] && !theatreAvailability[formData.theatre_id].available && (
                    <p className="text-xs text-red-500 mt-1">
                        ⚠️ {theatreAvailability[formData.theatre_id].conflict_reason}
                    </p>
                )}
            </div>

            {/* Date, Time, Duration - 3 column grid */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="scheduled_date" className={labelClass}>Date</label>
                    <input
                        type="date"
                        id="scheduled_date"
                        name="scheduled_date"
                        value={formData.scheduled_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="scheduled_time" className={labelClass}>Start Time</label>
                    <input
                        type="time"
                        id="scheduled_time"
                        name="scheduled_time"
                        value={formData.scheduled_time}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor="duration_minutes" className={labelClass}>Duration (min)</label>
                    <input
                        type="number"
                        id="duration_minutes"
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

            {/* Form Actions */}
            <div className="flex justify-center gap-3 pt-4">
                <button
                    type="button"
                    onClick={handleClose}
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
                    {loading ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
            </div>
        </form>
    );

    // Modal wrapper
    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-5 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Schedule Surgery</h2>
                        <button
                            onClick={handleClose}
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
                        {formContent}
                    </div>
                </div>
            </div>
        );
    }

    // Full page version (for /create-surgery route)
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Schedule Surgery</h2>
                        <button
                            onClick={handleClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        {formContent}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurgeryForm;
