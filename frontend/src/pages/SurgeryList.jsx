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
import { Plus, AlertCircle, Filter } from 'lucide-react';
import Layout from '../components/Layout';
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

    // Modal states
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
                setError(response.message || 'Failed to load surgeries');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while fetching surgeries');
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
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* ... Header and Filters ... */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900" data-testid="surgery-list-title">Surgeries</h1>
                            <p className="mt-1 text-gray-600">
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
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filters.status || 'all'}
                                onChange={handleStatusFilterChange}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-red-600 mb-1">Error Loading Surgeries</h3>
                            <div className="flex items-center gap-2 text-red-600">
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
                                <p className="text-sm text-gray-600">
                                    {surgeries.length} {surgeries.length === 1 ? 'surgery' : 'surgeries'} found
                                </p>
                            </div>

                            {surgeries.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                    <div className="max-w-md mx-auto">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Plus className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Surgeries Found</h3>
                                        <p className="text-gray-600 mb-6">
                                            Get started by creating your first surgery. Click the &quot;Create Surgery&quot; button above.
                                        </p>
                                        <button
                                            onClick={() => navigate('/surgeries/new')}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create First Surgery
                                        </button>
                                    </div>
                                </div>
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