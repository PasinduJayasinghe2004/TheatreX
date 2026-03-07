// ============================================================================
// Average Duration Modal Content
// ============================================================================
// Modal content for the "Avg Duration" summary card popup.
// Shows stats grid and procedure duration comparison with colored bars.
// ============================================================================

const DURATION_STATS = [
    { label: 'Average Duration', value: '125 mins' },
    { label: 'Shortest Today', value: '45 mins' },
    { label: 'Longest Today', value: '240 mins' },
    { label: 'On-time Rate', value: '85%' },
];

const PROCEDURE_DURATIONS = [
    { name: 'Cardiac Bypass', duration: 240, max: 240, color: 'from-red-400 to-red-500' },
    { name: 'Hip Replacement', duration: 180, max: 240, color: 'from-orange-400 to-orange-500' },
    { name: 'Appendectomy', duration: 90, max: 240, color: 'from-blue-400 to-blue-500' },
    { name: 'Cataract Surgery', duration: 60, max: 240, color: 'from-green-400 to-green-500' },
];

const AverageDurationModal = () => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {DURATION_STATS.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Procedure Duration Comparison */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-5">Procedure Duration Comparison</h3>
                <div className="space-y-5">
                    {PROCEDURE_DURATIONS.map((proc, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <span className="text-sm text-gray-700 w-40 flex-shrink-0">{proc.name}</span>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${proc.color} rounded-full transition-all duration-700`}
                                    style={{ width: `${(proc.duration / proc.max) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-20 text-right flex-shrink-0">
                                {proc.duration} mins
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AverageDurationModal;
