// ============================================================================
// Analytics Page
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
// Updated by: M2 (Chandeepa) - Day 18 (Status counts section + page layout)
// Updated by: M3 (Janani) - Day 18 (Patient demographics stats cards)
// Updated by: Copilot - Day 19 (Patient demographics bar chart)
//
// Displays analytics charts and statistics.
// Uses Recharts for data visualization.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { toast } from 'react-toastify';
import Loading from '../components/common/Loading';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    getSurgeryStatusCounts,
    getPatientDemographics,
    getStaffCountsByRole,
    getTheatreUtilization,
    getSurgeriesPerDay,
    getSurgeryDurationStats,
    getPeakHoursAnalysis
} from '../services/analyticsService';
import StaffDistribution from '../components/analytics/StaffDistribution';
import PatientDemographicsBarChart from '../components/analytics/PatientDemographicsBarChart';
import DurationHistogram from '../components/analytics/DurationHistogram';
import TheatreUtilizationStats from '../components/analytics/TheatreUtilizationStats';
import PeakHoursChart from '../components/analytics/PeakHoursChart';

// ──────────────────────────────────────────────────────────────────────────────
// Custom Tooltip Component
// ──────────────────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 shadow-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{label}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {payload[0].value} {payload[0].value === 1 ? 'surgery' : 'surgeries'}
                </p>
            </div>
        );
    }
    return null;
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Analytics Page Component
// ──────────────────────────────────────────────────────────────────────────────

