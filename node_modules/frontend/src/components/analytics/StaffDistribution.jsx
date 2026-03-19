import {
    PieChart, Pie, Cell, ResponsiveContainer,
    Tooltip, Legend
} from 'recharts';

/**
 * StaffDistribution Component
 * Displays a pie chart of staff members grouped by role.
 * Created by: M4 (Oneli) - Day 18
 */
const StaffDistribution = ({ data, total }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex items-center justify-center h-80">
                <p className="text-gray-500 dark:text-slate-400">No staff data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>👥 Staff Distribution</span>
                <span className="text-sm font-normal text-gray-500 dark:text-slate-400">({total} total)</span>
            </h2>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="role"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={5}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [`${value} staff members`, name]}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                padding: '10px'
                            }}
                        />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Role detail list */}
            <div className="mt-4 grid grid-cols-2 gap-2">
                {data.map((item) => (
                    <div
                        key={item.role}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-gray-600 dark:text-slate-300">{item.role}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StaffDistribution;
