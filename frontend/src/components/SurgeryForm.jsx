
// Surgery Form Component - Modal Style

// Created by: M1 (Pasindu) - Day 5
// Updated by: M6 (Dinil) - Day 5 - New modal UI design
// Updated by: M1 (Pasindu) - Day 9 - Surgeon availability filtering
// Updated by: M2 (Chandeepa) - Day 9 - Multi-select nurses with availability
// Updated by: M3 (Janani) - Day 9 - Anaesthetist dropdown with availability
// Updated by: M4 (Oneli) - Day 9 - Staff conflict warning integration
// 
// Clean modal form for scheduling surgeries


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import surgeryService from '../services/surgeryService';
import StaffConflictWarning from './StaffConflictWarning';

// Mock data for dropdowns (replace with API calls when available)
const MOCK_PATIENTS = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Michael Brown' },
    { id: 4, name: 'Emily Davis' },
];

// MOCK_ANAESTHETISTS removed — now fetched from API (M3 - Day 9)

// MOCK_THEATRES removed — now fetched from API (M2 - Day 8)

const SurgeryForm = ({ onSuccess, onCancel, isModal = true }) => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Surgeon State
    const [surgeons, setSurgeons] = useState([]);
    const [loadingSurgeons, setLoadingSurgeons] = useState(true);
    const [surgeonAvailability, setSurgeonAvailability] = useState(null);
    const [checkingSurgeonAvail, setCheckingSurgeonAvail] = useState(false);

    // Nurse state - M2 (Chandeepa) Day 9
    const [nurses, setNurses] = useState([]);
    const [loadingNurses, setLoadingNurses] = useState(true);
    const [nurseAvailability, setNurseAvailability] = useState(null); // map of id -> { available, conflict_reason }
    const [checkingNurseAvail, setCheckingNurseAvail] = useState(false);

    // Anaesthetist state - M3 (Janani) Day 9
    const [anaesthetists, setAnaesthetists] = useState([]);
    const [loadingAnaesthetists, setLoadingAnaesthetists] = useState(true);
    const [anaesthetistAvailability, setAnaesthetistAvailability] = useState(null);
    const [checkingAnaesAvail, setCheckingAnaesAvail] = useState(false);

    // Staff conflict warnings - M4 (Oneli) Day 9
    const [staffConflicts, setStaffConflicts] = useState(null);
    const [checkingStaffConflicts, setCheckingStaffConflicts] = useState(false);

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
        nurse_ids: [],  // M2 Day 9: array of up to 3 nurse IDs
        anaesthetist_id: '',
        theatre_id: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: '60',
        priority: 'routine',
    });

    // Fetch initial data (Surgeons, Nurses, Anaesthetists, Theatres)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [surgeonsRes, nursesRes, anaesthetistsRes, theatresRes] = await Promise.all([
                    surgeryService.getSurgeons(),
                    axios.get('http://localhost:5000/api/users?role=nurse', { headers: { Authorization: `Bearer ${token}` } }).then(res => ({ success: true, data: res.data.data.filter(u => u.role === 'nurse') })).catch(() => ({ success: false, data: [] })),
                    axios.get('http://localhost:5000/api/users?role=anaesthetist', { headers: { Authorization: `Bearer ${token}` } }).then(res => ({ success: true, data: res.data.data.filter(u => u.role === 'anaesthetist') })).catch(() => ({ success: false, data: [] })),
                    surgeryService.getTheatres()
                ]);

                if (surgeonsRes.success) setSurgeons(surgeonsRes.data);
                if (nursesRes.success) setNurses(nursesRes.data);
                // Fallback for nurses/anaesthetists if the filtered user endpoint isn't perfectly set up yet
                // But ideally surgeryService should have specific methods or we use generic user fetch. 
                // For now, let's use the fetched data.
                // Note: The previous axios.get calls above are a bit hacky if the endpoint doesn't support role filtering directly like that.
                // Let's assume there's a generic way or we'll rely on the availability endpoints to populate the lists fully if needed.
                // Actually, let's use the availability endpoints to get the lists initially (without params they might error or return empty).
                // Better approach: Use the getAvailable... methods with dummy params or just wait for date selection.
                // BUT we want to show the list even before date selection.
                // So we will stick to fetching all users and filtering by role if the API supports it, or assume api/users returns all.

                // Refined approach for Nurses/Anaesthetists:
                // Since we don't have explicit `getNurses` in service yet, we can rely on `getAvailableNurses` when date is selected,
                // OR we can fetch all users and filter.
                // Let's try to fetch all users and filter for now as a fallback.
                const usersRes = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } });
                if (usersRes.data.success) {
                    setNurses(usersRes.data.data.filter(u => u.role === 'nurse'));
                    setAnaesthetists(usersRes.data.data.filter(u => u.role === 'anaesthetist'));
                }

                if (theatresRes.success) setTheatres(theatresRes.data);

            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setLoadingSurgeons(false);
                setLoadingNurses(false);
                setLoadingAnaesthetists(false);
                setLoadingTheatres(false);
            }
        };

        if (token) {
            fetchInitialData();
        }
    }, [token]);

    // Check staff & theatre availability when date/time/duration change
    const checkAllAvailability = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes } = formData;
        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setSurgeonAvailability(null);
            setNurseAvailability(null);
            setAnaesthetistAvailability(null);
            setTheatreAvailability(null);
            return;
        }

        try {
            setCheckingSurgeonAvail(true);
            setCheckingNurseAvail(true);
            setCheckingAnaesAvail(true);
            setCheckingAvailability(true); // Theatre

            const [surgeonRes, nurseRes, anaesthetistRes, theatreRes] = await Promise.all([
                surgeryService.getAvailableSurgeons(scheduled_date, scheduled_time, duration_minutes),
                surgeryService.getAvailableNurses(scheduled_date, scheduled_time, duration_minutes),
                surgeryService.getAvailableAnaesthetists(scheduled_date, scheduled_time, duration_minutes),
                surgeryService.checkTheatreAvailability(scheduled_date, scheduled_time, duration_minutes)
            ]);

            // Process Surgeon Availability
            if (surgeonRes.success) {
                setSurgeons(surgeonRes.data);
                const availMap = {};
                surgeonRes.data.forEach(s => availMap[s.id] = { available: s.available, conflict_reason: s.conflict_reason });
                setSurgeonAvailability(availMap);
            }

            // Process Nurse Availability
            if (nurseRes.success) {
                setNurses(nurseRes.data);
                setLoadingNurses(false);
                const availMap = {};
                nurseRes.data.forEach(n => availMap[n.id] = { available: n.available, conflict_reason: n.conflict_reason });
                setNurseAvailability(availMap);
            }

            // Process Anaesthetist Availability
            if (anaesthetistRes.success) {
                setAnaesthetists(anaesthetistRes.data);
                setLoadingAnaesthetists(false);
                const availMap = {};
                anaesthetistRes.data.forEach(a => availMap[a.id] = { available: a.available, conflict_reason: a.conflict_reason });
                setAnaesthetistAvailability(availMap);
            }

            // Process Theatre Availability
            if (theatreRes.success) {
                setTheatres(theatreRes.data);
                setLoadingTheatres(false);
                const availMap = {};
                theatreRes.data.forEach(t => availMap[t.id] = { available: t.available, conflict_reason: t.conflict_reason });
                setTheatreAvailability(availMap);
            }

        } catch (error) {
            console.error('Error checking availability:', error);
        } finally {
            setCheckingSurgeonAvail(false);
            setCheckingNurseAvail(false);
            setCheckingAnaesAvail(false);
            setCheckingAvailability(false);
        }
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes]);

    useEffect(() => {
        checkAllAvailability();
    }, [checkAllAvailability]);

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
                duration_minutes
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
            // If availability check fails, still try to load nurses list
            if (nurses.length === 0) {
                setLoadingNurses(false);
            }
        } finally {
            setCheckingNurseAvail(false);
        }
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes]);

    useEffect(() => {
        checkNurseAvailability();
    }, [checkNurseAvailability]);

    // Check anaesthetist availability when date/time/duration change - M3 (Janani) Day 9
    const checkAnaesthetistAvailability = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes } = formData;
        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setAnaesthetistAvailability(null);
            return;
        }

        try {
            setCheckingAnaesAvail(true);
            const result = await surgeryService.getAvailableAnaesthetists(
                scheduled_date,
                scheduled_time,
                duration_minutes
            );
            if (result.success) {
                setAnaesthetists(result.data);
                setLoadingAnaesthetists(false);
                const availMap = {};
                result.data.forEach(a => {
                    availMap[a.id] = { available: a.available, conflict_reason: a.conflict_reason };
                });
                setAnaesthetistAvailability(availMap);
            }
        } catch (error) {
            console.error('Error checking anaesthetist availability:', error);
            if (anaesthetists.length === 0) {
                setLoadingAnaesthetists(false);
            }
        } finally {
            setCheckingAnaesAvail(false);
        }
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes]);

    useEffect(() => {
        checkAnaesthetistAvailability();
    }, [checkAnaesthetistAvailability]);

    // Check staff conflicts when any staff selection changes - M4 (Oneli) Day 9
    const checkStaffConflictsCallback = useCallback(async () => {
        const { scheduled_date, scheduled_time, duration_minutes, surgeon_id, nurse_ids, anaesthetist_id } = formData;
        
        // Only check if we have date/time/duration and at least one staff member
        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            setStaffConflicts(null);
            return;
        }
        
        const hasStaff = surgeon_id || anaesthetist_id || (nurse_ids && nurse_ids.length > 0);
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
                nurse_ids: nurse_ids.map(Number).filter(id => !isNaN(id))
            });
            if (result.success) {
                setStaffConflicts(result);
            }
        } catch (error) {
            console.error('Error checking staff conflicts:', error);
        } finally {
            setCheckingStaffConflicts(false);
        }
    }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes, 
        formData.surgeon_id, formData.nurse_ids, formData.anaesthetist_id]);

    // Debounced staff conflict check
    useEffect(() => {
        const timer = setTimeout(() => {
            checkStaffConflictsCallback();
        }, 500); // 500ms debounce to avoid excessive API calls

        return () => clearTimeout(timer);
    }, [checkStaffConflictsCallback]);

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

    // Handle nurse checkbox toggle - M2 (Chandeepa) Day 9
    const handleNurseToggle = (nurseId) => {
        setFormData(prev => {
            const currentIds = prev.nurse_ids;
            if (currentIds.includes(nurseId)) {
                // Remove nurse
                return { ...prev, nurse_ids: currentIds.filter(id => id !== nurseId) };
            } else if (currentIds.length < 3) {
                // Add nurse (max 3)
                return { ...prev, nurse_ids: [...currentIds, nurseId] };
            }
            return prev; // Already at max
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

            // Check for conflicts one last time before submitting (Server-side check)
            const conflictCheck = await surgeryService.checkConflicts({
                scheduled_date: formData.scheduled_date,
                scheduled_time: formData.scheduled_time,
                duration_minutes: formData.duration_minutes,
                theatre_id: formData.theatre_id,
                surgeon_id: formData.surgeon_id,
                nurse_ids: formData.nurse_id ? [formData.nurse_id] : [], // passing as array for future proofing
                nurse_id: formData.nurse_id, // passing as single ID for current logic
                anaesthetist_id: formData.anaesthetist_id
            });

            if (conflictCheck.has_conflicts) {
                const conflictMsg = conflictCheck.conflicts.map(c => c.message).join('. ');
                setMessage({ type: 'error', text: `Schedule Conflict: ${conflictMsg}` });
                setLoading(false);
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/surgeries',
                {
                    surgery_type: formData.procedure_name,
                    patient_id: formData.patient_id ? parseInt(formData.patient_id) : null,
                    patient_name: formData.patient_name || null,
                    patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
                    patient_gender: formData.patient_gender || null,
                    surgeon_id: formData.surgeon_id ? parseInt(formData.surgeon_id) : null,
                    nurse_ids: formData.nurse_ids.map(Number),  // M2 Day 9: send nurse_ids array
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
                    nurse_ids: [],
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

                {/* Nurse */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className={labelClass}>Anaesthetist</label>
                        {checkingAnaesAvail && (
                            <span className="text-xs text-blue-500 animate-pulse">Checking...</span>
                        )}
                        {anaesthetistAvailability && !checkingAnaesAvail && (
                            <span className="text-xs text-green-600">
                                {Object.values(anaesthetistAvailability).filter(a => a.available).length} available
                            </span>
                        )}
                    </div>
                    <select
                        name="anaesthetist_id"
                        value={formData.anaesthetist_id}
                        onChange={handleChange}
                        className={selectClass}
                        disabled={loadingAnaesthetists}
                    >
                        <option value="">{loadingAnaesthetists ? 'Loading...' : 'Select Anaesthetist'}</option>
                        {anaesthetists.map(anaes => {
                            const avail = anaesthetistAvailability?.[anaes.id];
                            const isUnavailable = avail && !avail.available;
                            const label = `${anaes.name}${avail ? (avail.available ? ' ✅' : ' ❌ Busy') : ''}`;
                            return (
                                <option
                                    key={anaes.id}
                                    value={anaes.id}
                                    disabled={isUnavailable}
                                >
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    {formData.anaesthetist_id && anaesthetistAvailability?.[formData.anaesthetist_id] && !anaesthetistAvailability[formData.anaesthetist_id].available && (
                        <p className="text-xs text-red-500 mt-1">
                            ⚠️ {anaesthetistAvailability[formData.anaesthetist_id].conflict_reason}
                        </p>
                    )}
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
                                const isSelected = formData.nurse_ids.includes(String(nurse.id)) || formData.nurse_ids.includes(nurse.id);
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
                {/* Show conflict warnings for selected unavailable nurses */}
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

            {/* Staff Conflict Warnings - M4 (Oneli) Day 9 */}
            <StaffConflictWarning
                warnings={staffConflicts?.warnings || []}
                loading={checkingStaffConflicts}
                className="mt-4"
            />

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