const AnalyticsPage = () => {
    const [chartData, setChartData] = useState([]);
    const [statusData, setStatusData] = useState(null);
    const [demographicsData, setDemographicsData] = useState(null);
    const [staffData, setStaffData] = useState(null);
    const [utilizationData, setUtilizationData] = useState(null);
    const [durationData, setDurationData] = useState(null);
    const [peakHoursData, setPeakHoursData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartType, setChartType] = useState('line'); // 'area' | 'bar' | 'line'

    // Date filters for status breakdown
    const [statusStartDate, setStatusStartDate] = useState('');
    const [statusEndDate, setStatusEndDate] = useState('');

    // Status color mapping
    const STATUS_CONFIG = {
        scheduled: { color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-700', label: 'Scheduled', icon: '📅' },
        in_progress: { color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700', label: 'In Progress', icon: '⏳' },
        completed: { color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700', label: 'Completed', icon: '✅' },
        cancelled: { color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-700', label: 'Cancelled', icon: '❌' },
    };

    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const results = await Promise.allSettled([
                getSurgeriesPerDay(),
                getSurgeryStatusCounts(statusStartDate, statusEndDate),
                getPatientDemographics(),
                getStaffCountsByRole(),
                getTheatreUtilization(),
                getSurgeryDurationStats(),
                getPeakHoursAnalysis()
            ]);

            const [
                perDayResult,
                statusResult,
                demoResult,
                staffResult,
                utilizationResult,
                durationResult,
                peakHoursResult
            ] = results;

            const extractData = (result) => (
                result.status === 'fulfilled' && result.value?.success ? result.value.data : null
            );

            const perDayData = extractData(perDayResult);
            const statusDataValue = extractData(statusResult);
            const demographicsDataValue = extractData(demoResult);
            const staffDataValue = extractData(staffResult);
            const utilizationDataValue = extractData(utilizationResult);
            const durationDataValue = extractData(durationResult);
            const peakHoursDataValue = extractData(peakHoursResult);

            if (perDayData) setChartData(perDayData);
            if (statusDataValue) setStatusData(statusDataValue);
            if (demographicsDataValue) setDemographicsData(demographicsDataValue);
            if (staffDataValue) setStaffData(staffDataValue);
            if (utilizationDataValue) setUtilizationData(utilizationDataValue);
            if (durationDataValue) setDurationData(durationDataValue);
            if (peakHoursDataValue) setPeakHoursData(peakHoursDataValue);

            const successfulCount = [
                perDayData,
                statusDataValue,
                demographicsDataValue,
                staffDataValue,
                utilizationDataValue,
                durationDataValue,
                peakHoursDataValue
            ].filter(Boolean).length;

            if (successfulCount === 0) {
                throw new Error('All analytics requests failed');
            }

            if (successfulCount < results.length) {
                toast.warn('Some analytics sections could not be loaded.');
            }
        } catch (err) {
            console.error('Error fetching analytics data:', err);
            const msg = 'Failed to load analytics data. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [statusStartDate, statusEndDate]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const fetchStatusDataOnly = useCallback(async () => {
        try {
            const statusRes = await getSurgeryStatusCounts(statusStartDate, statusEndDate);
            if (statusRes?.success) {
                setStatusData(statusRes.data);
            }
        } catch (err) {
            console.error('Error fetching surgery status counts:', err);
        }
    }, [statusStartDate, statusEndDate]);

    // Refetch status data when dates change
    useEffect(() => {
        // Only trigger if we already finished initial load (not loading)
        // to avoid double fetching on mount
        if (!loading) {
            fetchStatusDataOnly();
        }
    }, [fetchStatusDataOnly, loading]);

    // Computed stats from chart data
    const totalSurgeries = chartData.reduce((sum, d) => sum + d.count, 0);
    const dailyAverage = chartData.length > 0 ? (totalSurgeries / chartData.length).toFixed(1) : 0;
    const busiestDay = chartData.length > 0
        ? chartData.reduce((max, d) => d.count > max.count ? d : max, chartData[0])
        : null;
    const maxCount = chartData.length > 0
        ? Math.max(...chartData.map(d => d.count))
        : 0;

    // Loading state
    if (loading) {
        return (
            <Layout>
                <Loading message="Fetching comprehensive analytics data..." />
            </Layout>
        );
    }

    // Error state
    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="text-red-600 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Analytics</h2>
                        <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
                        <button
                            onClick={fetchAnalyticsData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6 space-y-6">

                {/* ─── Page Header ─── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Analytics</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Surgery statistics and status breakdown</p>
                    </div>
                    <button
                        onClick={async () => {
                            await fetchAnalyticsData();
                            toast.info('Analytics refreshed');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
                        title="Refresh analytics data"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* ─── Stats Cards ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Surgeries */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Total (7 Days)</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSurgeries}</p>
                            </div>
                        </div>
                    </div>

                    {/* Daily Average */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Daily Average</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dailyAverage}</p>
                            </div>
                        </div>
                    </div>

                    {/* Busiest Day */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Busiest Day</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {busiestDay ? `${busiestDay.day}` : '—'}
                                </p>
                                {busiestDay && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">{busiestDay.count} surgeries</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Chart Section ─── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Surgeries Per Day</h2>
                        {/* Chart type toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
                            {[
                                { key: 'area', label: 'Area' },
                                { key: 'bar', label: 'Bar' },
                                { key: 'line', label: 'Line' },
                            ].map(type => (
                                <button
                                    key={type.key}
                                    onClick={() => setChartType(type.key)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${chartType === type.key
                                        ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'area' ? (
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="surgeryGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 13, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 13, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                        allowDecimals={false}
                                        domain={[0, Math.max(maxCount + 2, 5)]}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        fill="url(#surgeryGradient)"
                                        dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 7, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            ) : chartType === 'bar' ? (
                                <BarChart data={chartData} barCategoryGap="20%">
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 13, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 13, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                        allowDecimals={false}
                                        domain={[0, Math.max(maxCount + 2, 5)]}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        fill="url(#barGradient)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            ) : (
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 13, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 13, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                        allowDecimals={false}
                                        domain={[0, Math.max(maxCount + 2, 5)]}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 7, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}
                                    />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Daily breakdown table */}
                    {chartData.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Daily Breakdown</h3>
                            <div className="grid grid-cols-7 gap-2">
                                {chartData.map((entry, idx) => (
                                    <div
                                        key={idx}
                                        className={`text-center p-3 rounded-xl border transition-all ${entry.count === maxCount && maxCount > 0
                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                                            : 'bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-600'
                                            }`}
                                    >
                                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">{entry.day}</p>
                                        <p className={`text-xl font-bold mt-1 ${entry.count === maxCount && maxCount > 0
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-800 dark:text-slate-200'
                                            }`}>
                                            {entry.count}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Patient Demographics Section ─── M3 (Janani) Day 18 */}
                {demographicsData && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👥 Patient Demographics</h2>

                        {/* Top-level summary cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 rounded-xl p-4 text-center">
                                <p className="text-sm font-semibold text-gray-600 dark:text-slate-400">Total Patients</p>
                                <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mt-1">{demographicsData.total}</p>
                            </div>
                            {demographicsData.gender.map((g) => (
                                <div
                                    key={g.gender}
                                    className={`border rounded-xl p-4 text-center ${g.gender === 'male'
                                        ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700'
                                        : g.gender === 'female'
                                            ? 'bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700'
                                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                                        }`}
                                >
                                    <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 capitalize">{g.gender}</p>
                                    <p className={`text-3xl font-bold mt-1 ${g.gender === 'male'
                                        ? 'text-sky-600 dark:text-sky-400'
                                        : g.gender === 'female'
                                            ? 'text-pink-600 dark:text-pink-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}>{g.count}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{g.percentage}%</p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-6">
                            <PatientDemographicsBarChart demographicsData={demographicsData} />
                        </div>

                        {/* Age group and blood type breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Age Groups */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Age Distribution</h3>
                                <div className="space-y-2">
                                    {demographicsData.ageGroups.map((ag) => (
                                        <div key={ag.ageGroup} className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-600 dark:text-slate-400 w-16">{ag.ageGroup}</span>
                                            <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-5 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.max(ag.percentage, 2)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 w-14 text-right">{ag.count} ({ag.percentage}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Blood Types */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Blood Type Distribution</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {demographicsData.bloodType.map((bt) => (
                                        <div
                                            key={bt.bloodType}
                                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center"
                                        >
                                            <p className="text-lg font-bold text-red-600 dark:text-red-400">{bt.bloodType}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{bt.count} patients ({bt.percentage}%)</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Surgery Status Breakdown Section ─── M2 (Chandeepa) Day 18 */}
                {statusData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Status Cards */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Surgery Status Breakdown</h2>
                                
                                {/* Date Range Filter */}
                                <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-slate-700/50 p-1.5 rounded-lg border border-gray-200 dark:border-slate-600">
                                    <input
                                        type="date"
                                        value={statusStartDate}
                                        onChange={(e) => setStatusStartDate(e.target.value)}
                                        className="bg-transparent border-none text-gray-700 dark:text-slate-300 outline-none text-xs w-[110px]"
                                    />
                                    <span className="text-gray-400">to</span>
                                    <input
                                        type="date"
                                        value={statusEndDate}
                                        onChange={(e) => setStatusEndDate(e.target.value)}
                                        className="bg-transparent border-none text-gray-700 dark:text-slate-300 outline-none text-xs w-[110px]"
                                    />
                                    {(statusStartDate || statusEndDate) && (
                                        <button 
                                            onClick={() => { setStatusStartDate(''); setStatusEndDate(''); }}
                                            className="text-gray-400 hover:text-red-500 p-0.5 rounded"
                                            title="Clear dates"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 flex-1">
                                {statusData.breakdown.map((item) => {
                                    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;
                                    return (
                                        <div
                                            key={item.status}
                                            className={`${config.bg} border ${config.border} rounded-xl p-4 transition-all hover:scale-[1.02]`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">{config.icon}</span>
                                                <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{config.label}</span>
                                            </div>
                                            <p className={`text-3xl font-bold ${config.text}`}>{item.count}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.percentage}% of total</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600 dark:text-slate-400">Total Surgeries</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">{statusData.total}</span>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Status Distribution</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData.breakdown.filter(d => d.count > 0)}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            innerRadius={50}
                                            paddingAngle={3}
                                            label={({ status, percentage }) =>
                                                `${(STATUS_CONFIG[status]?.label || status)} ${percentage}%`
                                            }
                                        >
                                            {statusData.breakdown.filter(d => d.count > 0).map((entry) => (
                                                <Cell
                                                    key={entry.status}
                                                    fill={STATUS_CONFIG[entry.status]?.color || '#94a3b8'}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [
                                                `${value} surgeries`,
                                                STATUS_CONFIG[name]?.label || name
                                            ]}
                                            contentStyle={{
                                                backgroundColor: 'var(--tooltip-bg, #fff)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.75rem',
                                                padding: '8px 12px'
                                            }}
                                        />
                                        <Legend
                                            formatter={(value) => STATUS_CONFIG[value]?.label || value}
                                            wrapperStyle={{ fontSize: '13px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
                {/* ─── Staff Distribution Section ─── M4 (Oneli) Day 18 */}
                {staffData && (
                    <div className="grid grid-cols-1 gap-6">
                        <StaffDistribution
                            data={staffData.breakdown}
                            total={staffData.total}
                        />
                    </div>
                )}

                {/* ─── Theatre Utilization Section ─── M5 (Inthusha) Day 18 */}
                {utilizationData && (
                    <div className="grid grid-cols-1 gap-6">
                        <TheatreUtilizationStats data={utilizationData} />
                    </div>
                )}

                {/* ─── Surgery Duration Histogram ─── M4 (Oneli) Day 19 */}
                {durationData && (
                    <div className="grid grid-cols-1 gap-6">
                        <DurationHistogram
                            buckets={durationData.buckets}
                            stats={durationData.stats}
                        />
                    </div>
                )}

                {/* ─── Peak Hours Analysis ─── M5 (Inthusha) Day 19 */}
                {peakHoursData && (
                    <div className="grid grid-cols-1 gap-6">
                        <PeakHoursChart 
                            data={peakHoursData.chartData} 
                            peak={peakHoursData.peak} 
                        />
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default AnalyticsPage;
