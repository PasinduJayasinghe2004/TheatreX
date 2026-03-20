// ============================================================================
// Surgery History Page
// ============================================================================
// Created by: M1 (Pasindu) - Day 20
//
// Displays completed surgeries fetched from GET /api/surgeries/history.
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DateFilter from '../components/DateFilter';
import surgeryService from '../services/surgeryService';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
};

const formatTime = (value) => {
    if (!value) return 'N/A';
    const raw = String(value);
    const timePart = raw.includes('T') ? raw.split('T')[1].slice(0, 5) : raw.slice(0, 5);
    if (!timePart || timePart.length < 4) return raw;
    return timePart;
};

const HistoryPage = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [surgeons, setSurgeons] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        surgeonId: null,
        theatreId: null,
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [isExportingHistory, setIsExportingHistory] = useState(false);
    const [exportingDetailId, setExportingDetailId] = useState(null);

    const fetchSurgeons = async () => {
        try {
            const response = await surgeryService.getSurgeons();
            if (response?.success) {
                setSurgeons(response.data || []);
            }
        } catch (err) {
            console.error('Failed to load surgeons for filter:', err);
        }
    };

    const fetchTheatres = async () => {
        try {
            const response = await surgeryService.getTheatres();
            if (response?.success) {
                setTheatres(response.data || []);
            }
        } catch (err) {
            console.error('Failed to load theatres for filter:', err);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await surgeryService.getSurgeryHistory(filters);
            if (response?.success) {
                setHistory(response.data || []);
                if (response.pagination) {
                    setPagination(response.pagination);

                    // Keep local request page in sync if backend clamps page bounds.
                    if (response.pagination.page !== filters.page) {
                        setFilters(prev => ({ ...prev, page: response.pagination.page }));
                    }
                }
            } else {
                const msg = response?.message || 'Failed to load surgery history';
                setError(msg);
                toast.error(msg);
            }
        } catch (err) {
            const msg = err.message || 'Failed to load surgery history';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurgeons();
        fetchTheatres();
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [filters.startDate, filters.endDate, filters.surgeonId, filters.theatreId, filters.page, filters.limit]);

    const handleFilterChange = ({ startDate, endDate }) => {
        setFilters(prev => ({
            ...prev,
            startDate: startDate || null,
            endDate: endDate || null,
            page: 1
        }));
    };

    const handleClearFilter = () => {
        setFilters({
            startDate: null,
            endDate: null,
            surgeonId: null,
            theatreId: null,
            page: 1,
            limit: 10
        });
    };

    const handleSurgeonFilterChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            surgeonId: value ? Number(value) : null,
            page: 1
        }));
    };

    const handleTheatreFilterChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            theatreId: value ? Number(value) : null,
            page: 1
        }));
    };

    const handlePrevPage = () => {
        setFilters(prev => ({
            ...prev,
            page: Math.max(1, pagination.page - 1)
        }));
    };

    const handleNextPage = () => {
        setFilters(prev => ({
            ...prev,
            page: Math.min(pagination.totalPages, pagination.page + 1)
        }));
    };

    const triggerDownload = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename || 'download.csv';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleExportHistoryCsv = async () => {
        try {
            setIsExportingHistory(true);
            setError(null);

            const { blob, filename } = await surgeryService.exportSurgeryHistoryCsv({
                startDate: filters.startDate,
                endDate: filters.endDate,
                surgeonId: filters.surgeonId,
                theatreId: filters.theatreId
            });

            triggerDownload(blob, filename);
        } catch (err) {
            setError(err.message || 'Failed to export surgery history');
        } finally {
            setIsExportingHistory(false);
        }
    };

    const handleExportDetailCsv = async (surgeryId) => {
        try {
            setExportingDetailId(surgeryId);
            setError(null);
            const { blob, filename } = await surgeryService.exportSurgeryDetailCsv(surgeryId);
            triggerDownload(blob, filename);
            toast.success('Surgery details exported successfully');
        } catch (err) {
            const msg = err.message || 'Failed to export surgery detail';
            setError(msg);
            toast.error(msg);
        } finally {
            setExportingDetailId(null);
        }
    };

    const handlePrintView = (surgeryId) => {
        navigate(`/history/${surgeryId}/print`);
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Surgery History</h1>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                            Completed surgeries archive
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportHistoryCsv}
                            disabled={isExportingHistory}
                            className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isExportingHistory ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            onClick={async () => {
                                await fetchHistory();
                                toast.info('History archive refreshed');
                            }}
                            className="px-3 py-2 text-sm font-medium rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <DateFilter
                    onFilterChange={handleFilterChange}
                    onClearFilter={handleClearFilter}
                />

                <div className="flex justify-end">
                    <button
                        aria-label="Reset all filters"
                        onClick={handleClearFilter}
                        className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Reset All Filters
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                    <label htmlFor="history-surgeon-filter" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Surgeon
                    </label>
                    <select
                        id="history-surgeon-filter"
                        value={filters.surgeonId || ''}
                        onChange={handleSurgeonFilterChange}
                        className="w-full md:w-80 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Surgeons</option>
                        {surgeons.map((surgeon) => (
                            <option key={surgeon.id} value={surgeon.id}>
                                {surgeon.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                    <label htmlFor="history-theatre-filter" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Theatre
                    </label>
                    <select
                        id="history-theatre-filter"
                        value={filters.theatreId || ''}
                        onChange={handleTheatreFilterChange}
                        className="w-full md:w-80 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Theatres</option>
                        {theatres.map((theatre) => (
                            <option key={theatre.id} value={theatre.id}>
                                {theatre.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <Loading message="Fetching surgery history archive..." />
                )}

                {!loading && error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
                        <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                        <button
                            onClick={fetchHistory}
                            className="mt-3 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && history.length === 0 && (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-10 text-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No completed surgeries yet</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                            Completed surgeries will appear here once operations are marked as done.
                        </p>
                    </div>
                )}

                {!loading && !error && history.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-600 dark:text-slate-300">
                                    <tr>
                                        <th className="text-left font-semibold px-4 py-3">Date</th>
                                        <th className="text-left font-semibold px-4 py-3">Time</th>
                                        <th className="text-left font-semibold px-4 py-3">Patient</th>
                                        <th className="text-left font-semibold px-4 py-3">Surgery</th>
                                        <th className="text-left font-semibold px-4 py-3">Surgeon</th>
                                        <th className="text-left font-semibold px-4 py-3">Theatre</th>
                                        <th className="text-left font-semibold px-4 py-3">Duration</th>
                                        <th className="text-left font-semibold px-4 py-3">Status</th>
                                        <th className="text-left font-semibold px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {history.map((item) => (
                                        <tr key={item.id} className="text-gray-800 dark:text-slate-100">
                                            <td className="px-4 py-3">{formatDate(item.scheduled_date)}</td>
                                            <td className="px-4 py-3">{formatTime(item.scheduled_time)}</td>
                                            <td className="px-4 py-3">{item.patient_name || 'Unknown'}</td>
                                            <td className="px-4 py-3">{item.surgery_type || 'N/A'}</td>
                                            <td className="px-4 py-3">{item.surgeon_name || 'Unassigned'}</td>
                                            <td className="px-4 py-3">{item.theatre_name || `Theatre ${item.theatre_id ?? '-'}`}</td>
                                            <td className="px-4 py-3">{item.duration_minutes || 0} min</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                    Completed
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleExportDetailCsv(item.id)}
                                                        disabled={exportingDetailId === item.id}
                                                        className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {exportingDetailId === item.id ? 'Exporting...' : 'Detail CSV'}
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrintView(item.id)}
                                                        className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                                                    >
                                                        Print View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700">
                            <p className="text-sm text-gray-600 dark:text-slate-300">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    aria-label="Previous page"
                                    onClick={handlePrevPage}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    Previous
                                </button>
                                <button
                                    aria-label="Next page"
                                    onClick={handleNextPage}
                                    disabled={!pagination.hasNextPage}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HistoryPage;
