// ============================================================================
// Theatre Detail Page
// ============================================================================
// Created by: M2 (Chandeepa) - Day 10
// Updated by: M4 (Oneli)     - Day 10 (Status toggle integration)
// Updated by: M1 (Pasindu)   - Day 11 (Progress slider integration)
// Updated by: M3 (Janani)    - Day 11 (Auto-refresh polling every 30s)
//
// Displays full details of a single theatre fetched by ID.
// Uses theatreService.getTheatreById() for data retrieval.
// Coordinators/admins can toggle theatre status via the detail card.
// Coordinators/admins can update surgery progress via the detail card (Day 11).
// Shows current surgery, upcoming surgeries, and recent history
// via the TheatreDetailCard component.
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import TheatreDetailCard from '../components/TheatreDetailCard';
import theatreService from '../services/theatreService';
import { useAuth } from '../context/AuthContext'; // M4 - Day 10

const TheatreDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // M4 - Day 10

    const [theatre, setTheatre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false); // M4 - Day 10
    const [progressUpdating, setProgressUpdating] = useState(false); // M1 - Day 11

    // Fetch theatre data on mount / id change
    useEffect(() => {
        const fetchTheatre = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await theatreService.getTheatreById(id);

                if (response.success) {
                    setTheatre(response.data);
                } else {
                    setError(response.message || 'Failed to load theatre details');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while fetching theatre details');
                console.error('Error fetching theatre:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTheatre();
    }, [id]);

    // ── Auto-refresh every 30 s (M3 - Janani - Day 11) ───────────────────
    const autoRefreshRef = useRef(null);

    useEffect(() => {
        const silentRefresh = async () => {
            try {
                const response = await theatreService.getTheatreById(id);
                if (response.success) {
                    setTheatre(response.data);
                }
            } catch {
                // Swallow errors on background refresh
            }
        };

        autoRefreshRef.current = setInterval(silentRefresh, 30_000);

        return () => {
            if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
        };
    }, [id]);

    // ── Status Change Handler (M4 - Oneli - Day 10) ─────────────────────────
    const handleStatusChange = async (theatreId, newStatus) => {
        try {
            setStatusUpdating(true);
            const response = await theatreService.updateTheatreStatus(theatreId, newStatus);

            if (response.success) {
                // Update local state for instant UI feedback
                setTheatre(prev => prev ? { ...prev, status: newStatus } : prev);
            }
        } catch (err) {
            console.error('Error updating theatre status:', err);
            setError(err.message || 'Failed to update theatre status');
        } finally {
            setStatusUpdating(false);
        }
    };

    // ── Progress Change Handler (M1 - Pasindu - Day 11) ─────────────────────
    const handleProgressChange = async (progress) => {
        try {
            setProgressUpdating(true);
            const response = await theatreService.updateProgress(id, progress);

            if (response.success) {
                // Update local state for instant UI feedback
                setTheatre(prev => prev ? {
                    ...prev,
                    current_surgery_progress: progress
                } : prev);
            }
        } catch (err) {
            console.error('Error updating surgery progress:', err);
            setError(err.message || 'Failed to update surgery progress');
        } finally {
            setProgressUpdating(false);
        }
    };

    // ── Loading State ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Error State ────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => navigate('/theatres')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back to Theatres</span>
                    </button>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h2 className="text-lg font-semibold text-red-700 mb-1">Error Loading Theatre</h2>
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

    // ── Content ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate('/theatres')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to Theatres</span>
                </button>

                {/* Theatre Detail Card with status toggle - M4 (Oneli) Day 10 */}
                {/* Updated by M1 - Day 11: Added progress slider integration */}
                <TheatreDetailCard
                    theatre={theatre}
                    onStatusChange={handleStatusChange}
                    onProgressChange={handleProgressChange}
                    userRole={user?.role}
                    isUpdating={statusUpdating}
                    isProgressUpdating={progressUpdating}
                />
            </div>
        </div>
    );
};

export default TheatreDetail;
