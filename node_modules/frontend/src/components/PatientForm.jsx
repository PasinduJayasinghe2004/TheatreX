// ============================================================================
// PatientForm Component
// ============================================================================
// Created by: M1 (Pasindu) - Day 15
// Updated by: M2 (Chandeepa) - Day 15
//
// Modal form for adding or editing a patient.
// Fields: name, date_of_birth, gender, blood_type, phone, email, address,
//         emergency contact info, medical history, allergies, medications
//
// Props:
//   patient   - (optional) existing patient object for edit mode
//   onSuccess - callback with the created/updated patient data
//   onClose   - callback to close the modal
// ============================================================================

import { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, AlertCircle, CheckCircle } from 'lucide-react';
import patientService from '../services/patientService';

const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

const BLOOD_TYPE_OPTIONS = [
    { value: '', label: 'Select Blood Type' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
];

const PatientForm = ({ patient, onSuccess, onClose }) => {
    const isEditMode = Boolean(patient?.id);

    const [formData, setFormData] = useState({
        name: patient?.name || '',
        date_of_birth: patient?.date_of_birth
            ? new Date(patient.date_of_birth).toISOString().slice(0, 10)
            : '',
        gender: patient?.gender || 'male',
        blood_type: patient?.blood_type || '',
        phone: patient?.phone || '',
        email: patient?.email || '',
        address: patient?.address || '',
        emergency_contact_name: patient?.emergency_contact_name || '',
        emergency_contact_phone: patient?.emergency_contact_phone || '',
        emergency_contact_relationship: patient?.emergency_contact_relationship || '',
        medical_history: patient?.medical_history || '',
        allergies: patient?.allergies || '',
        current_medications: patient?.current_medications || '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Pre-fill when editing
    useEffect(() => {
        if (patient) {
            // Format date_of_birth to YYYY-MM-DD for input[type=date]
            let dob = patient.date_of_birth || '';
            if (dob && dob.length > 10) {
                dob = dob.substring(0, 10);
            }

            setFormData({
                name: patient.name || '',
                date_of_birth: dob,
                gender: patient.gender || 'male',
                blood_type: patient.blood_type || '',
                phone: patient.phone || '',
                email: patient.email || '',
                address: patient.address || '',
                emergency_contact_name: patient.emergency_contact_name || '',
                emergency_contact_phone: patient.emergency_contact_phone || '',
                emergency_contact_relationship: patient.emergency_contact_relationship || '',
                medical_history: patient.medical_history || '',
                allergies: patient.allergies || '',
                current_medications: patient.current_medications || '',
            });
        }
    }, [patient]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                blood_type: formData.blood_type || undefined,
                phone: formData.phone.trim(),
                email: formData.email.trim() || undefined,
                address: formData.address.trim() || undefined,
                emergency_contact_name: formData.emergency_contact_name.trim() || undefined,
                emergency_contact_phone: formData.emergency_contact_phone.trim() || undefined,
                emergency_contact_relationship: formData.emergency_contact_relationship.trim() || undefined,
                medical_history: formData.medical_history.trim() || undefined,
                allergies: formData.allergies.trim() || undefined,
                current_medications: formData.current_medications.trim() || undefined,
            };

            let response;
            if (isEditMode) {
                response = await patientService.updatePatient(patient.id, payload);
            } else {
                response = await patientService.createPatient(payload);
            }

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess?.(response.data);
                }, 1200);
            }
        } catch (err) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} patient.`);
        } finally {
            setLoading(false);
        }
    };

    // Common input class
    const inputCls = 'w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';
    const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1';

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEditMode ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                            {isEditMode
                                ? <Edit3 className="w-5 h-5 text-blue-600" />
                                : <UserPlus className="w-5 h-5 text-emerald-600" />
                            }
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">{isEditMode ? 'Edit Patient' : 'Add New Patient'}</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{isEditMode ? 'Update the patient\'s details below' : 'Fill in the patient\'s details below'}</p>
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
                        <span className="text-sm font-medium">Patient {isEditMode ? 'updated' : 'created'} successfully!</span>
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
                    {/* ── Personal Information ────────────────── */}
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Personal Information</p>

                    {/* Name + DOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="patient-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                required
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="patient-dob"
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                required
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Gender + Blood Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="patient-gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={inputCls}
                            >
                                {GENDER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Blood Type</label>
                            <select
                                id="patient-blood-type"
                                name="blood_type"
                                value={formData.blood_type}
                                onChange={handleChange}
                                className={inputCls}
                            >
                                {BLOOD_TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Contact Information ─────────────────── */}
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider pt-2">Contact Information</p>

                    {/* Phone + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="patient-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. 0771234567"
                                required
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Email</label>
                            <input
                                id="patient-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="patient@email.com"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className={labelCls}>Address</label>
                        <input
                            id="patient-address"
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Main Street, Colombo"
                            className={inputCls}
                        />
                    </div>

                    {/* ── Emergency Contact ───────────────────── */}
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider pt-2">Emergency Contact</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>Contact Name</label>
                            <input
                                id="patient-ec-name"
                                type="text"
                                name="emergency_contact_name"
                                value={formData.emergency_contact_name}
                                onChange={handleChange}
                                placeholder="Jane Doe"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Contact Phone</label>
                            <input
                                id="patient-ec-phone"
                                type="tel"
                                name="emergency_contact_phone"
                                value={formData.emergency_contact_phone}
                                onChange={handleChange}
                                placeholder="0771112223"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Relationship</label>
                            <input
                                id="patient-ec-relation"
                                type="text"
                                name="emergency_contact_relationship"
                                value={formData.emergency_contact_relationship}
                                onChange={handleChange}
                                placeholder="Spouse"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* ── Medical Information ─────────────────── */}
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider pt-2">Medical Information</p>

                    <div>
                        <label className={labelCls}>Medical History</label>
                        <textarea
                            id="patient-medical-history"
                            name="medical_history"
                            value={formData.medical_history}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Previous surgeries, conditions, etc."
                            className={inputCls + ' resize-none'}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Allergies</label>
                            <textarea
                                id="patient-allergies"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                rows={2}
                                placeholder="e.g. Penicillin, Latex"
                                className={inputCls + ' resize-none'}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Current Medications</label>
                            <textarea
                                id="patient-medications"
                                name="current_medications"
                                value={formData.current_medications}
                                onChange={handleChange}
                                rows={2}
                                placeholder="e.g. Aspirin 100mg daily"
                                className={inputCls + ' resize-none'}
                            />
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
                            id="patient-submit"
                            type="submit"
                            disabled={loading || success}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isEditMode ? 'Updating…' : 'Saving…'}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                    {isEditMode ? 'Update Patient' : 'Add Patient'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientForm;
