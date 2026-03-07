// ============================================================================
// Today's Surgeries Modal Content
// ============================================================================
// Modal content for the "Today's Surgeries" summary card popup.
// Shows stats, surgery schedule table, procedure types, theatre utilization.
// ============================================================================

const SAMPLE_SURGERY_STATS = {
    total: 4,
    completed: 1,
    inProgress: 2,
    cancelled: 0,
};

const SAMPLE_SCHEDULE = [
    { time: '08:30', patient: 'John Cena', procedure: 'Hip Replacement', theatre: 'Theatre 2', surgeon: 'Dr.Johnson', status: 'Scheduled' },
    { time: '10:30', patient: 'Sarah Connor', procedure: 'Cataract Surgery', theatre: 'Theatre 4', surgeon: 'Dr.Peter', status: 'Scheduled' },
    { time: '11:00', patient: 'Martin Smith', procedure: 'Cardiac Bypass', theatre: 'Theatre 1', surgeon: 'Dr.Sam', status: 'Scheduled' },
    { time: '14:00', patient: 'Kristina Rose', procedure: 'Appendectomy', theatre: 'Theatre 3', surgeon: 'Dr.Lee', status: 'Scheduled' },
];

const PROCEDURE_TYPES = [
    { name: 'Hip Replacement', count: 2 },
    { name: 'Cataract Surgery', count: 1 },
    { name: 'Cardiac Bypass', count: 1 },
];

const THEATRE_UTILIZATION = [
    { name: 'Theatre 1', surgeries: 2, max: 4 },
    { name: 'Theatre 2', surgeries: 0, max: 4 },
    { name: 'Theatre 3', surgeries: 1, max: 4 },
];

const StatCard = ({ label, value, color }) => (
    <div className={`rounded-xl border-2 ${color} px-5 py-4 text-center`}>
        <p className="text-sm font-semibold" style={{ color: 'inherit' }}>{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
);

const TodaySurgeriesModal = () => {
    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total" value={SAMPLE_SURGERY_STATS.total}
                    color="border-blue-200 bg-blue-50 text-blue-700" />
                <StatCard label="Completed" value={SAMPLE_SURGERY_STATS.completed}
                    color="border-green-200 bg-green-50 text-green-700" />
                <StatCard label="In Progress" value={SAMPLE_SURGERY_STATS.inProgress}
                    color="border-orange-200 bg-orange-50 text-orange-600" />
                <StatCard label="Cancelled" value={SAMPLE_SURGERY_STATS.cancelled}
                    color="border-red-200 bg-red-50 text-red-600" />
            </div>

            {/* Today's Surgery Schedule */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Today's Surgery Schedule</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-blue-700 uppercase">Time</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-blue-700 uppercase">Patient</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-blue-700 uppercase">Procedure</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-blue-700 uppercase">Theatre</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-blue-700 uppercase">Surgeon</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-blue-700 uppercase">Status</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-blue-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {SAMPLE_SCHEDULE.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.time}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{row.patient}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{row.procedure}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{row.theatre}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{row.surgeon}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <button className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors" title="View">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button className="p-1.5 hover:bg-green-100 rounded-lg transition-colors" title="Edit">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom section: Procedure Types + Theatre Utilization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Procedure Types */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-4">Procedure Types</h3>
                    <div className="space-y-3">
                        {PROCEDURE_TYPES.map((proc, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{proc.name}</span>
                                <span className="text-sm font-bold text-gray-900">{proc.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Theatre Utilization */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-4">Theatre Utilization</h3>
                    <div className="space-y-4">
                        {THEATRE_UTILIZATION.map((theatre, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-gray-700">{theatre.name}</span>
                                    <span className="text-gray-500 font-medium">
                                        {theatre.surgeries} {theatre.surgeries === 1 ? 'surgery' : 'surgeries'}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                                        style={{ width: `${(theatre.surgeries / theatre.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodaySurgeriesModal;
