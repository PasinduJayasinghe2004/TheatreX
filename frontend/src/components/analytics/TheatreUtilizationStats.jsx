// ============================================================================
// Theatre Utilization Stats Component
// ============================================================================
// Created by: M5 (Inthusha) - Day 18
//
// Visualizes theatre utilization using Recharts and status bars.
// ============================================================================

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

// Color mapping based on utilization levels
const getLevelColor = (percent) => {
  if (percent >= 80) return '#ef4444'; // High (Red)
  if (percent >= 50) return '#f59e0b'; // Medium (Amber)
  return '#10b981'; // Optimal/Low (Emerald)
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{item.name}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{item.theatre_type}</p>
        <div className="space-y-1">
          <p className="text-sm font-bold" style={{ color: getLevelColor(item.utilization_percentage) }}>
            {item.utilization_percentage}% Utilized
          </p>
          <p className="text-xs text-gray-600 dark:text-slate-400">
            Total: {Math.floor(item.total_minutes / 60)}h {item.total_minutes % 60}m
          </p>
        </div>
      </div>
    );
  }
  return null;
};
const TheatreUtilizationStats = ({ data = [] }) => {
  const sortedData = [...data].sort((a, b) => b.utilization_percentage - a.utilization_percentage);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">🏥 Theatre Utilization</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Last 7 days (Based on completed surgeries)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Column */}
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                width={80}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="utilization_percentage"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getLevelColor(entry.utilization_percentage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* List Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Efficiency Ranking</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {sortedData.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600 transition-all hover:border-gray-300 dark:hover:border-slate-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-100">{item.name}</span>
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 px-1.5 py-0.5 bg-gray-200 dark:bg-slate-600 rounded">
                      {item.theatre_type}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: getLevelColor(item.utilization_percentage) }}>
                    {item.utilization_percentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.max(item.utilization_percentage, 1)}%`,
                      backgroundColor: getLevelColor(item.utilization_percentage)
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1.5 flex justify-between">
                  <span>Surgery Time: {Math.floor(item.total_minutes / 60)}h {item.total_minutes % 60}m</span>
                  <span className="capitalize">{item.utilization_percentage > 80 ? '⚠️ High Demand' : item.utilization_percentage > 50 ? 'Medium' : 'Optimal'}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheatreUtilizationStats;
