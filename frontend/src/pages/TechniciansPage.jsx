// ============================================================================
// TechniciansPage
// ============================================================================
// Created by: M4 (Oneli) - Day 14
//
// Full technicians management page featuring:
// - Technician list (card grid) fetched from GET /api/technicians
// - Search by name/email, filter by specialization and availability
// - "Add Technician" button (coordinator/admin only) → opens TechnicianForm
// - Edit / Delete actions on each card (coordinator/admin only)
// - Delete confirmation modal
// - Loading / error / empty states
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Search, Filter, RefreshCw, Edit3, Trash2,
    Phone, Mail, Briefcase, Clock, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import TechnicianForm from '../components/TechnicianForm';
import technicianService from '../services/technicianService';
import { useAuth } from '../context/AuthContext';
import { useStaff } from '../context/StaffContext';
import { toast } from 'react-toastify';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';

// ── helpers ──────────────────────────────────────────────────────────────────

const SHIFT_LABELS = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    night: 'Night',
    flexible: 'Flexible',
};

const SHIFT_COLORS = {
    morning: 'bg-yellow-100 text-yellow-700',
    afternoon: 'bg-orange-100 text-orange-700',
    night: 'bg-indigo-100 text-indigo-700',
    flexible: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400',
};

// ── TechnicianCard ───────────────────────────────────────────────────────────

