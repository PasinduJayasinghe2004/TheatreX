// ============================================================================
// PatientsPage
// ============================================================================
// Created by: M1 (Pasindu) - Day 15
// Updated by: M2 (Chandeepa) - Day 15
//
// Patients management page featuring:
// - Patient list (card grid) fetched from GET /api/patients
// - Backend search by name/phone/email (?search=...), filter by gender and blood type
// - "Add Patient" button (coordinator/admin only) → opens PatientForm modal
// - Edit / Delete patient support (coordinator/admin only)
// - Loading / error / empty states
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    UserPlus, Search, Filter, RefreshCw, Edit3,
    Phone, Mail, MapPin, Heart, Droplets,
    AlertTriangle, XCircle, Trash2
} from 'lucide-react';
import Layout from '../components/Layout';
import PatientForm from '../components/PatientForm';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';

// ── helpers ──────────────────────────────────────────────────────────────────

const GENDER_LABELS = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
};

const GENDER_COLORS = {
    male: 'bg-blue-100 text-blue-700',
    female: 'bg-pink-100 text-pink-700',
    other: 'bg-purple-100 text-purple-700',
};

const BLOOD_COLORS = {
    'A+': 'bg-red-100 text-red-700',
    'A-': 'bg-red-50 text-red-600',
    'B+': 'bg-orange-100 text-orange-700',
    'B-': 'bg-orange-50 text-orange-600',
    'AB+': 'bg-violet-100 text-violet-700',
    'AB-': 'bg-violet-50 text-violet-600',
    'O+': 'bg-emerald-100 text-emerald-700',
    'O-': 'bg-emerald-50 text-emerald-600',
};

// ── PatientCard ─────────────────────────────────────────────────────────────

const PatientCard = ({ patient, canManage, onEdit, onDelete }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
        {/* clickable area */}
        <Link
            to={`/patients/${patient.id}`}
            className="p-5 flex-1 flex flex-col gap-3"
        >
            {/* Header: avatar + name + gender */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                        <span className="text-emerald-600 font-semibold text-sm">
                            {patient.name?.trim().charAt(0).toUpperCase() ?? 'P'}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{patient.name}</h3>
                        {patient.age != null && (
                            <p className="text-xs text-gray-400">{patient.age} years old</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Gender badge */}
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${GENDER_COLORS[patient.gender] ?? 'bg-gray-100 text-gray-600'}`}>
                        {GENDER_LABELS[patient.gender] ?? patient.gender}
                    </span>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{patient.phone}</span>
                </div>
                {patient.email && (
                    <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{patient.email}</span>
                    </div>
                )}
                {patient.address && (
                    <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{patient.address}</span>
                    </div>
                )}
            </div>

            {/* Badges footer */}
            <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
                {patient.blood_type && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${BLOOD_COLORS[patient.blood_type] ?? 'bg-gray-100 text-gray-600'}`}>
                        <Droplets className="w-3 h-3" />
                        {patient.blood_type}
                    </span>
                )}
                {patient.allergies && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-3 h-3" />
                        Allergies
                    </span>
                )}
            </div>
        </Link>

        {/* Action footer (separate from Link) */}
        {canManage && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                    {patient.emergency_contact_name && (
                        <>
                            <Heart className="w-3 h-3" />
                            <span className="truncate">{patient.emergency_contact_name}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onEdit?.(patient);
                        }}
                        title="Edit patient"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete?.(patient);
                        }}
                        title="Delete patient"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        )}
    </div>
);

// ── PatientsPage ────────────────────────────────────────────────────────────

