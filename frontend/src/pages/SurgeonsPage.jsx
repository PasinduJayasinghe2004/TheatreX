// ============================================================================
// Surgeons Page
// ============================================================================
// Created by: M1 (Pasindu) - Day 13
//
// Full-featured surgeons management page.
//
// FEATURES:
// - Lists all active surgeons with search and availability filters
// - Create New Surgeon modal form (coordinator/admin only)
// - Surgeon cards with specialization, contact, availability, active surgery count
// - Loading skeleton, empty state, and error handling
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import surgeonService from '../services/surgeonService';
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
// Surgeon Card
// ─────────────────────────────────────────────────────────────────────────────
const SurgeonCard = ({ surgeon }) => {
    const initials = surgeon.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Avatar circle */}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-700">{initials}</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{surgeon.name}</h3>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">{surgeon.specialization}</p>
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
                    {/* Email icon */}
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{surgeon.email}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Phone icon */}
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{surgeon.phone}</span>
                </div>

                {surgeon.years_of_experience != null && (
                    <div className="flex items-center gap-2">
                        {/* Experience icon */}
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{surgeon.years_of_experience} yr{surgeon.years_of_experience !== 1 ? 's' : ''} experience</span>
                    </div>
                )}
            </div>

            {/* Footer: active surgery count */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Active surgeries</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(surgeon.active_surgery_count) > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    {surgeon.active_surgery_count ?? 0}
                </span>
            </div>
        </div>
    );
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

const EMPTY_FIELD_ERRORS = {
    name: '',
    specialization: '',
    license_number: '',
    phone: '',
    email: '',
    years_of_experience: '',
};

const CreateSurgeonModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
    const [serverErrors, setServerErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        // Clear field error on change
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ── Client-side validation (M2 - Day 13) ──────────────────────────────
    const validateForm = () => {
        const errs = { ...EMPTY_FIELD_ERRORS };
        let valid = true;

        // Name
        if (!form.name.trim()) {
            errs.name = 'Full name is required';
            valid = false;
        } else if (form.name.trim().length < 2) {
            errs.name = 'Name must be at least 2 characters';
            valid = false;
        }

        // Specialization
        if (!form.specialization.trim()) {
            errs.specialization = 'Specialization is required';
            valid = false;
        }

        // License number
        if (!form.license_number.trim()) {
            errs.license_number = 'Licence number is required';
            valid = false;
        }

        // Phone
        if (!form.phone.trim()) {
            errs.phone = 'Phone number is required';
            valid = false;
        } else if (!/[\d]{7,}/.test(form.phone.replace(/[\s\-+()]/g, ''))) {
            errs.phone = 'Enter a valid phone number (at least 7 digits)';
            valid = false;
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email.trim()) {
            errs.email = 'Email is required';
            valid = false;
        } else if (!emailRegex.test(form.email)) {
            errs.email = 'Enter a valid email address';
            valid = false;
        }

        // Years of experience (optional but must be valid if provided)
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerErrors([]);

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const result = await surgeonService.createSurgeon(form);
            onCreated(result.data);
        } catch (err) {
            setServerErrors([err.message]);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldCls = (fieldName) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition ${fieldErrors[fieldName] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`;

    const FieldError = ({ field }) =>
        fieldErrors[field] ? (
            <p className="text-xs text-red-500 mt-1">{fieldErrors[field]}</p>
        ) : null;

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
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
                    {/* Server error messages */}
                    {serverErrors.length > 0 && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                            {serverErrors.map((e, i) => (
                                <p key={i} className="text-xs text-red-600">{e}</p>
                            ))}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="surgeon-name"
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Dr. Sarah Connor"
                            className={fieldCls('name')}
                        />
                        <FieldError field="name" />
                    </div>

                    {/* Specialization */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Specialization <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="surgeon-specialization"
                            type="text"
                            name="specialization"
                            value={form.specialization}
                            onChange={handleChange}
                            placeholder="Cardiothoracic Surgery"
                            className={fieldCls('specialization')}
                        />
                        <FieldError field="specialization" />
                    </div>

                    {/* Licence Number */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Licence Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="surgeon-license"
                            type="text"
                            name="license_number"
                            value={form.license_number}
                            onChange={handleChange}
                            placeholder="LK-MED-2024-0001"
                            className={fieldCls('license_number')}
                        />
                        <FieldError field="license_number" />
                    </div>

                    {/* Row: YOE + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Years of Experience</label>
                            <input
                                id="surgeon-yoe"
                                type="number"
                                name="years_of_experience"
                                value={form.years_of_experience}
                                onChange={handleChange}
                                placeholder="10"
                                min="0"
                                max="60"
                                className={fieldCls('years_of_experience')}
                            />
                            <FieldError field="years_of_experience" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="surgeon-phone"
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+94 77 123 4567"
                                className={fieldCls('phone')}
                            />
                            <FieldError field="phone" />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="surgeon-email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="surgeon@hospital.com"
                            className={fieldCls('email')}
                        />
                        <FieldError field="email" />
                    </div>

                    {/* Availability toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            id="surgeon-available"
                            type="checkbox"
                            name="is_available"
                            checked={form.is_available}
                            onChange={handleChange}
                            className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                        <label htmlFor="surgeon-available" className="text-xs font-medium text-gray-700 cursor-pointer">
                            Mark as available immediately
                        </label>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="create-surgeon-form"
                        disabled={submitting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
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
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const SurgeonsPage = () => {
    const { user } = useAuth();


    const [surgeons, setSurgeons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Filter state
    const [search, setSearch] = useState('');
    const [available, setAvailable] = useState('');

    const canCreate = user?.role === 'coordinator' || user?.role === 'admin';

    // ── Fetch surgeons ────────────────────────────────────────────────────────
    const fetchSurgeons = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await surgeonService.getAllSurgeons({ search, available });
            setSurgeons(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, available]);

    useEffect(() => {
        fetchSurgeons();
    }, [fetchSurgeons]);

    // ── Handle surgeon created ────────────────────────────────────────────────
    const handleCreated = (newSurgeon) => {
        setShowModal(false);
        setSurgeons(prev => [newSurgeon, ...prev]);
    };

    // ── Stats strip ───────────────────────────────────────────────────────────
    const totalAvailable = surgeons.filter(s => s.is_available).length;
    const totalUnavailable = surgeons.length - totalAvailable;

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">

                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Surgeons</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage and view all surgeon records
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            id="add-surgeon-btn"
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Surgeon
                        </button>
                    )}
                </div>

                {/* ── Summary Stats ────────────────────────────────────────── */}
                {!loading && !error && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Total Surgeons', value: surgeons.length, colour: 'bg-indigo-100 text-indigo-700' },
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

                {/* ── Filters ─────────────────────────────────────────────── */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            id="surgeon-search"
                            type="text"
                            placeholder="Search by name, specialization or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <select
                        id="surgeon-availability-filter"
                        value={available}
                        onChange={e => setAvailable(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    >
                        <option value="">All Availability</option>
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                    </select>
                    <button
                        id="surgeon-refresh-btn"
                        onClick={fetchSurgeons}
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
                            onClick={fetchSurgeons}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                ) : surgeons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No surgeons found</p>
                        {search || available ? (
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                        ) : canCreate ? (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Add the first surgeon
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {surgeons.map(surgeon => (
                            <SurgeonCard key={surgeon.id} surgeon={surgeon} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create Surgeon Modal ─────────────────────────────────────── */}
            {showModal && (
                <CreateSurgeonModal
                    onClose={() => setShowModal(false)}
                    onCreated={handleCreated}
                />
            )}
        </Layout>
    );
};

export default SurgeonsPage;
