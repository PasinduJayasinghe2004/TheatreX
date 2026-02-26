// ============================================================================
// NursesPage
// ============================================================================
// Created by: M4 (Oneli) - Day 13
//
// Nurses management page featuring:
// - Nurse list (card grid) fetched from GET /api/nurses
// - Search by name/email, filter by specialization and availability
// - "Add Nurse" button (coordinator/admin only) → opens NurseForm modal
// - Loading / error / empty states
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Search, Filter, RefreshCw,
    Phone, Mail, Briefcase, Clock, CheckCircle, XCircle
} from 'lucide-react';
import NurseForm from '../components/NurseForm';
import nurseService from '../services/nurseService';
import { useAuth } from '../context/AuthContext';

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
    flexible: 'bg-gray-100 text-gray-600',
};

// ── NurseCard ────────────────────────────────────────────────────────────────

const NurseCard = ({ nurse }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
        {/* Header: avatar + name + availability */}
        <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">
                        {nurse.name?.trim().charAt(0).toUpperCase() ?? 'N'}
                    </span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{nurse.name}</h3>
                    {nurse.license_number && (
                        <p className="text-xs text-gray-400 truncate">#{nurse.license_number}</p>
                    )}
                </div>
            </div>

            {/* Availability badge */}
            {nurse.is_available ? (
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
        <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{nurse.email}</span>
            </div>
            {nurse.phone && (
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{nurse.phone}</span>
                </div>
            )}
            {nurse.specialization && (
                <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{nurse.specialization}</span>
                </div>
            )}
        </div>

        {/* Footer: shift + experience */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100">
            {nurse.shift_preference && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${SHIFT_COLORS[nurse.shift_preference] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Clock className="w-3 h-3" />
                    {SHIFT_LABELS[nurse.shift_preference] ?? nurse.shift_preference}
                </span>
            )}
            {nurse.years_of_experience > 0 && (
                <span className="text-xs text-gray-400">
                    {nurse.years_of_experience} yr{nurse.years_of_experience !== 1 ? 's' : ''} exp.
                </span>
            )}
        </div>
    </div>
);

// ── NursesPage ────────────────────────────────────────────────────────────────

const NursesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('');
    const [filterAvailability, setFilterAvailability] = useState('all'); // 'all' | 'available' | 'unavailable'

    const canManage = user?.role === 'coordinator' || user?.role === 'admin';

    // ── fetch ──────────────────────────────────────────────────────────────
    const fetchNurses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (filterSpecialization.trim()) filters.specialization = filterSpecialization.trim();
            if (filterAvailability === 'available') filters.is_available = true;
            if (filterAvailability === 'unavailable') filters.is_available = false;

            const response = await nurseService.getAllNurses(filters);
            setNurses(response.data ?? []);
        } catch (err) {
            setError(err.message || 'Failed to load nurses.');
        } finally {
            setLoading(false);
        }
    }, [filterSpecialization, filterAvailability]);

    useEffect(() => {
        fetchNurses();
    }, [fetchNurses]);

    // ── client-side search filter ──────────────────────────────────────────
    const displayed = nurses.filter(n => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            n.name?.toLowerCase().includes(q) ||
            n.email?.toLowerCase().includes(q) ||
            n.specialization?.toLowerCase().includes(q)
        );
    });

    // ── unique specializations for filter dropdown ─────────────────────────
    const specializations = [...new Set(nurses.map(n => n.specialization).filter(Boolean))].sort();

    // ── handlers ──────────────────────────────────────────────────────────
    const handleNurseCreated = (newNurse) => {
        setShowForm(false);
        setNurses(prev => [newNurse, ...prev]);
    };

    // ── render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Nurses
                            {!loading && (
                                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    {nurses.length}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage nursing staff assignments and availability</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchNurses}
                            disabled={loading}
                            title="Refresh list"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {canManage && (
                            <button
                                id="add-nurse-btn"
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Nurse
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
                            id="nurse-search"
                            type="text"
                            placeholder="Search name, email or specialization…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Specialization filter */}
                    <div className="relative sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            id="nurse-filter-spec"
                            value={filterSpecialization}
                            onChange={e => setFilterSpecialization(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Availability filter */}
                    <select
                        id="nurse-filter-avail"
                        value={filterAvailability}
                        onChange={e => setFilterAvailability(e.target.value)}
                        className="sm:w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
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
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Failed to load nurses</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-xs">{error}</p>
                        <button
                            onClick={fetchNurses}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : displayed.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <UserPlus className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {search || filterSpecialization || filterAvailability !== 'all'
                                ? 'No nurses match your filters'
                                : 'No nurses yet'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-xs">
                            {search || filterSpecialization || filterAvailability !== 'all'
                                ? 'Try adjusting your filters or search query.'
                                : canManage
                                    ? 'Add the first nurse to get started.'
                                    : 'No nurses have been added yet.'}
                        </p>
                        {canManage && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Nurse
                            </button>
                        )}
                    </div>
                ) : (
                    /* Nurse card grid */
                    <>
                        <p className="text-xs text-gray-400 mb-3">
                            Showing {displayed.length} of {nurses.length} nurse{nurses.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {displayed.map(nurse => (
                                <NurseCard key={nurse.id} nurse={nurse} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Nurse Modal */}
            {showForm && (
                <NurseForm
                    onSuccess={handleNurseCreated}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default NursesPage;
