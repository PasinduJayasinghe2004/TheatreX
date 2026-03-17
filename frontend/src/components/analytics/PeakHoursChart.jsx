// ============================================================================
// Peak Hours Chart Component
// ============================================================================
// Created by: M5 (Inthusha) - Day 19
//
// Visualizes surgery distribution by hour of the day using an AreaChart.
// Includes a peak hour summary card.
// ============================================================================

import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

/**
 * Custom Tooltip for the Peak Hours Chart
 */
const CustomPeakTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 shadow-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{payload[0].payload.displayHour}</p>
                <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                        <span className="font-bold text-gray-900 dark:text-white">{payload[0].value}</span> surgeries
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const PeakHoursChart = ({ data, peak }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">🕒 Peak Hours Analysis</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Distribution of surgeries by hour of day</p>
                </div>

                {/* Peak Summary Badge */}
                {peak && (
                    <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 rounded-xl px-4 py-2">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-orange-600/70 dark:text-orange-400/70 tracking-wider">Peak Hour</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{peak.displayHour} <span className="text-gray-500 dark:text-slate-400 font-normal">({peak.count} surgeries)</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="h-72 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            interval={2}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                        />
                        <Tooltip content={<CustomPeakTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#f97316"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#peakGradient)"
                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#f97316' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Time labels footer */}
            <div className="flex justify-between mt-4 px-2">
                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase">Midnight</span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase">Noon</span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase">Midnight</span>
            </div>
        </div>
    );
};

export default PeakHoursChart;
