// ============================================================================
// Surgeons Page
// ============================================================================
// Created by: M1 (Pasindu) - Day 13
// Updated by: M1 (Pasindu) - Day 14 (added Edit/Delete surgeon UI)
//
// Full-featured surgeons management page.
//
// FEATURES:
// - Lists all active surgeons with search and availability filters
// - Create New Surgeon modal form (coordinator/admin only)
// - Edit Surgeon modal form (coordinator/admin only)
// - Delete Surgeon confirmation modal (coordinator/admin only)
// - Surgeon cards with specialization, contact, availability, active surgery count
// - Loading skeleton, empty state, and error handling
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import surgeonService from '../services/surgeonService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';

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


// ─────────────────────────────────────────────────────────────────────────────
// Surgeon Card
// Updated by: M1 (Pasindu) - Day 14 (added edit/delete buttons)
// ─────────────────────────────────────────────────────────────────────────────
const SurgeonCard = ({ surgeon, canEdit, onEdit, onDelete }) => {
    const initials = surgeon.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const profilePic = surgeon.profile_picture
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${surgeon.profile_picture}`
        : null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4 relative group">
            {/* Actions overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => onEdit(surgeon)} className="p-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 shadow-sm transition-all focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(surgeon.id)} className="p-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 shadow-sm transition-all focus:outline-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Avatar/Profile Pic */}
                    {profilePic ? (
                        <img src={profilePic} alt={surgeon.name} className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{initials}</span>
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{surgeon.name}</h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{surgeon.specialization}</p>
                    </div>
                </div>
                <AvailBadge available={surgeon.is_available} />
            </div>

            {/* Details */}
            <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    {/* License icon */}
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-500">Licence:</span>
                    <span className="font-medium text-gray-900">{surgeon.license_number}</span>
                </div>

                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{surgeon.email}</span>
                </div>

                <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{surgeon.phone}</span>
                </div>

                {surgeon.years_of_experience != null && (
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{surgeon.years_of_experience} yr{surgeon.years_of_experience !== 1 ? 's' : ''} experience</span>
                    </div>
                )}
            </div>

            {/* Footer: active surgery count + action buttons */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Active surgeries</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(surgeon.active_surgery_count) > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                        }`}>
                        {surgeon.active_surgery_count ?? 0}
                    </span>
                </div>

                {/* Edit / Delete action buttons (coordinator/admin only) */}
                {canEdit && (
                    <div className="flex items-center gap-1">
                        <button
                            id={`edit-surgeon-${surgeon.id}`}
                            onClick={() => onEdit(surgeon)}
                            title="Edit surgeon"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            aria-label={`Edit ${surgeon.name}`}
                        >
                            {/* Pencil icon */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            id={`delete-surgeon-${surgeon.id}`}
                            onClick={() => onDelete(surgeon)}
                            title="Delete surgeon"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete ${surgeon.name}`}
                        >
                            {/* Trash icon */}
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
// Shared form field helpers
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FIELD_ERRORS = {
    name: '',
    specialization: '',
    license_number: '',
    phone: '',
    email: '',
    years_of_experience: '',
};

const buildFieldCls = (fieldErrors) => (fieldName) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition ${fieldErrors[fieldName] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

const FieldError = ({ fieldErrors, field }) =>
    fieldErrors[field] ? (
        <p className="text-xs text-red-500 mt-1">{fieldErrors[field]}</p>
    ) : null;

/** Client-side validation used by both create and edit forms */
const validateSurgeonForm = (form, setFieldErrors) => {
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

    if (!form.phone.trim()) {
        errs.phone = 'Phone number is required';
        valid = false;
    } else if (!/[\d]{7,}/.test(form.phone.replace(/[\s\-+()]/g, ''))) {
        errs.phone = 'Enter a valid phone number (at least 7 digits)';
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

    if (form.years_of_experience !== '' && form.years_of_experience !== null) {
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
// Create Surgeon Modal
// ─────────────────────────────────────────────────────────────────────────────
// Enhanced by: M2 (Chandeepa) - Day 13 (client-side validation + success toast)
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
    name: '',
    specialization: '',
    license_number: '',
    years_of_experience: '',
    phone: '',
    email: '',
    is_available: true,
};

const CreateSurgeonModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState(EMPTY_FORM);
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
        if (!validateSurgeonForm(form, setFieldErrors)) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (form[key] !== null && form[key] !== undefined) {
                    formData.append(key, form[key]);
                }
            });
            const res = await surgeonService.createSurgeon(formData);
            onCreated(res.data);
            toast.success(`Surgeon '${res.data.name}' added successfully`);
        } catch (err) {
            const msg = err.message || 'Failed to create surgeon';
            setServerErrors([msg]);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Add New Surgeon</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-indigo-200 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form id="create-surgeon-form" onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {serverErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                            {serverErrors.map((e, i) => <p key={i} className="text-xs text-red-600 font-medium">{e}</p>)}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input id="surgeon-name" type="text" name="name" value={form.name} onChange={handleChange}
                            placeholder="Dr. Sarah Connor" className={fieldCls('name')} />
                        <FieldError fieldErrors={fieldErrors} field="name" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Specialization <span className="text-red-500">*</span>
                        </label>
                        <input id="surgeon-specialization" type="text" name="specialization" value={form.specialization}
                            onChange={handleChange} placeholder="Cardiothoracic Surgery" className={fieldCls('specialization')} />
                        <FieldError fieldErrors={fieldErrors} field="specialization" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Licence Number <span className="text-red-500">*</span>
                        </label>
                        <input id="surgeon-license" type="text" name="license_number" value={form.license_number}
                            onChange={handleChange} placeholder="LK-MED-2024-0001" className={fieldCls('license_number')} />
                        <FieldError fieldErrors={fieldErrors} field="license_number" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Years of Experience</label>
                            <input id="surgeon-yoe" type="number" name="years_of_experience" value={form.years_of_experience}
                                onChange={handleChange} placeholder="10" min="0" max="60"
                                className={fieldCls('years_of_experience')} />
                            <FieldError fieldErrors={fieldErrors} field="years_of_experience" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input id="surgeon-phone" type="tel" name="phone" value={form.phone}
                                onChange={handleChange} placeholder="+94 77 123 4567" className={fieldCls('phone')} />
                            <FieldError fieldErrors={fieldErrors} field="phone" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input id="surgeon-email" type="email" name="email" value={form.email}
                            onChange={handleChange} placeholder="surgeon@hospital.com" className={fieldCls('email')} />
                        <FieldError fieldErrors={fieldErrors} field="email" />
                    </div>

                    <div className="flex items-center gap-3">
                        <input id="surgeon-available" type="checkbox" name="is_available" checked={form.is_available}
                            onChange={handleChange} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                        <label htmlFor="surgeon-available" className="text-xs font-medium text-gray-700 cursor-pointer">
                            Mark as available immediately
                        </label>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-100 dark:border-slate-600 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="create-surgeon-form" disabled={submitting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {submitting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving…
                            </>
                        ) : 'Add Surgeon'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Edit Surgeon Modal
// Created by: M1 (Pasindu) - Day 14
// ─────────────────────────────────────────────────────────────────────────────
const EditSurgeonModal = ({ surgeon, onClose, onUpdated }) => {
    const [form, setForm] = useState({
        name: surgeon.name ?? '',
        specialization: surgeon.specialization ?? '',
        license_number: surgeon.license_number ?? '',
        years_of_experience: surgeon.years_of_experience ?? '',
        phone: surgeon.phone ?? '',
        email: surgeon.email ?? '',
        is_available: surgeon.is_available ?? true,
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
        if (!validateSurgeonForm(form, setFieldErrors)) return;
        setSubmitting(true);
        try {
            const result = await surgeonService.updateSurgeon(surgeon.id, form);
            onUpdated(result.data);
            toast.success(`Surgeon '${result.data.name}' updated successfully`);
        } catch (err) {
            const msg = err.message || 'Failed to update surgeon';
            setServerErrors([msg]);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Edit Surgeon</h2>
                    </div>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form id="edit-surgeon-form" onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                        <input id="edit-surgeon-name" type="text" name="name" value={form.name} onChange={handleChange}
                            className={fieldCls('name')} />
                        <FieldError fieldErrors={fieldErrors} field="name" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Specialization <span className="text-red-500">*</span>
                        </label>
                        <input id="edit-surgeon-specialization" type="text" name="specialization"
                            value={form.specialization} onChange={handleChange} className={fieldCls('specialization')} />
                        <FieldError fieldErrors={fieldErrors} field="specialization" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Licence Number <span className="text-red-500">*</span>
                        </label>
                        <input id="edit-surgeon-license" type="text" name="license_number"
                            value={form.license_number} onChange={handleChange} className={fieldCls('license_number')} />
                        <FieldError fieldErrors={fieldErrors} field="license_number" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Years of Experience</label>
                            <input id="edit-surgeon-yoe" type="number" name="years_of_experience"
                                value={form.years_of_experience} onChange={handleChange} min="0" max="60"
                                className={fieldCls('years_of_experience')} />
                            <FieldError fieldErrors={fieldErrors} field="years_of_experience" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input id="edit-surgeon-phone" type="tel" name="phone" value={form.phone}
                                onChange={handleChange} className={fieldCls('phone')} />
                            <FieldError fieldErrors={fieldErrors} field="phone" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input id="edit-surgeon-email" type="email" name="email" value={form.email}
                            onChange={handleChange} className={fieldCls('email')} />
                        <FieldError fieldErrors={fieldErrors} field="email" />
                    </div>

                    <div className="flex items-center gap-3">
                        <input id="edit-surgeon-available" type="checkbox" name="is_available" checked={form.is_available}
                            onChange={handleChange} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                        <label htmlFor="edit-surgeon-available" className="text-xs font-medium text-gray-700 cursor-pointer">
                            Mark as available
                        </label>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-100 dark:border-slate-600 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="edit-surgeon-form" disabled={submitting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
// Delete Surgeon Confirmation Modal
// Created by: M1 (Pasindu) - Day 14
// ─────────────────────────────────────────────────────────────────────────────
const DeleteSurgeonModal = ({ surgeon, onClose, onDeleted }) => {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setError(null);
        setDeleting(true);
        try {
            const response = await surgeonService.deleteSurgeon(surgeon.id);
            onDeleted(surgeon.id);
            toast.success(response.message || `Surgeon '${surgeon.name}' deleted successfully`);
        } catch (err) {
            const msg = err.message || 'Failed to delete surgeon';
            setError(msg);
            toast.error(msg);
            setDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <h2 className="text-white font-semibold text-base">Delete Surgeon</h2>
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
                                Are you sure you want to delete <span className="font-bold">{surgeon.name}</span>?
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                This action will deactivate the surgeon record. Their surgery history will be preserved.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3">
                            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-100 dark:border-slate-600 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        id={`confirm-delete-surgeon-${surgeon.id}`}
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
const SurgeonsPage = () => {
    const { user } = useAuth();

    const [surgeons, setSurgeons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSurgeon, setEditingSurgeon] = useState(null);   // surgeon object to edit
    const [deletingSurgeon, setDeletingSurgeon] = useState(null); // surgeon object to delete

    const [search, setSearch] = useState('');
    const [available, setAvailable] = useState('');

    const canCreate = user?.role === 'coordinator' || user?.role === 'admin';

    const fetchSurgeons = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await surgeonService.getAllSurgeons({ search, available });
            setSurgeons(res.data);
        } catch (err) {
            const msg = err.message || 'Failed to load surgeons';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [search, available]);

    useEffect(() => {
        fetchSurgeons();
    }, [fetchSurgeons]);

    // ── Handle surgeon created ────────────────────────────────────────────────
    const handleCreated = (newSurgeon) => {
        setShowCreateModal(false);
        setSurgeons(prev => [newSurgeon, ...prev]);
    };

    // ── Handle surgeon updated (Day 14) ──────────────────────────────────────
    const handleUpdated = (updatedSurgeon) => {
        setEditingSurgeon(null);
        setSurgeons(prev =>
            prev.map(s => (s.id === updatedSurgeon.id ? { ...s, ...updatedSurgeon } : s))
        );
    };

    // ── Handle surgeon deleted (Day 14) ──────────────────────────────────────
    const handleDeleted = (deletedId) => {
        setDeletingSurgeon(null);
        setSurgeons(prev => prev.filter(s => s.id !== deletedId));
    };

    return (
        <Layout>
            <div className="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen dark:bg-slate-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">Surgeons</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage hospital surgeons and profile pictures</p>
                    </div>
                    {canCreate && (
                        <button
                            id="add-surgeon-btn"
                            onClick={() => setShowCreateModal(true)}
                            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Surgeon
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[220px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input placeholder="Search named, specialization..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                    </div>
                    <select value={available} onChange={e => setAvailable(e.target.value)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-100 outline-none">
                        <option value="">All Availability</option>
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                    </select>
                </div>

                {loading ? (
                    <Loading message="Fetching surgeons..." />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg className="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-gray-600 font-medium">{error}</p>
                        <button
                            onClick={fetchSurgeons}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                ) : surgeons.length === 0 ? (
                    <EmptyState
                        icon="👨‍⚕️"
                        title={search || available ? 'No surgeons match your filters' : 'No surgeons found'}
                        description={
                            search || available
                                ? 'Try adjusting your search query or availability filter.'
                                : canCreate
                                    ? 'Start by adding your first surgeon to the system.'
                                    : 'There are no surgeons registered in the system.'
                        }
                        actionButton={
                            canCreate && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add First Surgeon
                                </button>
                            )
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {surgeons.map(surgeon => (
                            <SurgeonCard
                                key={surgeon.id}
                                surgeon={surgeon}
                                canEdit={canCreate}
                                onEdit={setEditingSurgeon}
                                onDelete={setDeletingSurgeon}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create Surgeon Modal ─────────────────────────────────────── */}
            {showCreateModal && (
                <CreateSurgeonModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleCreated}
                />
            )}

            {/* ── Edit Surgeon Modal (Day 14) ──────────────────────────────── */}
            {editingSurgeon && (
                <EditSurgeonModal
                    surgeon={editingSurgeon}
                    onClose={() => setEditingSurgeon(null)}
                    onUpdated={handleUpdated}
                />
            )}

            {/* ── Delete Surgeon Modal (Day 14) ────────────────────────────── */}
            {deletingSurgeon && (
                <DeleteSurgeonModal
                    surgeon={deletingSurgeon}
                    onClose={() => setDeletingSurgeon(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </Layout>
    );
};

export default SurgeonsPage;
