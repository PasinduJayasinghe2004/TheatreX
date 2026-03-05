// ============================================================================
// Patient Detail Page
// ============================================================================
// Created by: M3 (Janani) - Day 15
//
// Displays full details of a single patient fetched by ID.
// Sections:
//   - Personal information (name, DOB, age, gender, blood type)
//   - Contact details (phone, email, address)
//   - Emergency contact
//   - Medical information (history, allergies, medications)
//   - Surgery history list (fetched from backend join)
//
// Uses patientService.getPatientById() for data retrieval.
// Any authenticated user can view.
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, AlertCircle, User, Phone, Mail, MapPin,
    Droplets, Heart, Calendar, Clock, FileText,
    AlertTriangle, Pill, Activity, Stethoscope
} from 'lucide-react';
import patientService from '../services/patientService';

// ── Helpers ─────────────────────────────────────────────────────────────────

const GENDER_LABELS = { male: 'Male', female: 'Female', other: 'Other' };

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

const STATUS_COLORS = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    emergency: 'bg-red-100 text-red-700',
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // timeStr may be "HH:MM:SS" or ISO
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parts[1];
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    }
    return timeStr;
};

// ── Section wrapper ─────────────────────────────────────────────────────────

const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
            <Icon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        </div>
        {children}
    </div>
);

const Field = ({ label, value }) => (
    <div>
        <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
        <dd className="text-sm text-gray-900">{value || '—'}</dd>
    </div>
);

// ── Component ───────────────────────────────────────────────────────────────

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await patientService.getPatientById(id);

                if (response.success) {
                    setPatient(response.data);
                } else {
                    setError(response.message || 'Failed to load patient details');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while fetching patient details');
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [id]);

    // ── Loading State ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Error State ─────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/patients')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back to Patients</span>
                    </button>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h2 className="text-lg font-semibold text-red-700 mb-1">Error Loading Patient</h2>
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!patient) return null;

    const surgeries = patient.surgeries ?? [];

    // ── Content ─────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate('/patients')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to Patients</span>
                </button>

                {/* ── Header card ─────────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-600 font-bold text-xl">
                                {patient.name?.trim().charAt(0).toUpperCase() ?? 'P'}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl font-bold text-gray-900">{patient.name}</h1>
                                <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${GENDER_COLORS[patient.gender] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {GENDER_LABELS[patient.gender] ?? patient.gender}
                                </span>
                                {patient.blood_type && (
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${BLOOD_COLORS[patient.blood_type] ?? 'bg-gray-100 text-gray-600'}`}>
                                        <Droplets className="w-3 h-3" />
                                        {patient.blood_type}
                                    </span>
                                )}
                                {!patient.is_active && (
                                    <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-500">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {patient.age != null ? `${patient.age} years old` : ''}
                                {patient.age != null && patient.date_of_birth ? ' · ' : ''}
                                {patient.date_of_birth ? `Born ${formatDate(patient.date_of_birth)}` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Details grid ────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    {/* Contact */}
                    <Section icon={Phone} title="Contact Information">
                        <dl className="space-y-3">
                            <Field label="Phone" value={patient.phone} />
                            <Field label="Email" value={patient.email} />
                            <Field label="Address" value={patient.address} />
                        </dl>
                    </Section>

                    {/* Emergency Contact */}
                    <Section icon={Heart} title="Emergency Contact">
                        <dl className="space-y-3">
                            <Field label="Name" value={patient.emergency_contact_name} />
                            <Field label="Phone" value={patient.emergency_contact_phone} />
                            <Field label="Relationship" value={patient.emergency_contact_relationship} />
                        </dl>
                    </Section>

                    {/* Medical History */}
                    <Section icon={FileText} title="Medical History">
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                            {patient.medical_history || 'No medical history recorded.'}
                        </p>
                    </Section>

                    {/* Allergies */}
                    <Section icon={AlertTriangle} title="Allergies">
                        {patient.allergies ? (
                            <div className="flex flex-wrap gap-2">
                                {patient.allergies.split(',').map((a, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                        <AlertTriangle className="w-3 h-3" />
                                        {a.trim()}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No known allergies.</p>
                        )}
                    </Section>

                    {/* Current Medications */}
                    <Section icon={Pill} title="Current Medications">
                        {patient.current_medications ? (
                            <div className="flex flex-wrap gap-2">
                                {patient.current_medications.split(',').map((m, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                        <Pill className="w-3 h-3" />
                                        {m.trim()}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No current medications.</p>
                        )}
                    </Section>
                </div>

                {/* ── Surgery History ─────────────────────────────────── */}
                <Section icon={Stethoscope} title={`Surgery History (${surgeries.length})`}>
                    {surgeries.length === 0 ? (
                        <div className="text-center py-8">
                            <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No surgeries recorded for this patient.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {surgeries.map(s => (
                                <Link
                                    key={s.id}
                                    to={`/surgeries/${s.id}`}
                                    className="flex items-center justify-between gap-4 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {s.surgery_type || 'Surgery'}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(s.scheduled_date)}
                                            </span>
                                            {s.scheduled_start_time && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(s.scheduled_start_time)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {s.priority && (
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.priority === 'emergency' ? 'bg-red-100 text-red-700' : s.priority === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {s.priority.charAt(0).toUpperCase() + s.priority.slice(1)}
                                            </span>
                                        )}
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {(s.status ?? '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Section>

                {/* ── Footer metadata ────────────────────────────────── */}
                <p className="text-xs text-gray-400 text-right mt-4">
                    Created {formatDate(patient.created_at)}
                    {patient.updated_at ? ` · Updated ${formatDate(patient.updated_at)}` : ''}
                </p>
            </div>
        </div>
    );
};

export default PatientDetail;
