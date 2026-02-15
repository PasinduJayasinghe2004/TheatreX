// ============================================================================
// Surgery List Page
// ============================================================================
// Created by: M2 (Chandeepa) - Day 5
// Updated by: M4 (Oneli) - Day 6 (Added date filtering)
// Updated by: M1 (Pasindu) - Day 6 (Added edit surgery modal)
// 
// Displays a list of all surgeries in a responsive grid layout
// Uses SurgeryCard component created by M4
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import SurgeryCard from '../components/SurgeryCard';
import DateFilter from '../components/DateFilter';
import EditSurgeryModal from '../components/EditSurgeryModal';
import surgeryService from '../services/surgeryService';
import Loading from '../components/ui/Loading';

const SurgeryList = () => {
    const navigate = useNavigate();
    const [surgeries, setSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null
    });
    
    // Edit modal state
    const [editingSurgery, setEditingSurgery] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch surgeries on component mount and when filters change
    useEffect(() => {
        fetchSurgeries();
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

    // Handle edit surgery - opens modal
    const handleEdit = (surgeryId) => {
        const surgery = surgeries.find(s => s.id === surgeryId);
        if (surgery) {
            setEditingSurgery(surgery);
            setShowEditModal(true);
        }
    };

    // Handle edit success - refresh list and close modal
    const handleEditSuccess = () => {
        setShowEditModal(false);
        setEditingSurgery(null);
        fetchSurgeries(); // Refresh the list
    };

    // Handle edit cancel - close modal
    const handleEditCancel = () => {
        setShowEditModal(false);
        setEditingSurgery(null);
    };

    // Handle delete surgery
    const handleDelete = (surgeryId) => {
        // TODO: Implement delete confirmation modal and API call (Day 6)
        console.log('Delete surgery:', surgeryId);
        alert(`Delete functionality will be implemented in Day 6. Surgery ID: ${surgeryId}`);
    };

    // Handle filter change
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Handle clear filter
    const handleClearFilter = () => {
        setFilters({
            startDate: null,
            endDate: null
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <Loading />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
                        <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-800 mb-1">Error Loading Surgeries</h3>
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={fetchSurgeries}
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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Surgeries</h1>
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

                {/* Date Filter */}
                <DateFilter
                    onFilterChange={handleFilterChange}
                    onClearFilter={handleClearFilter}
                />

                {/* Surgery Count */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        {surgeries.length} {surgeries.length === 1 ? 'surgery' : 'surgeries'} found
                    </p>
                </div>

                {/* Empty State */}
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
                    /* Surgery Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {surgeries.map((surgery) => (
                            <SurgeryCard
                                key={surgery.id}
                                surgery={surgery}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
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
        </div>
    );
};

export default SurgeryList;