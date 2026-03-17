import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from 'recharts';

const VIEW_OPTIONS = {
    ageGroups: {
        label: 'Age Groups',
        subtitle: 'Age bands across active patients',
        palette: ['#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
    },
    gender: {
        label: 'Gender',
        subtitle: 'Gender mix across active patients',
        palette: ['#0284c7', '#ec4899', '#64748b'],
    },
    bloodType: {
        label: 'Blood Type',
        subtitle: 'Blood group spread for active patients',
        palette: ['#dc2626', '#ea580c', '#d97706', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#475569', '#94a3b8'],
    },
};

const formatLabel = (value) => {
    if (!value) {
        return 'Unknown';
    }

    return value
        .toString()
        .split(/[_\s-]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
        .replace('Rh', 'RH');
};

const buildChartData = (demographicsData, activeView) => {
    if (!demographicsData) {
        return [];
    }

    const { palette } = VIEW_OPTIONS[activeView];

    if (activeView === 'gender') {
        return (demographicsData.gender || []).map((entry, index) => ({
            id: entry.gender,
            label: formatLabel(entry.gender),
            count: entry.count,
            percentage: entry.percentage,
            fill: palette[index % palette.length],
        }));
    }

    if (activeView === 'bloodType') {
        return (demographicsData.bloodType || []).map((entry, index) => ({
            id: entry.bloodType,
            label: entry.bloodType || 'Unknown',
            count: entry.count,
            percentage: entry.percentage,
            fill: palette[index % palette.length],
        }));
    }

    return (demographicsData.ageGroups || []).map((entry, index) => ({
        id: entry.ageGroup,
        label: entry.ageGroup,
        count: entry.count,
        percentage: entry.percentage,
        fill: palette[index % palette.length],
    }));
};

const DemographicsTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const point = payload[0]?.payload;

    return (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-slate-600 dark:bg-slate-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                {point?.count} {point?.count === 1 ? 'patient' : 'patients'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{point?.percentage}% of total patients</p>
        </div>
    );
};

DemographicsTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(PropTypes.object),
    label: PropTypes.string,
};

const PatientDemographicsBarChart = ({ demographicsData }) => {
    const [activeView, setActiveView] = useState('ageGroups');

    const viewConfig = VIEW_OPTIONS[activeView];
    const chartData = buildChartData(demographicsData, activeView);
    const largestSegment = chartData.reduce(
        (currentLargest, segment) => {
            if (!currentLargest || segment.count > currentLargest.count) {
                return segment;
            }

            return currentLargest;
        },
        null
    );
    const hasData = chartData.some((segment) => segment.count > 0);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] gap-6">
            <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Demographics Bar Chart</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{viewConfig.subtitle}</p>
                    </div>

                    <div className="inline-flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                        {Object.entries(VIEW_OPTIONS).map(([key, option]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveView(key)}
                                aria-pressed={activeView === key}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${activeView === key
                                    ? 'bg-slate-900 text-white dark:bg-blue-500'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-5 h-80" data-testid="patient-demographics-bar-chart">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                                barCategoryGap="24%"
                            >
                                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    type="number"
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="label"
                                    width={88}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#4b5563' }}
                                />
                                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }} content={<DemographicsTooltip />} />
                                <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={24}>
                                    {chartData.map((entry) => (
                                        <Cell key={entry.id} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/70 dark:border-slate-700 dark:bg-slate-800/40">
                            <p className="text-sm text-gray-500 dark:text-slate-400">No demographic data available for this view.</p>
                        </div>
                    )}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Segments</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{chartData.length}</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Largest Segment</p>
                        <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                            {largestSegment ? largestSegment.label : 'No data'}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Largest Share</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                            {largestSegment ? `${largestSegment.percentage}%` : '0%'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Segment Highlights</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Live list for the selected demographic view</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {viewConfig.label}
                    </span>
                </div>

                <div className="mt-5 space-y-3">
                    {chartData.map((segment, index) => (
                        <div
                            key={segment.id}
                            className="rounded-xl border border-gray-200 p-3 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: segment.fill }}
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{segment.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">Rank #{index + 1}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{segment.count}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">{segment.percentage}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

PatientDemographicsBarChart.propTypes = {
    demographicsData: PropTypes.shape({
        gender: PropTypes.arrayOf(PropTypes.shape({
            gender: PropTypes.string,
            count: PropTypes.number,
            percentage: PropTypes.number,
        })),
        bloodType: PropTypes.arrayOf(PropTypes.shape({
            bloodType: PropTypes.string,
            count: PropTypes.number,
            percentage: PropTypes.number,
        })),
        ageGroups: PropTypes.arrayOf(PropTypes.shape({
            ageGroup: PropTypes.string,
            count: PropTypes.number,
            percentage: PropTypes.number,
        })),
    }).isRequired,
};

export default PatientDemographicsBarChart;