const TechnicianCard = ({ tech, canManage, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
        {/* Header: avatar + name + availability */}
        <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm">
                        {tech.name?.trim().charAt(0).toUpperCase() ?? 'T'}
                    </span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tech.name}</h3>
                    {tech.license_number && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">#{tech.license_number}</p>
                    )}
                </div>
            </div>

            {/* Availability badge */}
            {tech.is_available ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">
                    <CheckCircle className="w-3 h-3" /> Available
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex-shrink-0">
                    <XCircle className="w-3 h-3" /> Unavailable
                </span>
            )}
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-sm text-gray-600 dark:text-slate-400">
            <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                <span className="truncate">{tech.email}</span>
            </div>
            {tech.phone && (
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                    <span>{tech.phone}</span>
                </div>
            )}
            {tech.specialization && (
                <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                    <span className="truncate">{tech.specialization}</span>
                </div>
            )}
        </div>

        {/* Footer: shift + experience + actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
                {tech.shift_preference && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${SHIFT_COLORS[tech.shift_preference] ?? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                        <Clock className="w-3 h-3" />
                        {SHIFT_LABELS[tech.shift_preference] ?? tech.shift_preference}
                    </span>
                )}
                {tech.years_of_experience > 0 && (
                    <span className="text-xs text-gray-400">
                        {tech.years_of_experience} yr{tech.years_of_experience !== 1 ? 's' : ''} exp.
                    </span>
                )}
            </div>

            {canManage && (
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => onEdit(tech)}
                        title="Edit technician"
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(tech)}
                        title="Delete technician"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    </div>
);

// ── DeleteConfirmModal ───────────────────────────────────────────────────────

const DeleteConfirmModal = ({ tech, onConfirm, onCancel, loading }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4\">
                <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400\" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1\">Delete Technician</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6\">
                Are you sure you want to delete <strong>{tech.name}</strong>? This action can be undone by an admin.
            </p>
            <div className="flex justify-center gap-3">
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Deleting…
                        </>
                    ) : (
                        <>
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
);

// ── TechniciansPage ──────────────────────────────────────────────────────────

const TechniciansPage = () => {
    const { user } = useAuth();
    const { notifyStaffDataChanged } = useStaff();

    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingTech, setEditingTech] = useState(null);
    const [deletingTech, setDeletingTech] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('');
    const [filterAvailability, setFilterAvailability] = useState('all'); // 'all' | 'available' | 'unavailable'

    const canManage = user?.role === 'coordinator' || user?.role === 'admin';

    // ── fetch ──────────────────────────────────────────────────────────────
    const fetchTechnicians = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (filterSpecialization.trim()) filters.specialization = filterSpecialization.trim();
            if (filterAvailability === 'available') filters.is_available = true;
            if (filterAvailability === 'unavailable') filters.is_available = false;

            const response = await technicianService.getAllTechnicians(filters);
            setTechnicians(response.data ?? []);
        } catch (err) {
            const msg = err.message || 'Failed to load technicians.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [filterSpecialization, filterAvailability]);

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    // ── client-side search filter ──────────────────────────────────────────
    const displayed = technicians.filter(t => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            t.name?.toLowerCase().includes(q) ||
            t.email?.toLowerCase().includes(q) ||
            t.specialization?.toLowerCase().includes(q)
        );
    });

    // ── unique specializations for filter dropdown ─────────────────────────
    const specializations = [...new Set(technicians.map(t => t.specialization).filter(Boolean))].sort();

    // ── handlers ──────────────────────────────────────────────────────────
    const handleCreated = (newTech) => {
        setShowForm(false);
        setTechnicians(prev => [newTech, ...prev]);
        // Notify other components that staff data has changed
        notifyStaffDataChanged('technician');
    };

    const handleUpdated = (updatedTech) => {
        setEditingTech(null);
        setTechnicians(prev =>
            prev.map(t => (t.id === updatedTech.id ? updatedTech : t))
        );
        // Notify other components that staff data has changed
        notifyStaffDataChanged('technician');
    };

    const handleDelete = async () => {
        if (!deletingTech) return;
        setDeleteLoading(true);
        try {
            const response = await technicianService.deleteTechnician(deletingTech.id);
            setTechnicians(prev => prev.filter(t => t.id !== deletingTech.id));
            toast.success(response.message || `Technician '${deletingTech.name}' deleted successfully`);
            setDeletingTech(null);
            // Notify other components that staff data has changed
            notifyStaffDataChanged('technician');
        } catch (err) {
            const msg = err.message || 'Failed to delete technician.';
            setError(msg);
            toast.error(msg);
            setDeletingTech(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── render ─────────────────────────────────────────────────────────────
    return (
        <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Technicians
                            {!loading && (
                                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                                    {technicians.length}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage technical staff assignments and availability</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchTechnicians}
                            disabled={loading}
                            title="Refresh list"
                            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {canManage && (
                            <button
                                id="add-technician-btn"
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Technician
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 mb-6 flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                            id="technician-search"
                            type="text"
                            placeholder="Search name, email or specialization…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        />
                    </div>

                    {/* Specialization filter */}
                    <div className="relative sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <select
                            id="technician-filter-spec"
                            value={filterSpecialization}
                            onChange={e => setFilterSpecialization(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors appearance-none"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Availability filter */}
                    <select
                        id="technician-filter-avail"
                        value={filterAvailability}
                        onChange={e => setFilterAvailability(e.target.value)}
                        className="sm:w-40 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                </div>

                {/* Content */}
                {loading ? (
                    <Loading message="Fetching technicians..." />
                ) : error ? (
                    /* Error state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Failed to load technicians</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 max-w-xs">{error}</p>
                        <button
                            onClick={fetchTechnicians}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : displayed.length === 0 ? (
                    <EmptyState
                        icon="🛠️"
                        title={search || filterSpecialization || filterAvailability !== 'all' ? 'No technicians match your filters' : 'No technicians found'}
                        description={
                            search || filterSpecialization || filterAvailability !== 'all'
                                ? 'Try adjusting your filters or search query to find who you are looking for.'
                                : canManage
                                    ? 'Start by adding your first technician record to the system.'
                                    : 'There are no technicians registered in the system.'
                        }
                        actionButton={
                            canManage && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add First Technician
                                </button>
                            )
                        }
                    />
                ) : (
                    /* Technician card grid */
                    <>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
                            Showing {displayed.length} of {technicians.length} technician{technicians.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {displayed.map(tech => (
                                <TechnicianCard
                                    key={tech.id}
                                    tech={tech}
                                    canManage={canManage}
                                    onEdit={(t) => setEditingTech(t)}
                                    onDelete={(t) => setDeletingTech(t)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Technician Modal */}
            {showForm && (
                <TechnicianForm
                    onSuccess={handleCreated}
                    onClose={() => setShowForm(false)}
                />
            )}

            {/* Edit Technician Modal */}
            {editingTech && (
                <TechnicianForm
                    technician={editingTech}
                    onSuccess={handleUpdated}
                    onClose={() => setEditingTech(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingTech && (
                <DeleteConfirmModal
                    tech={deletingTech}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingTech(null)}
                    loading={deleteLoading}
                />
            )}
        </div>
        </Layout>
    );
};

export default TechniciansPage;
