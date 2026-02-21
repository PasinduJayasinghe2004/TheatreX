// ============================================================================
// Theatre Detail Page
// ============================================================================
// Created by: M2 (Chandeepa) - Day 10
//
// Displays full details of a single theatre fetched by ID.
// Uses theatreService.getTheatreById() for data retrieval.
// Shows current surgery, upcoming surgeries, and recent history
// via the TheatreDetailCard component.
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import TheatreDetailCard from '../components/TheatreDetailCard';
import theatreService from '../services/theatreService';

const TheatreDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [theatre, setTheatre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

                {/* Theatre Detail Card */}
                <TheatreDetailCard theatre={theatre} />
            </div>
        </div>
    );
};

export default TheatreDetail;