const PatientsPage = () => {
    const { user } = useAuth();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [deletingPatient, setDeletingPatient] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterGender, setFilterGender] = useState(''); // '' | 'male' | 'female' | 'other'
    const [filterBloodType, setFilterBloodType] = useState('');

    const canManage = user?.role === 'coordinator' || user?.role === 'admin';

    // ── M6 Day 15: Debounce search input (400ms) so API is not called on every keystroke
    const debounceTimer = useRef(null);
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 400);
    };

    // ── fetch ───────────────────────────────────────────────────────────
    // M6 Day 15: search is now sent to backend as ?search=... instead of filtering client-side
    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (filterGender) filters.gender = filterGender;
            if (filterBloodType) filters.blood_type = filterBloodType;
            if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

            const response = await patientService.getAllPatients(filters);
            setPatients(response.data ?? []);
        } catch (err) {
            setError(err.message || 'Failed to load patients.');
        } finally {
            setLoading(false);
        }
    }, [filterGender, filterBloodType, debouncedSearch]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Backend handles filtering, so displayed === patients
    const displayed = patients;

    // ── unique blood types for filter dropdown ──────────────────────────
    const bloodTypes = [...new Set(patients.map(p => p.blood_type).filter(Boolean))].sort();

    // ── handlers ────────────────────────────────────────────────────────
    const handlePatientCreated = (newPatient) => {
        setShowForm(false);
        setPatients(prev => [newPatient, ...prev]);
    };

    const handleEditClick = (patient) => {
        setEditingPatient(patient);
    };

    const handlePatientUpdated = (updatedPatient) => {
        setEditingPatient(null);
        setPatients(prev =>
            prev.map(p => p.id === updatedPatient.id ? updatedPatient : p)
        );
    };

    const handleDeleteClick = (patient) => {
        setDeletingPatient(patient);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingPatient) return;
        setDeleteLoading(true);
        try {
            await patientService.deletePatient(deletingPatient.id);
            setPatients(prev => prev.filter(p => p.id !== deletingPatient.id));
            setDeletingPatient(null);
        } catch (err) {
            setError(err.message || 'Failed to delete patient.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── render ──────────────────────────────────────────────────────────
    return (
        <Layout>
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Patients
                            {!loading && (
                                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                    {patients.length}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage patient records and medical information</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchPatients}
                            disabled={loading}
                            title="Refresh list"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {canManage && (
                            <button
                                id="add-patient-btn"
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Patient
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="patient-search"
                            type="text"
                            placeholder="Search name, phone or email…"
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    {/* Gender filter */}
                    <div className="relative sm:w-40">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            id="patient-filter-gender"
                            value={filterGender}
                            onChange={e => setFilterGender(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none"
                        >
                            <option value="">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Blood type filter */}
                    <select
                        id="patient-filter-blood"
                        value={filterBloodType}
                        onChange={e => setFilterBloodType(e.target.value)}
                        className="sm:w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                        <option value="">All Blood Types</option>
                        {bloodTypes.map(bt => (
                            <option key={bt} value={bt}>{bt}</option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                {loading ? (
                    /* Loading skeleton */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2.5 bg-gray-100 rounded" />
                                    <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    /* Error state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Failed to load patients</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-xs">{error}</p>
                        <button
                            onClick={fetchPatients}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : displayed.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <UserPlus className="w-7 h-7 text-emerald-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {search || filterGender || filterBloodType
                                ? 'No patients match your filters'
                                : 'No patients yet'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-xs">
                            {search || filterGender || filterBloodType
                                ? 'Try adjusting your filters or search query.'
                                : canManage
                                    ? 'Add the first patient to get started.'
                                    : 'No patients have been added yet.'}
                        </p>
                        {canManage && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Patient
                            </button>
                        )}
                    </div>
                ) : (
                    /* Patient card grid */
                    <>
                        <p className="text-xs text-gray-400 mb-3">
                            Showing {displayed.length} of {patients.length} patient{patients.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {displayed.map(patient => (
                                <PatientCard
                                    key={patient.id}
                                    patient={patient}
                                    canManage={canManage}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Patient Modal */}
            {showForm && (
                <PatientForm
                    onSuccess={handlePatientCreated}
                    onClose={() => setShowForm(false)}
                />
            )}

            {/* Edit Patient Modal */}
            {editingPatient && (
                <PatientForm
                    patient={editingPatient}
                    onSuccess={handlePatientUpdated}
                    onClose={() => setEditingPatient(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingPatient && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={(e) => { if (e.target === e.currentTarget && !deleteLoading) setDeletingPatient(null); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Delete Patient</h2>
                                <p className="text-sm text-gray-500">This action can be reversed by an admin</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{deletingPatient.name}</strong>?
                            The patient record will be deactivated.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingPatient(null)}
                                disabled={deleteLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {deleteLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting…
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Patient
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </Layout>
    );
};

export default PatientsPage;
