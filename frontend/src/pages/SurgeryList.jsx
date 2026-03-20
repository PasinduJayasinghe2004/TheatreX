// ============================================================================
// Surgery List Page
// ============================================================================
// Created by: M2 (Chandeepa) - Day 5
// Updated by: M4 (Oneli) - Day 6 (Added date filtering)
// Updated by: M1 (Pasindu) - Day 6 (Added edit surgery modal)
// Updated by: M3 (Janani) - Day 6 (Added status filter)
// 
// Displays a list of all surgeries in a responsive grid layout
// Uses SurgeryCard component created by M4
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Filter, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'react-toastify';
import SurgeryCard from '../components/SurgeryCard';
import DateFilter from '../components/DateFilter';
import EditSurgeryModal from '../components/EditSurgeryModal';
import AssignStaffModal from '../components/AssignStaffModal';
import { ALL_STATUSES, STATUS_LABELS } from '../components/StatusBadge';
import surgeryService from '../services/surgeryService';


const SurgeryList = () => {
    const navigate = useNavigate();
    const [surgeries, setSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        status: null      // M3 (Janani) Day 6 — status filter
    });

    // ... existing state and effects ...
    const [editingSurgery, setEditingSurgery] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [assigningStaffSurgery, setAssigningStaffSurgery] = useState(null);
    const [showStaffModal, setShowStaffModal] = useState(false);

    // Fetch surgeries on component mount and when filters change
    useEffect(() => {
        fetchSurgeries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const fetchSurgeries = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await surgeryService.getAllSurgeries(filters);

            if (response.success) {
                setSurgeries(response.data);
            } else {
                const msg = response.message || 'Failed to load surgeries';
                setError(msg);
                toast.error(msg);
            }
        } catch (err) {
            const msg = err.message || 'An error occurred while fetching surgeries';
            setError(msg);
            toast.error(msg);
            console.error('Error fetching surgeries:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle initial action - can be generic 'edit' or 'staff'
    const handleAction = (surgeryId, action = 'edit') => {
        const surgery = surgeries.find(s => s.id === surgeryId);
        if (!surgery) return;

        if (action === 'staff') {
            setAssigningStaffSurgery(surgery);
            setShowStaffModal(true);
        } else {
            setEditingSurgery(surgery);
            setShowEditModal(true);
        }
    };

    // Handle staff assignment success
    const handleStaffAssigned = (updatedSurgery) => {
        // Update the local state for immediate feedback
        setSurgeries(prev => prev.map(s => s.id === updatedSurgery.id ? { ...s, ...updatedSurgery } : s));
        setShowStaffModal(false);
        setAssigningStaffSurgery(null);
        toast.success(`Staff assigned to surgery #${updatedSurgery.id} successfully`);
    };

    // Handle edit success - refresh list and close modal
    const handleEditSuccess = () => {
        setShowEditModal(false);
        setEditingSurgery(null);
        fetchSurgeries(); // Refresh the list
    };

    // ... existing handlers ...
    const handleEditCancel = () => {
        setShowEditModal(false);
        setEditingSurgery(null);
    };

    const handleStaffCancel = () => {
        setShowStaffModal(false);
        setAssigningStaffSurgery(null);
    };

    // Handle delete surgery
    const handleDelete = (surgeryId) => {
        console.log('Delete surgery:', surgeryId);
    };

    // Filter handlers
    const handleFilterChange = (startDate, endDate) => {
        setFilters(prev => ({ ...prev, startDate, endDate }));
    };

    const handleClearFilter = () => {
        setFilters(prev => ({ ...prev, startDate: null, endDate: null }));
    };

    const handleStatusFilterChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, status: value === 'all' ? null : value }));
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* ... Header and Filters ... */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="surgery-list-title">Surgeries</h1>
                            <p className="mt-1 text-gray-600 dark:text-slate-400">
                                Manage and view all scheduled surgeries
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/surgeries/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Create Surgery
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-2">
                        <DateFilter
                            onFilterChange={handleFilterChange}
                            onClearFilter={handleClearFilter}
                        />

                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                            <select
                                value={filters.status || 'all'}
                                onChange={handleStatusFilterChange}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="all">All Statuses</option>
                                {ALL_STATUSES.map(s => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <Loading message="Fetching surgery records..." />
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">Error Loading Surgeries</h3>
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={fetchSurgeries}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && !error && (
                        <>
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    {surgeries.length} {surgeries.length === 1 ? 'surgery' : 'surgeries'} found
                                </p>
                            </div>

                            {surgeries.length === 0 ? (
                                <EmptyState
                                    icon="📅"
                                    title="No Surgeries Found"
                                    description={
                                        filters.startDate || filters.endDate || filters.status
                                            ? "No surgeries match your current filters. Try adjusting your search criteria."
                                            : "There are no surgeries scheduled yet. Get started by creating your first surgery record."
                                    }
                                    actionButton={
                                        <button
                                            onClick={() => navigate('/surgeries/new')}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create First Surgery
                                        </button>
                                    }
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {surgeries.map((surgery) => (
                                        <SurgeryCard
                                            key={surgery.id}
                                            surgery={surgery}
                                            onEdit={handleAction}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Edit Surgery Modal */}
                {showEditModal && editingSurgery && (
                    <EditSurgeryModal
                        surgery={editingSurgery}
                        onSuccess={handleEditSuccess}
                        onCancel={handleEditCancel}
                    />
                )}

                {/* Assign Staff Modal */}
                {showStaffModal && assigningStaffSurgery && (
                    <AssignStaffModal
                        isOpen={showStaffModal}
                        surgery={assigningStaffSurgery}
                        onClose={handleStaffCancel}
                        onStaffAssigned={handleStaffAssigned}
                    />
                )}
            </div>
        </Layout>
    );
};

export default SurgeryList;