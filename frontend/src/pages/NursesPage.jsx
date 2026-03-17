// ============================================================================
// Nurses Page
// ============================================================================
// Created by: M3 (Janani) - Day 13
// Updated by: M2 (Chandeepa) - Day 14 (added Edit/Delete nurse UI)
//
// Full-featured nurses management page.
//
// FEATURES:
// - Lists all active nurses with search, availability, and shift filters
// - Create New Nurse modal form (coordinator/admin only)
// - Edit Nurse modal form (coordinator/admin only)
// - Delete Nurse confirmation modal (coordinator/admin only)
// - Nurse cards with specialization, contact, availability, shift, active surgery count
// - Loading skeleton, empty state, and error handling
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import nurseService from '../services/nurseService';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

const AvailBadge = ({ available }) =>
    available ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Available
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Busy
        </span>
    );

const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-1/2" />
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-1/2" />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Nurse Card
// Updated by: M2 (Chandeepa) - Day 14 (added edit/delete buttons)
// ─────────────────────────────────────────────────────────────────────────────
const NurseCard = ({ nurse, canEdit, onEdit, onDelete }) => {
    const initials = nurse.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all p-5 relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => onEdit(nurse)} className="p-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 shadow-sm transition-all focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(nurse.id)} className="p-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 shadow-sm transition-all focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{initials}</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{nurse.name}</h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">{nurse.specialization}</p>
                    </div>
                </div>
                <AvailBadge available={nurse.is_available} />
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 dark:text-slate-400 mt-4">
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-500">Licence:</span>
                    <span className="font-medium text-gray-900">{nurse.license_number}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{nurse.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{nurse.phone}</span>
                </div>

                {nurse.years_of_experience != null && (
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{nurse.years_of_experience} yr{nurse.years_of_experience !== 1 ? 's' : ''} experience</span>
                    </div>
                )}

                {/* Shift preference */}
                <div className="flex items-center gap-2 pt-1">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                    <span className="text-gray-500">Shift:</span>
                    <span className="capitalize font-medium text-gray-900">{nurse.shift_preference}</span>
                </div>
            </div>

            {/* Footer: active surgery count + action buttons */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Active surgeries</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(nurse.active_surgery_count) > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                        }`}>
                        {nurse.active_surgery_count ?? 0}
                    </span>
                </div>

                {/* Edit / Delete buttons (coordinator/admin only) */}
                {canEdit && (
                    <div className="flex items-center gap-1">
                        <button
                            id={`edit-nurse-${nurse.id}`}
                            onClick={() => onEdit(nurse)}
                            title="Edit nurse"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                            aria-label={`Edit ${nurse.name}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            id={`delete-nurse-${nurse.id}`}
                            onClick={() => onDelete(nurse)}
                            title="Delete nurse"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete ${nurse.name}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared form helpers
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FIELD_ERRORS = {
    name: '', specialization: '', license_number: '',
    phone: '', email: '', years_of_experience: '', shift_preference: '',
};

const buildFieldCls = (fieldErrors) => (fieldName) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition ${fieldErrors[fieldName] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

const FieldError = ({ fieldErrors, field }) =>
    fieldErrors[field] ? <p className="text-xs text-red-500 mt-1">{fieldErrors[field]}</p> : null;

const validateNurseForm = (form, setFieldErrors) => {
    const errs = { ...EMPTY_FIELD_ERRORS };
    let valid = true;

    if (!form.name.trim()) { errs.name = 'Full name is required'; valid = false; }
    else if (form.name.trim().length < 2) { errs.name = 'Name must be at least 2 characters'; valid = false; }

    if (!form.specialization.trim()) { errs.specialization = 'Specialization is required'; valid = false; }
    if (!form.license_number.trim()) { errs.license_number = 'Licence number is required'; valid = false; }

    if (!form.phone.trim()) { errs.phone = 'Phone number is required'; valid = false; }
    else if (!/[\d]{7,}/.test(form.phone.replace(/[\s\-+()]/g, ''))) {
        errs.phone = 'Enter a valid phone number (at least 7 digits)'; valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) { errs.email = 'Email is required'; valid = false; }
    else if (!emailRegex.test(form.email)) { errs.email = 'Enter a valid email address'; valid = false; }

    if (form.years_of_experience !== '' && form.years_of_experience !== null) {
        const yoe = Number(form.years_of_experience);
        if (isNaN(yoe) || yoe < 0 || !Number.isInteger(yoe)) {
            errs.years_of_experience = 'Must be a non-negative whole number'; valid = false;
        }
    }

    setFieldErrors(errs);
    return valid;
};

// Reusable form body (used by both Create and Edit)
const NurseFormBody = ({ form, fieldErrors, onChange, formId, onSubmit }) => {
    const fieldCls = buildFieldCls(fieldErrors);
    return (
        <form id={formId} onSubmit={onSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={form.name} onChange={onChange} className={fieldCls('name')} />
                <FieldError fieldErrors={fieldErrors} field="name" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specialization <span className="text-red-500">*</span></label>
                <input type="text" name="specialization" value={form.specialization} onChange={onChange}
                    className={fieldCls('specialization')} />
                <FieldError fieldErrors={fieldErrors} field="specialization" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Licence Number <span className="text-red-500">*</span></label>
                <input type="text" name="license_number" value={form.license_number} onChange={onChange}
                    className={fieldCls('license_number')} />
                <FieldError fieldErrors={fieldErrors} field="license_number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input type="number" name="years_of_experience" value={form.years_of_experience}
                        onChange={onChange} min="0" max="60" className={fieldCls('years_of_experience')} />
                    <FieldError fieldErrors={fieldErrors} field="years_of_experience" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" value={form.phone} onChange={onChange} className={fieldCls('phone')} />
                    <FieldError fieldErrors={fieldErrors} field="phone" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={form.email} onChange={onChange} className={fieldCls('email')} />
                <FieldError fieldErrors={fieldErrors} field="email" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Shift Preference</label>
                <select name="shift_preference" value={form.shift_preference} onChange={onChange}
                    className={fieldCls('shift_preference')}>
                    <option value="flexible">Flexible</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                </select>
                <FieldError fieldErrors={fieldErrors} field="shift_preference" />
            </div>
            <div className="flex items-center gap-3">
                <input type="checkbox" name="is_available" checked={form.is_available} onChange={onChange}
                    className="w-4 h-4 accent-teal-600 cursor-pointer" />
                <label className="text-xs font-medium text-gray-700 cursor-pointer">Mark as available</label>
            </div>
        </form>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Create Nurse Modal
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
    name: '', specialization: '', license_number: '',
    years_of_experience: '', phone: '', email: '',
    is_available: true, shift_preference: 'flexible',
};

const CreateNurseModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
    const [serverErrors, setServerErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerErrors([]);
        if (!validateNurseForm(form, setFieldErrors)) return;
        setSubmitting(true);
        try {
            const result = await nurseService.createNurse(form);
            onCreated(result.data);
        } catch (err) {
            setServerErrors([err.message]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Add New Nurse</h2>
                    </div>
                    <button onClick={onClose} className="text-teal-200 hover:text-white transition-colors" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {serverErrors.length > 0 && (
                    <div className="mx-6 mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3">
                        {serverErrors.map((e, i) => <p key={i} className="text-xs text-red-600 dark:text-red-400">{e}</p>)}
                    </div>
                )}

                <NurseFormBody form={form} fieldErrors={fieldErrors} onChange={handleChange}
                    formId="create-nurse-form" onSubmit={handleSubmit} />

                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-100 dark:border-slate-600 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg transition-colors\">
                        Cancel
                    </button>
                    <button type="submit" form="create-nurse-form" disabled={submitting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {submitting ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>Saving…</>) : 'Add Nurse'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Edit Nurse Modal
// Created by: M2 (Chandeepa) - Day 14
// ─────────────────────────────────────────────────────────────────────────────
const EditNurseModal = ({ nurse, onClose, onUpdated }) => {
    const [form, setForm] = useState({
        name: nurse.name ?? '',
        specialization: nurse.specialization ?? '',
        license_number: nurse.license_number ?? '',
        years_of_experience: nurse.years_of_experience ?? '',
        phone: nurse.phone ?? '',
        email: nurse.email ?? '',
        is_available: nurse.is_available ?? true,
        shift_preference: nurse.shift_preference ?? 'flexible',
    });
    const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
    const [serverErrors, setServerErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerErrors([]);
        if (!validateNurseForm(form, setFieldErrors)) return;
        setSubmitting(true);
        try {
            const result = await nurseService.updateNurse(nurse.id, form);
            onUpdated(result.data);
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Edit Nurse</h2>
                    </div>
                    <button onClick={onClose} className="text-teal-200 hover:text-white transition-colors" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {serverErrors.length > 0 && (
                    <div className="mx-6 mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3">
                        {serverErrors.map((e, i) => <p key={i} className="text-xs text-red-600 dark:text-red-400">{e}</p>)}
                    </div>
                )}

                <NurseFormBody form={form} fieldErrors={fieldErrors} onChange={handleChange}
                    formId="edit-nurse-form" onSubmit={handleSubmit} />

                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-100 dark:border-slate-600 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg transition-colors\">
                        Cancel
                    </button>
                    <button type="submit" form="edit-nurse-form" disabled={submitting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {submitting ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>Saving…</>) : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete Nurse Confirmation Modal
// Created by: M2 (Chandeepa) - Day 14
// ─────────────────────────────────────────────────────────────────────────────
const DeleteNurseModal = ({ nurse, onClose, onDeleted }) => {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setError(null);
        setDeleting(true);
        try {
            await nurseService.deleteNurse(nurse.id);
            onDeleted(nurse.id);
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Delete Nurse</h2>
                    </div>
                    <button onClick={onClose} className="text-red-200 hover:text-white transition-colors" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Are you sure you want to delete <span className="font-bold">{nurse.name}</span>?
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                This will deactivate the nurse record. Surgery history will be preserved.
                            </p>
                        </div>
                    </div>
                    {error && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3">
                            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-100 dark:border-slate-600 flex items-center justify-end gap-3\">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg transition-colors\">
                        Cancel
                    </button>
                    <button
                        id={`confirm-delete-nurse-${nurse.id}`}
                        type="button" onClick={handleDelete} disabled={deleting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {deleting ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>Deleting…</>) : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const NursesPage = () => {
    const { user } = useAuth();
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingNurse, setEditingNurse] = useState(null);
    const [deletingNurse, setDeletingNurse] = useState(null);

    const [search, setSearch] = useState('');
    const [available, setAvailable] = useState('');
    const [shift, setShift] = useState('');

    const canCreate = user?.role === 'admin';
    const canEdit = user?.role === 'coordinator' || user?.role === 'admin';

    const fetchNurses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await nurseService.getAllNurses({ search, available, shift });
            setNurses(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, available, shift]);

    useEffect(() => { fetchNurses(); }, [fetchNurses]);

    const handleCreated = (newNurse) => {
        setShowCreateModal(false);
        setNurses(prev => [newNurse, ...prev]);
    };

    const handleUpdated = (updatedNurse) => {
        setEditingNurse(null);
        setNurses(prev => prev.map(n => n.id === updatedNurse.id ? { ...n, ...updatedNurse } : n));
    };

    const handleDeleted = (deletedId) => {
        setDeletingNurse(null);
        setNurses(prev => prev.filter(n => n.id !== deletedId));
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto min-h-screen dark:bg-slate-900">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nurses</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage and view all nurse records</p>
                    </div>
                    {canCreate && (
                        <button id="add-nurse-btn" onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Nurse
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input id="nurse-search" type="text" placeholder="Search by name, specialization or email…"
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400" />
                    </div>
                    <select id="nurse-availability-filter" value={available} onChange={e => setAvailable(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400">
                        <option value="">All Availability</option>
                        <option value="true">Available</option>
                        <option value="false">Busy</option>
                    </select>
                    <select id="nurse-shift-filter" value={shift} onChange={e => setShift(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                        <option value="">All Shifts</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="night">Night</option>
                        <option value="flexible">Flexible</option>
                    </select>
                    <button id="nurse-refresh-btn" onClick={fetchNurses}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" title="Refresh">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg className="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-gray-600 font-medium">{error}</p>
                        <button onClick={fetchNurses}
                            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                            Try again
                        </button>
                    </div>
                ) : nurses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No nurses found</p>
                        {search || available || shift ? (
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                        ) : canCreate ? (
                            <button onClick={() => setShowCreateModal(true)}
                                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                                Add the first nurse
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {nurses.map(nurse => (
                            <NurseCard key={nurse.id} nurse={nurse} canEdit={canEdit}
                                onEdit={setEditingNurse} onDelete={setDeletingNurse} />
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateNurseModal onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
            )}
            {editingNurse && (
                <EditNurseModal nurse={editingNurse} onClose={() => setEditingNurse(null)} onUpdated={handleUpdated} />
            )}
            {deletingNurse && (
                <DeleteNurseModal nurse={deletingNurse} onClose={() => setDeletingNurse(null)} onDeleted={handleDeleted} />
            )}
        </Layout>
    );
};

export default NursesPage;
