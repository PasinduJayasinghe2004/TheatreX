// ============================================================================
// Theatre List Page
// ============================================================================
// Created by: M1 (Pasindu) - Day 10
// Updated by: M3 (Janani)  - Day 11 (Auto-refresh polling every 30s)
// Updated by: M4 (Oneli)   - Day 12 (Maintenance mode toggle handler)
//
// Displays a list of all theatres in a responsive grid layout.
// Supports filtering by status and theatre type.
// Allows coordinators/admins to toggle theatre status.
// Shows current surgery information for theatres that are in use.
// Auto-refreshes every 30 seconds for live data (M3 - Day 11).
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Building2, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import TheatreCard from '../components/TheatreCard';
import TheatreStatusBadge, {
    ALL_THEATRE_STATUSES,
    THEATRE_STATUS_LABELS,
    ALL_THEATRE_TYPES,
    THEATRE_TYPE_LABELS
} from '../components/TheatreStatusBadge';
import TheatreStatusLegend from '../components/TheatreStatusLegend'; // M3 - Day 10
import theatreService from '../services/theatreService';
import { useAuth } from '../context/AuthContext';

const TheatreList = () => {
    const { user } = useAuth();
    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(null); // Track which theatre is being updated
    const [filters, setFilters] = useState({
        status: null,
        type: null
    });

    // Fetch theatres on mount and when filters change
    const fetchTheatres = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await theatreService.getAllTheatres(filters);

            if (response.success) {
                setTheatres(response.data);
            } else {
                setError(response.message || 'Failed to load theatres');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while fetching theatres');
            console.error('Error fetching theatres:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTheatres();
    }, [fetchTheatres]);

    // ── Auto-refresh every 30 s (M3 - Janani - Day 11) ──────────────────
    const autoRefreshRef = useRef(null);

    useEffect(() => {
        // Silent re-fetch that doesn't trigger the loading spinner
        const silentRefresh = async () => {
            try {
                const response = await theatreService.getAllTheatres(filters);
                if (response.success) {
                    setTheatres(response.data);
                }
            } catch {
                // Swallow errors on background refresh – user already has data
            }
        };

        autoRefreshRef.current = setInterval(silentRefresh, 30_000);

        return () => {
            if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
        };
    }, [filters]);

    // Handle status change
    const handleStatusChange = async (theatreId, newStatus) => {
        try {
            setStatusUpdating(theatreId);
            const response = await theatreService.updateTheatreStatus(theatreId, newStatus);

            if (response.success) {
                // Update local state for instant feedback
                setTheatres(prev =>
                    prev.map(t =>
                        t.id === theatreId ? { ...t, status: newStatus } : t
                    )
                );
            }
        } catch (err) {
            console.error('Error updating theatre status:', err);
            setError(err.message || 'Failed to update theatre status');
        } finally {
            setStatusUpdating(null);
        }
    };

    // Handle maintenance mode toggle - M4 (Oneli) - Day 12
    const handleMaintenanceToggle = async (theatreId, enable, reason) => {
        try {
            setStatusUpdating(theatreId);
            const response = await theatreService.toggleMaintenanceMode(theatreId, enable, reason);

            if (response.success) {
                // Update local state for instant feedback
                setTheatres(prev =>
                    prev.map(t =>
                        t.id === theatreId
                            ? {
                                ...t,
                                status: response.data.status,
                                maintenance_reason: response.data.maintenance_reason || null
                            }
                            : t
                    )
                );
            }
        } catch (err) {
            console.error('Error toggling maintenance mode:', err);
            setError(err.message || 'Failed to toggle maintenance mode');
        } finally {
            setStatusUpdating(null);
        }
    };

    // Filter handlers
    const handleStatusFilterChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, status: value === 'all' ? null : value }));
    };

    const handleTypeFilterChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, type: value === 'all' ? null : value }));
    };

    // Status summary counts
    const statusCounts = theatres.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <Building2 className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Theatres</h1>
                        </div>
                        <p className="mt-1 text-gray-600">
                            Manage and monitor operating theatre status
                        </p>
                    </div>

                    {/* Status Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {ALL_THEATRE_STATUSES.map(status => (
                            <div
                                key={status}
                                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statusCounts[status] || 0}
                                    </p>
                                    <p className="text-sm text-gray-500">{THEATRE_STATUS_LABELS[status]}</p>
                                </div>
                                <TheatreStatusBadge status={status} size="sm" />
                            </div>
                        ))}
                    </div>

                    {/* Interactive Status Legend Filter - M3 (Janani) Day 10 */}
                    <div className="mb-4">
                        <TheatreStatusLegend
                            size="md"
                            interactive
                            activeStatus={filters.status}
                            onStatusClick={(status) =>
                                setFilters(prev => ({ ...prev, status: status || null }))
                            }
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filters.status || 'all'}
                                onChange={handleStatusFilterChange}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="all">All Statuses</option>
                                {ALL_THEATRE_STATUSES.map(s => (
                                    <option key={s} value={s}>{THEATRE_STATUS_LABELS[s]}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filters.type || 'all'}
                                onChange={handleTypeFilterChange}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="all">All Types</option>
                                {ALL_THEATRE_TYPES.map(t => (
                                    <option key={t} value={t}>{THEATRE_TYPE_LABELS[t]}</option>
                                ))}
                            </select>
                        </div>

                        <p className="text-sm text-gray-500 ml-auto">
                            {theatres.length} {theatres.length === 1 ? 'theatre' : 'theatres'} found
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-red-600 mb-1">Error Loading Theatres</h3>
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={fetchTheatres}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && !error && (
                        <>
                            {theatres.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                    <div className="max-w-md mx-auto">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Building2 className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Theatres Found</h3>
                                        <p className="text-gray-600">
                                            {filters.status || filters.type
                                                ? 'No theatres match the selected filters. Try adjusting your filters.'
                                                : 'No theatres have been configured yet.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {theatres.map(theatre => (
                                        <TheatreCard
                                            key={theatre.id}
                                            theatre={theatre}
                                            onStatusChange={handleStatusChange}
                                            onMaintenanceToggle={handleMaintenanceToggle}
                                            userRole={user?.role}
                                            isUpdating={statusUpdating === theatre.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default TheatreList;
