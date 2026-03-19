// ============================================================================
// Duration Histogram Component
// ============================================================================
// Created by: M4 (Oneli) - Day 19
//
// Displays a bar chart (histogram) of surgery durations grouped into buckets,
// plus summary stat cards for average, min, and max duration.
// Uses Recharts BarChart.
// ============================================================================

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Gradient colors for each bar
const BAR_COLORS = [
    '#6366f1', // indigo
    '#3b82f6', // blue
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
];

// Custom tooltip
const DurationTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 shadow-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{label} min</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                    {payload[0].value} {payload[0].value === 1 ? 'surgery' : 'surgeries'}
                </p>
            </div>
        );
    }
    return null;
};

/**
 * DurationHistogram
 * @param {{ buckets: Array<{range:string, count:number}>, stats: {avgDuration:number, minDuration:number, maxDuration:number, totalSurgeries:number} }} props
 */
const DurationHistogram = ({ buckets, stats }) => {
    if (!buckets || buckets.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex items-center justify-center h-80">
                <p className="text-gray-500 dark:text-slate-400">No duration data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>⏱️ Surgery Duration Distribution</span>
                {stats && (
                    <span className="text-sm font-normal text-gray-500 dark:text-slate-400">
                        ({stats.totalSurgeries} surgeries)
                    </span>
                )}
            </h2>

            {/* Stat cards */}
            {stats && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 text-center">
                        <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Avg Duration</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.avgDuration}<span className="text-sm font-medium ml-1">min</span></p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 text-center">
                        <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Min Duration</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.minDuration}<span className="text-sm font-medium ml-1">min</span></p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 rounded-xl p-4 text-center">
                        <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">Max Duration</p>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.maxDuration}<span className="text-sm font-medium ml-1">min</span></p>
                    </div>
                </div>
            )}

            {/* Histogram bar chart */}
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets} barCategoryGap="18%">
                        <defs>
                            <linearGradient id="durationBarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="range"
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Duration (min)', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#9ca3af' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            allowDecimals={false}
                            label={{ value: 'Surgeries', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#9ca3af' }}
                        />
                        <Tooltip content={<DurationTooltip />} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {buckets.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Bucket detail list */}
            <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
                {buckets.map((item, index) => (
                    <div
                        key={item.range}
                        className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600"
                    >
                        <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }} />
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{item.range} min</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DurationHistogram;
