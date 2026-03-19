// ============================================================================
// NurseForm Component
// ============================================================================
// Created by: M4 (Oneli) - Day 13
//
// Modal form for adding a new nurse.
// Fields: name, email, phone, specialization, license_number,
//         years_of_experience, shift_preference
// On submit → calls nurseService.createNurse()
// ============================================================================

import { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import nurseService from '../services/nurseService';

const SHIFT_OPTIONS = [
    { value: 'flexible', label: 'Flexible' },
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'night', label: 'Night' },
];

const NurseForm = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        license_number: '',
        years_of_experience: '',
        shift_preference: 'flexible',
        is_available: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim() || undefined,
                specialization: formData.specialization.trim() || undefined,
                license_number: formData.license_number.trim() || undefined,
                years_of_experience: formData.years_of_experience !== ''
                    ? parseInt(formData.years_of_experience, 10)
                    : undefined,
                shift_preference: formData.shift_preference,
                is_available: formData.is_available,
            };

            const response = await nurseService.createNurse(payload);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess?.(response.data);
                }, 1200);
            }
        } catch (err) {
            setError(err.message || 'Failed to create nurse.');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Add New Nurse</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Fill in the nurse&apos;s details below</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Success banner */}
                {success && (
                    <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Nurse created successfully!</span>
                    </div>
                )}

                {/* Error banner */}
                {error && (
                    <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="nurse-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Jane Smith"
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="nurse-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="nurse@hospital.com"
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Phone + Specialization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone</label>
                            <input
                                id="nurse-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. 0771234567"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Specialization</label>
                            <input
                                id="nurse-specialization"
                                type="text"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                placeholder="e.g. ICU, Cardiac"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* License + Years Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">License Number</label>
                            <input
                                id="nurse-license"
                                type="text"
                                name="license_number"
                                value={formData.license_number}
                                onChange={handleChange}
                                placeholder="e.g. LN-12345"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Years of Experience</label>
                            <input
                                id="nurse-experience"
                                type="number"
                                name="years_of_experience"
                                value={formData.years_of_experience}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                max="60"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Shift Preference + Availability */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Shift Preference</label>
                            <select
                                id="nurse-shift"
                                name="shift_preference"
                                value={formData.shift_preference}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                {SHIFT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                id="nurse-available"
                                type="checkbox"
                                name="is_available"
                                checked={formData.is_available}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="nurse-available" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                Available for assignment
                            </label>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            id="nurse-submit"
                            type="submit"
                            disabled={loading || success}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Add Nurse
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NurseForm;
