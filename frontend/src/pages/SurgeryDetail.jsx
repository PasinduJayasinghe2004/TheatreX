// ============================================================================
// Surgery Detail Page
// ============================================================================
// Created by: M3 (Janani) - Day 5
// Updated by: M2 (Chandeepa) - Day 6 (Added delete confirmation modal)
// Updated by: M3 (Janani) - Day 6 (Added StatusBadge + status change UI)
//
// Displays full details of a single surgery fetched by ID.
// Uses surgeryService.getSurgeryById() for data retrieval.
// Uses surgeryService.deleteSurgery() for deletion with confirmation modal.
// Uses surgeryService.updateSurgeryStatus() for inline status changes.
// ============================================================================

import { useState, useEffect, useRef } from 'react';
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
    Trash2,
    ChevronDown,
    CheckCircle2,
    Stethoscope,
    Users
} from 'lucide-react';
import surgeryService from '../services/surgeryService';
import Layout from '../components/Layout';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';
import Modal from '../components/ui/Modal';
import StatusBadge, { VALID_STATUS_TRANSITIONS, STATUS_LABELS } from '../components/StatusBadge';

// ============================================================================
// Helper Functions
// ============================================================================

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

    // Delete modal state - M2 (Chandeepa) Day 6
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // ── Status change state ── M3 (Janani) Day 6 ──────────────────────────
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null); // { type, text }
    const statusMenuRef = useRef(null);

    // Close status dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
                setShowStatusMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-dismiss status messages after 4s
    useEffect(() => {
        if (statusMessage) {
            const t = setTimeout(() => setStatusMessage(null), 4000);
            return () => clearTimeout(t);
        }
    }, [statusMessage]);

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
                    const msg = response.message || 'Failed to load surgery details';
                    setError(msg);
                    toast.error(msg);
                }
            } catch (err) {
                const msg = err.message || 'An error occurred while fetching surgery details';
                setError(msg);
                toast.error(msg);
                console.error('Error fetching surgery:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSurgery();
    }, [id]);

    // ── Delete Surgery Handler ── M2 (Chandeepa) Day 6 ──────────────────
    const handleDeleteSurgery = async () => {
        try {
            setDeleting(true);
            setDeleteError(null);
            const response = await surgeryService.deleteSurgery(id);

            if (response.success) {
                // Close modal and navigate back to surgeries list
                setShowDeleteModal(false);
                toast.success(response.message || `Surgery "${surgery.surgery_type}" deleted successfully`);
                navigate('/surgeries');
            } else {
                const msg = response.message || 'Failed to delete surgery';
                setDeleteError(msg);
                toast.error(msg);
            }
        } catch (err) {
            const msg = err.message || 'An error occurred while deleting the surgery';
            setDeleteError(msg);
            toast.error(msg);
            console.error('Error deleting surgery:', err);
        } finally {
            setDeleting(false);
        }
    };

    // ── Status Change Handler ── M3 (Janani) Day 6 ──────────────────────
    const handleStatusChange = async (newStatus) => {
        try {
            setStatusUpdating(true);
            setShowStatusMenu(false);
            setStatusMessage(null);

            const response = await surgeryService.updateSurgeryStatus(id, newStatus);

            if (response.success) {
                setSurgery(prev => ({ ...prev, ...response.data }));
                toast.success(response.message || `Status updated to ${STATUS_LABELS[newStatus]}`);
            } else {
                const msg = response.message || 'Failed to update status';
                toast.error(msg);
            }
        } catch (err) {
            const msg = err.message || 'An error occurred while updating status';
            toast.error(msg);
            console.error('Error updating surgery status:', err);
        } finally {
            setStatusUpdating(false);
        }
    };

    // Get allowed next statuses for the current surgery
    const allowedTransitions = surgery
        ? (VALID_STATUS_TRANSITIONS[surgery.status] || [])
        : [];

    // ── Loading ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 py-8 px-4">
                    <Loading message="Fetching surgery details..." />
                </div>
            </Layout>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────
    if (error) {
        return (
            <Layout>
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
            </Layout>
        );
    }

    // ── Main Content ─────────────────────────────────────────────────────
    return (
        <Layout>
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

                    {/* ── Status change success / error toast ── M3 Day 6 ── */}
                    {statusMessage && (
                        <div
                            className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in ${statusMessage.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                        >
                            {statusMessage.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            )}
                            {statusMessage.text}
                        </div>
                    )}

                    {/* ── Header Card ─────────────────────────────────── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            {/* Left: Title & badges */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900" data-testid="surgery-type-title">
                                    {surgery.surgery_type}
                                </h1>
                                <p className="text-gray-500 mt-1">Surgery #{surgery.id}</p>
                                <div className="flex flex-wrap gap-2 mt-3 items-center">
                                    {/* ── Status Badge with dropdown ── M3 Day 6 ── */}
                                    <div className="relative" ref={statusMenuRef}>
                                        <StatusBadge
                                            status={surgery.status}
                                            size="md"
                                            onClick={allowedTransitions.length > 0 ? () => setShowStatusMenu(!showStatusMenu) : undefined}
                                            data-testid="status-badge"
                                        />
                                        {allowedTransitions.length > 0 && (
                                            <ChevronDown
                                                className={`inline w-3.5 h-3.5 ml-0.5 text-gray-500 transition-transform ${showStatusMenu ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        )}

                                        {/* Status dropdown menu */}
                                        {showStatusMenu && (
                                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                                <p className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                                                    Change status to
                                                </p>
                                                {allowedTransitions.map((nextStatus) => (
                                                    <button
                                                        key={nextStatus}
                                                        onClick={() => handleStatusChange(nextStatus)}
                                                        disabled={statusUpdating}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                    >
                                                        <StatusBadge status={nextStatus} size="sm" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Loading indicator during status update */}
                                    {statusUpdating && (
                                        <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getPriorityStyle(surgery.priority)}`}
                                        data-testid="priority-badge"
                                    >
                                        {surgery.priority || 'Routine'}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Action buttons */}
                            <div className="flex items-start gap-2">
                                <button
                                    onClick={() => {
                                        // TODO: Navigate to edit page (Day 6 - M1)
                                        alert(`Edit functionality coming soon. Surgery ID: ${surgery.id}`);
                                    }}
                                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
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
                                            {surgery.theatre_name || 'Unassigned'}
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
                            <div className="flex items-center gap-2 mb-4">
                                <Stethoscope className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Lead Surgeon</h2>
                            </div>

                            {surgery.surgeon ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
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

                        {/* — Anaesthetist Info — */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Anaesthetist</h2>
                            </div>

                            {surgery.anaesthetist ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium text-gray-800">
                                                {surgery.anaesthetist.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Specialization</p>
                                            <p className="font-medium text-gray-800">
                                                {surgery.anaesthetist.specialization || 'General Anaesthesia'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No anaesthetist assigned yet.</p>
                            )}
                        </div>

                        {/* — Nurses Info — */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-emerald-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Assigned Nurses</h2>
                            </div>

                            {surgery.nurses && surgery.nurses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {surgery.nurses.map((nurse) => (
                                        <div key={nurse.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                                {nurse.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{nurse.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">{nurse.role || 'Assistant'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No nurses assigned to this surgery.</p>
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

                {/* ── Delete Confirmation Modal ── M2 (Chandeepa) Day 6 ── */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        if (!deleting) {
                            setShowDeleteModal(false);
                            setDeleteError(null);
                        }
                    }}
                    title="Delete Surgery"
                    size="sm"
                    footer={
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteError(null);
                                }}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSurgery}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Surgery
                                    </>
                                )}
                            </button>
                        </div>
                    }
                >
                    <div className="text-center sm:text-left">
                        <div className="mx-auto sm:mx-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <p className="text-gray-700 mb-2">
                            Are you sure you want to delete this surgery?
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="font-semibold text-gray-900">{surgery.surgery_type}</p>
                            <p className="text-sm text-gray-500">
                                Surgery #{surgery.id} &middot; {surgery.patient_name || 'Unknown Patient'}
                            </p>
                        </div>
                        <p className="text-sm text-red-600 font-medium">
                            This action cannot be undone.
                        </p>
                        {deleteError && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{deleteError}</p>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default SurgeryDetail;
