// ============================================================================
// Surgery Form Component
// ============================================================================
// Created by: M1 (Pasindu) - Day 5
// 
// Form for creating a new surgery
// Includes patient info, surgery details, scheduling, and resource assignment
// ============================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SurgeryForm = ({ onSuccess, onCancel }) => {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [surgeons, setSurgeons] = useState([]);
    const [loadingSurgeons, setLoadingSurgeons] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        // Patient Information
        patient_id: '',
        patient_name: '',
        patient_age: '',
        patient_gender: '',
        // Surgery Details
        surgery_type: '',
        description: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: '',
        // Resource Assignment
        theatre_id: '',
        surgeon_id: '',
        // Status and Priority
        status: 'scheduled',
        priority: 'routine',
        // Additional
        notes: ''
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

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Basic validation
        if (!formData.surgery_type || !formData.scheduled_date || !formData.scheduled_time || !formData.duration_minutes) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        // Patient validation
        if (!formData.patient_id && (!formData.patient_name || !formData.patient_age || !formData.patient_gender)) {
            setMessage({ type: 'error', text: 'Please provide patient information' });
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                'http://localhost:5000/api/surgeries',
                {
                    ...formData,
                    patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
                    duration_minutes: parseInt(formData.duration_minutes),
                    patient_id: formData.patient_id ? parseInt(formData.patient_id) : null,
                    theatre_id: formData.theatre_id ? parseInt(formData.theatre_id) : null,
                    surgeon_id: formData.surgeon_id ? parseInt(formData.surgeon_id) : null
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Surgery created successfully!' });
                
                // Clear form
                setFormData({
                    patient_id: '',
                    patient_name: '',
                    patient_age: '',
                    patient_gender: '',
                    surgery_type: '',
                    description: '',
                    scheduled_date: '',
                    scheduled_time: '',
                    duration_minutes: '',
                    theatre_id: '',
                    surgeon_id: '',
                    status: 'scheduled',
                    priority: 'routine',
                    notes: ''
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
            const errorMessage = error.response?.data?.message || 'Error creating surgery';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Schedule New Surgery</h1>
                    <p className="text-gray-600">Fill in the details to schedule a new surgery</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                    {/* Patient Information Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            👤 Patient Information
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Enter patient ID for existing patients, or fill in details manually
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient ID (if registered)
                                </label>
                                <input
                                    type="number"
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter patient ID"
                                />
                            </div>

                            <div className="md:col-span-2 border-t pt-4 mt-2">
                                <p className="text-sm font-medium text-gray-600 mb-3">
                                    Or enter patient details manually:
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="patient_name"
                                    value={formData.patient_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Full name"
                                    disabled={!!formData.patient_id}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient Age <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="patient_age"
                                    value={formData.patient_age}
                                    onChange={handleChange}
                                    min="0"
                                    max="150"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Age"
                                    disabled={!!formData.patient_id}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="patient_gender"
                                    value={formData.patient_gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={!!formData.patient_id}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Surgery Details Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            🏥 Surgery Details
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Surgery Type <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="surgery_type"
                                    value={formData.surgery_type}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Appendectomy, Knee Replacement"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Additional details about the surgery..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="routine">Routine</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Scheduling Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            📅 Scheduling
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="scheduled_date"
                                    value={formData.scheduled_date}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="scheduled_time"
                                    value={formData.scheduled_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (minutes) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleChange}
                                    required
                                    min="15"
                                    step="15"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 60, 90, 120"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resource Assignment Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            👨‍⚕️ Resource Assignment
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Surgeon
                                </label>
                                <select
                                    name="surgeon_id"
                                    value={formData.surgeon_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loadingSurgeons}
                                >
                                    <option value="">
                                        {loadingSurgeons ? 'Loading surgeons...' : 'Select a surgeon'}
                                    </option>
                                    {surgeons.map(surgeon => (
                                        <option key={surgeon.id} value={surgeon.id}>
                                            {surgeon.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Theatre ID
                                </label>
                                <input
                                    type="number"
                                    name="theatre_id"
                                    value={formData.theatre_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Theatre number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            📝 Additional Notes
                        </h2>
                        
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Any additional notes or special requirements..."
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Surgery...' : 'Schedule Surgery'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel || (() => navigate(-1))}
                            disabled={loading}
                            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SurgeryForm;
