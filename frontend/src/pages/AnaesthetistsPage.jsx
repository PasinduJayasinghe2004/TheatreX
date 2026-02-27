// ============================================================================
// Anaesthetists Page
// ============================================================================
// Created by: M5 (Inthusha) - Day 13
// Updated by: M3 (Janani)   - Day 14 (added Edit/Delete modals, search, stats)
//
// FEATURES:
// - Lists all active anaesthetists with search filter
// - Create New Anaesthetist modal (admin only)
// - Edit Anaesthetist modal (coordinator/admin)
// - Delete Anaesthetist confirmation modal (coordinator/admin)
// - Summary stats strip
// - Loading skeleton, empty state, error handling
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import anaesthetistService from '../services/anaesthetistService';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Availability pill badge */
const AvailBadge = ({ available }) =>
    available ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Available
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Unavailable
        </span>
    );

/** Loading skeleton card */
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Shared form field helpers
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FIELD_ERRORS = {
    name: '',
    specialization: '',
    license_number: '',
    email: '',
    phone: '',
    years_of_experience: '',
    qualification: '',
};

const buildFieldCls = (fieldErrors) => (fieldName) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition ${
        fieldErrors[fieldName] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

const FieldError = ({ fieldErrors, field }) =>
    fieldErrors[field] ? (
        <p className="text-xs text-red-500 mt-1">{fieldErrors[field]}</p>
    ) : null;

/** Client-side validation for anaesthetist forms */
const validateAnaesthetistForm = (form, setFieldErrors) => {
    const errs = { ...EMPTY_FIELD_ERRORS };
    let valid = true;

    if (!form.name.trim()) {
        errs.name = 'Full name is required';
        valid = false;
    } else if (form.name.trim().length < 2) {
        errs.name = 'Name must be at least 2 characters';
        valid = false;
    }

    if (!form.specialization.trim()) {
        errs.specialization = 'Specialization is required';
        valid = false;
    }

    if (!form.license_number.trim()) {
        errs.license_number = 'Licence number is required';
        valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
        errs.email = 'Email is required';
        valid = false;
    } else if (!emailRegex.test(form.email)) {
        errs.email = 'Enter a valid email address';
        valid = false;
    }

    if (form.years_of_experience !== '' && form.years_of_experience !== null && form.years_of_experience !== undefined) {
        const yoe = Number(form.years_of_experience);
        if (isNaN(yoe) || yoe < 0 || !Number.isInteger(yoe)) {
            errs.years_of_experience = 'Must be a non-negative whole number';
            valid = false;
        }
    }

    setFieldErrors(errs);
    return valid;
};

// ─────────────────────────────────────────────────────────────────────────────
// Anaesthetist Card
// Updated by: M3 (Janani) - Day 14 (added edit/delete buttons)
// ─────────────────────────────────────────────────────────────────────────────
const AnaesthetistCard = ({ anaesthetist, canEdit, onEdit, onDelete }) => {
    const initials = anaesthetist.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">{initials}</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{anaesthetist.name}</h3>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">{anaesthetist.specialization}</p>
                    </div>
                </div>
                <AvailBadge available={anaesthetist.is_available} />
            </div>

            <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-500">Licence:</span>
                    <span className="font-medium text-gray-900">{anaesthetist.license_number}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{anaesthetist.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{anaesthetist.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Shift: <span className="capitalize">{anaesthetist.shift_preference}</span></span>
                </div>
                {anaesthetist.years_of_experience != null && (
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c-4.97 0-9 4.03-9 9 0 1.222.243 2.387.684 3.449m4.419 3.012A9.992 9.992 0 0110.201 3.65M16.5 7.5l-9 9" />
                        </svg>
                        <span>{anaesthetist.years_of_experience} yr{anaesthetist.years_of_experience !== 1 ? 's' : ''} experience</span>
                    </div>
                )}
            </div>

            {/* Footer: action buttons */}
            {canEdit && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-1">
                    <button
                        id={`edit-anaesthetist-${anaesthetist.id}`}
                        onClick={() => onEdit(anaesthetist)}
                        title="Edit anaesthetist"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        aria-label={`Edit ${anaesthetist.name}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        id={`delete-anaesthetist-${anaesthetist.id}`}
                        onClick={() => onDelete(anaesthetist)}
                        title="Delete anaesthetist"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`Delete ${anaesthetist.name}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

const EMPTY_FORM = {
    name: '',
    email: '',
    phone: '',
    specialization: '',
    license_number: '',
    years_of_experience: '',
    qualification: '',
    shift_preference: 'flexible'
};

// ─────────────────────────────────────────────────────────────────────────────
// Create Anaesthetist Modal
// ─────────────────────────────────────────────────────────────────────────────
const CreateAnaesthetistModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
    const [serverErrors, setServerErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const fieldCls = buildFieldCls(fieldErrors);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerErrors([]);
        if (!validateAnaesthetistForm(form, setFieldErrors)) return;
        setSubmitting(true);
        try {
            const result = await anaesthetistService.createAnaesthetist(form);
            onCreated(result.data);
        } catch (err) {
            setServerErrors([err.message]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Add New Anaesthetist</h2>
                    </div>
                    <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form id="create-anaesthetist-form" onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {serverErrors.length > 0 && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            {serverErrors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} className={fieldCls('name')} placeholder="Dr. John Smith" />
                        <FieldError fieldErrors={fieldErrors} field="name" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Specialization <span className="text-red-500">*</span></label>
                            <input type="text" name="specialization" value={form.specialization} onChange={handleChange} className={fieldCls('specialization')} placeholder="General / Pediatric" />
                            <FieldError fieldErrors={fieldErrors} field="specialization" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Licence Number <span className="text-red-500">*</span></label>
                            <input type="text" name="license_number" value={form.license_number} onChange={handleChange} className={fieldCls('license_number')} placeholder="LK-ANS-2024-001" />
                            <FieldError fieldErrors={fieldErrors} field="license_number" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className={fieldCls('email')} placeholder="john@hospital.com" />
                            <FieldError fieldErrors={fieldErrors} field="email" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={fieldCls('phone')} placeholder="+94 77 000 0000" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Experience (Years)</label>
                            <input type="number" name="years_of_experience" value={form.years_of_experience} onChange={handleChange} className={fieldCls('years_of_experience')} placeholder="5" min="0" max="60" />
                            <FieldError fieldErrors={fieldErrors} field="years_of_experience" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Shift Preference</label>
                            <select name="shift_preference" value={form.shift_preference} onChange={handleChange} className={fieldCls('shift_preference')}>
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="night">Night</option>
                                <option value="flexible">Flexible</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Qualification</label>
                        <input type="text" name="qualification" value={form.qualification} onChange={handleChange} className={fieldCls('qualification')} placeholder="MBBS, MD Anaesthesiology" />
                    </div>
                </form>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" form="create-anaesthetist-form" disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {submitting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving…
                            </>
                        ) : 'Add Anaesthetist'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Edit Anaesthetist Modal
// Created by: M3 (Janani) - Day 14
// ─────────────────────────────────────────────────────────────────────────────
const EditAnaesthetistModal = ({ anaesthetist, onClose, onUpdated }) => {
    const [form, setForm] = useState({
        name: anaesthetist.name ?? '',
        email: anaesthetist.email ?? '',
        phone: anaesthetist.phone ?? '',
        specialization: anaesthetist.specialization ?? '',
        license_number: anaesthetist.license_number ?? '',
        years_of_experience: anaesthetist.years_of_experience ?? '',
        qualification: anaesthetist.qualification ?? '',
        shift_preference: anaesthetist.shift_preference ?? 'flexible',
        is_available: anaesthetist.is_available ?? true,
    });
    const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
    const [serverErrors, setServerErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const fieldCls = buildFieldCls(fieldErrors);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerErrors([]);
        if (!validateAnaesthetistForm(form, setFieldErrors)) return;
        setSubmitting(true);
        try {
            const result = await anaesthetistService.updateAnaesthetist(anaesthetist.id, form);
            onUpdated(result.data);
        } catch (err) {
            setServerErrors([err.message]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Edit Anaesthetist</h2>
                    </div>
                    <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form id="edit-anaesthetist-form" onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {serverErrors.length > 0 && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            {serverErrors.map((e, i) => (
                                <p key={i} className="text-xs text-red-600">{e}</p>
                            ))}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input id="edit-anaes-name" type="text" name="name" value={form.name} onChange={handleChange}
                            className={fieldCls('name')} />
                        <FieldError fieldErrors={fieldErrors} field="name" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Specialization <span className="text-red-500">*</span>
                            </label>
                            <input id="edit-anaes-specialization" type="text" name="specialization"
                                value={form.specialization} onChange={handleChange} className={fieldCls('specialization')} />
                            <FieldError fieldErrors={fieldErrors} field="specialization" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Licence Number <span className="text-red-500">*</span>
                            </label>
                            <input id="edit-anaes-license" type="text" name="license_number"
                                value={form.license_number} onChange={handleChange} className={fieldCls('license_number')} />
                            <FieldError fieldErrors={fieldErrors} field="license_number" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input id="edit-anaes-email" type="email" name="email" value={form.email}
                                onChange={handleChange} className={fieldCls('email')} />
                            <FieldError fieldErrors={fieldErrors} field="email" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input id="edit-anaes-phone" type="tel" name="phone" value={form.phone}
                                onChange={handleChange} className={fieldCls('phone')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Experience (Years)</label>
                            <input id="edit-anaes-yoe" type="number" name="years_of_experience"
                                value={form.years_of_experience} onChange={handleChange} min="0" max="60"
                                className={fieldCls('years_of_experience')} />
                            <FieldError fieldErrors={fieldErrors} field="years_of_experience" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Shift Preference</label>
                            <select id="edit-anaes-shift" name="shift_preference" value={form.shift_preference}
                                onChange={handleChange} className={fieldCls('shift_preference')}>
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="night">Night</option>
                                <option value="flexible">Flexible</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Qualification</label>
                        <input id="edit-anaes-qualification" type="text" name="qualification"
                            value={form.qualification} onChange={handleChange} className={fieldCls('qualification')} />
                    </div>

                    <div className="flex items-center gap-3">
                        <input id="edit-anaes-available" type="checkbox" name="is_available" checked={form.is_available}
                            onChange={handleChange} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                        <label htmlFor="edit-anaes-available" className="text-xs font-medium text-gray-700 cursor-pointer">
                            Mark as available
                        </label>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="edit-anaesthetist-form" disabled={submitting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {submitting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving…
                            </>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete Anaesthetist Confirmation Modal
// Created by: M3 (Janani) - Day 14
// ─────────────────────────────────────────────────────────────────────────────
const DeleteAnaesthetistModal = ({ anaesthetist, onClose, onDeleted }) => {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setError(null);
        setDeleting(true);
        try {
            await anaesthetistService.deleteAnaesthetist(anaesthetist.id);
            onDeleted(anaesthetist.id);
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Delete Anaesthetist</h2>
                    </div>
                    <button onClick={onClose} className="text-red-200 hover:text-white transition-colors" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Are you sure you want to delete <span className="font-bold">{anaesthetist.name}</span>?
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                This action will deactivate the anaesthetist record. Their assignment history will be preserved.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        id={`confirm-delete-anaesthetist-${anaesthetist.id}`}
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {deleting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Deleting…
                            </>
                        ) : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const AnaesthetistsPage = () => {
    const { user } = useAuth();

    const [anaesthetists, setAnaesthetists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAnaesthetist, setEditingAnaesthetist] = useState(null);
    const [deletingAnaesthetist, setDeletingAnaesthetist] = useState(null);

    // Filter state
    const [search, setSearch] = useState('');

    const canCreate = user?.role === 'admin';
    const canEdit = user?.role === 'coordinator' || user?.role === 'admin';

    // ── Fetch anaesthetists ───────────────────────────────────────────────────
    const fetchAnaesthetists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await anaesthetistService.getAllAnaesthetists();
            setAnaesthetists(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnaesthetists();
    }, [fetchAnaesthetists]);

    // ── Handle anaesthetist created ─────────────────────────────────────────
    const handleCreated = (newAnaesthetist) => {
        setShowCreateModal(false);
        setAnaesthetists(prev => [newAnaesthetist, ...prev]);
    };

    // ── Handle anaesthetist updated (Day 14) ────────────────────────────────
    const handleUpdated = (updatedAnaesthetist) => {
        setEditingAnaesthetist(null);
        setAnaesthetists(prev =>
            prev.map(a => (a.id === updatedAnaesthetist.id ? { ...a, ...updatedAnaesthetist } : a))
        );
    };

    // ── Handle anaesthetist deleted (Day 14) ────────────────────────────────
    const handleDeleted = (deletedId) => {
        setDeletingAnaesthetist(null);
        setAnaesthetists(prev => prev.filter(a => a.id !== deletedId));
    };

    // ── Client-side search filtering ────────────────────────────────────────
    const filtered = anaesthetists.filter(a => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            a.name?.toLowerCase().includes(q) ||
            a.specialization?.toLowerCase().includes(q) ||
            a.email?.toLowerCase().includes(q)
        );
    });

    // ── Stats strip ──────────────────────────────────────────────────────────
    const totalAvailable = anaesthetists.filter(a => a.is_available).length;
    const totalUnavailable = anaesthetists.length - totalAvailable;

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">

                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Anaesthetists</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage anaesthesia department staff</p>
                    </div>
                    {canCreate && (
                        <button
                            id="add-anaesthetist-btn"
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Anaesthetist
                        </button>
                    )}
                </div>

                {/* ── Summary Stats ────────────────────────────────────────── */}
                {!loading && !error && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Total Anaesthetists', value: anaesthetists.length, colour: 'bg-blue-100 text-blue-700' },
                            { label: 'Available', value: totalAvailable, colour: 'bg-emerald-100 text-emerald-700' },
                            { label: 'Unavailable', value: totalUnavailable, colour: 'bg-red-100 text-red-600' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl ${stat.colour.split(' ')[0]} flex items-center justify-center`}>
                                    <span className={`text-xl font-bold ${stat.colour.split(' ')[1]}`}>{stat.value}</span>
                                </div>
                                <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Search / Filters ─────────────────────────────────────── */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            id="anaesthetist-search"
                            type="text"
                            placeholder="Search by name, specialization or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <button
                        id="anaesthetist-refresh-btn"
                        onClick={fetchAnaesthetists}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* ── Content ─────────────────────────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg className="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-gray-600 font-medium">{error}</p>
                        <button
                            onClick={fetchAnaesthetists}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No anaesthetists found</p>
                        {search ? (
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                        ) : canCreate ? (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Add the first anaesthetist
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(item => (
                            <AnaesthetistCard
                                key={item.id}
                                anaesthetist={item}
                                canEdit={canEdit}
                                onEdit={setEditingAnaesthetist}
                                onDelete={setDeletingAnaesthetist}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create Anaesthetist Modal ────────────────────────────────── */}
            {showCreateModal && (
                <CreateAnaesthetistModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleCreated}
                />
            )}

            {/* ── Edit Anaesthetist Modal (Day 14) ─────────────────────────── */}
            {editingAnaesthetist && (
                <EditAnaesthetistModal
                    anaesthetist={editingAnaesthetist}
                    onClose={() => setEditingAnaesthetist(null)}
                    onUpdated={handleUpdated}
                />
            )}

            {/* ── Delete Anaesthetist Modal (Day 14) ───────────────────────── */}
            {deletingAnaesthetist && (
                <DeleteAnaesthetistModal
                    anaesthetist={deletingAnaesthetist}
                    onClose={() => setDeletingAnaesthetist(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </Layout>
    );
};

export default AnaesthetistsPage;
