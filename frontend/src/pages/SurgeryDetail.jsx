// ============================================================================
// Surgery Detail Page
// ============================================================================
// Created by: M3 (Janani) - Day 5
//
// Displays full details of a single surgery fetched by ID.
// Uses surgeryService.getSurgeryById() for data retrieval.
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Activity,
    MapPin,
    FileText,
    AlertCircle,
    Edit,
    Trash2
} from 'lucide-react';
import surgeryService from '../services/surgeryService';
import Loading from '../components/ui/Loading';

// ============================================================================
// Helper Functions
// ============================================================================

/** Return Tailwind classes for the status badge */
const getStatusStyle = (status) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200';
        default: // scheduled
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

/** Return Tailwind classes for the priority badge */
const getPriorityStyle = (priority) => {
    switch (priority) {
        case 'emergency':
            return 'bg-red-50 text-red-700 border-red-200';
        case 'urgent':
            return 'bg-orange-50 text-orange-700 border-orange-200';
        default: // routine
            return 'bg-blue-50 text-blue-700 border-blue-200';
    }
};

/** Format an ISO / YYYY-MM-DD date string into a readable date */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/** Format a TIME (HH:mm:ss) or ISO string into HH:mm AM/PM */
const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    if (timeString.includes('T')) {
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    // Plain HH:mm or HH:mm:ss
    const [h, m] = timeString.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
};

// ============================================================================
// Component
// ============================================================================

const SurgeryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [surgery, setSurgery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch surgery data on mount / id change
    useEffect(() => {
        const fetchSurgery = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await surgeryService.getSurgeryById(id);

                if (response.success) {
                    setSurgery(response.data);
                } else {
                    setError(response.message || 'Failed to load surgery details');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while fetching surgery details');
                console.error('Error fetching surgery:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSurgery();
    }, [id]);

    // ── Loading ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto flex justify-center items-center h-64">
                    <Loading />
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/surgeries')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Surgeries
                    </button>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
                        <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-800 mb-1">
                                Error Loading Surgery
                            </h3>
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Content ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link
                    to="/surgeries"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Surgeries
                </Link>

                {/* ── Header Card ─────────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        {/* Left: Title & badges */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {surgery.surgery_type}
                            </h1>
                            <p className="text-gray-500 mt-1">Surgery #{surgery.id}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusStyle(surgery.status)}`}
                                >
                                    {surgery.status?.replace('_', ' ') || 'Scheduled'}
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getPriorityStyle(surgery.priority)}`}
                                >
                                    {surgery.priority || 'Routine'}
                                </span>
                            </div>
                        </div>

                        {/* Right: Action buttons */}
                        <div className="flex items-start gap-2">
                            <button
                                onClick={() => {
                                    // TODO: Navigate to edit page (Day 6)
                                    alert(`Edit functionality coming in Day 6. Surgery ID: ${surgery.id}`);
                                }}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: Delete confirmation modal (Day 6)
                                    alert(`Delete functionality coming in Day 6. Surgery ID: ${surgery.id}`);
                                }}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Details Grid ────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* — Schedule Info — */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium text-gray-800">
                                        {formatDate(surgery.scheduled_date)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium text-gray-800">
                                        {formatTime(surgery.scheduled_time)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium text-gray-800">
                                        {surgery.duration_minutes
                                            ? `${surgery.duration_minutes} minutes`
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Theatre</p>
                                    <p className="font-medium text-gray-800">
                                        {surgery.theatre_id
                                            ? `Theatre #${surgery.theatre_id}`
                                            : 'Unassigned'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* — Patient Info — */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-800">
                                        {surgery.patient_name || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Age</p>
                                    <p className="font-medium text-gray-800">
                                        {surgery.patient_age != null
                                            ? `${surgery.patient_age} years`
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="font-medium text-gray-800 capitalize">
                                        {surgery.patient_gender || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {surgery.patient_id && (
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Patient ID</p>
                                        <p className="font-medium text-gray-800">
                                            #{surgery.patient_id}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* — Surgeon Info — */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Surgeon</h2>

                        {surgery.surgeon ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-800">
                                            {surgery.surgeon.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-800">
                                            {surgery.surgeon.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No surgeon assigned yet.</p>
                        )}
                    </div>

                    {/* — Notes — */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>

                        {surgery.description && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Description</p>
                                <p className="text-gray-800">{surgery.description}</p>
                            </div>
                        )}

                        {surgery.notes ? (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{surgery.notes}</p>
                            </div>
                        ) : !surgery.description ? (
                            <p className="text-gray-500 italic">No notes available.</p>
                        ) : null}
                    </div>
                </div>

                {/* ── Timestamps ──────────────────────────────────── */}
                <div className="mt-6 text-xs text-gray-400 flex flex-wrap gap-4">
                    {surgery.created_at && (
                        <span>Created: {new Date(surgery.created_at).toLocaleString()}</span>
                    )}
                    {surgery.updated_at && (
                        <span>Updated: {new Date(surgery.updated_at).toLocaleString()}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurgeryDetail;
