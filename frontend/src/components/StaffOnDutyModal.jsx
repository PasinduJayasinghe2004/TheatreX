// ============================================================================
// Staff on Duty Modal Content
// ============================================================================
// Modal content for the "Staff on Duty" summary card popup.
// Shows staff statistics, and staff list with avatars and status.
// ============================================================================

const SAMPLE_STAFF_STATS = {
    total: 24,
    available: 8,
    inTheatre: 12,
};

const SAMPLE_STAFF_LIST = [
    {
        name: 'Dr. Smith',
        role: 'Surgeon – Cardiac',
        status: 'busy',
        statusLabel: 'In Theatre',
        currentCase: 'Cardiac Bypass',
        avatar: '/avatar_doctor.png',
    },
    {
        name: 'Nurse Anderson',
        role: 'Theatre Nurse – Scrub Nurse',
        status: 'available-soon',
        statusLabel: 'Preparing',
        currentCase: 'Hip Replacement',
        avatar: '/avatar_nurse1.png',
    },
    {
        name: 'Nurse Martinez',
        role: 'Theatre Nurse – Circulating',
        status: 'available',
        statusLabel: 'Available',
        currentCase: 'None',
        avatar: '/avatar_nurse2.png',
    },
];

const STAFF_BADGE_STYLES = {
    busy: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Busy' },
    'available-soon': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', label: 'Available Soon' },
    available: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', label: 'Available' },
};

const StaffOnDutyModal = () => {
    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 px-5 py-4">
                    <p className="text-sm font-semibold text-blue-600">Total Staff</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">{SAMPLE_STAFF_STATS.total}</p>
                </div>
                <div className="rounded-xl border-2 border-green-200 bg-green-50 px-5 py-4">
                    <p className="text-sm font-semibold text-green-600">Available</p>
                    <p className="text-3xl font-bold text-green-700 mt-1">{SAMPLE_STAFF_STATS.available}</p>
                </div>
                <div className="rounded-xl border-2 border-red-200 bg-red-50 px-5 py-4">
                    <p className="text-sm font-semibold text-red-600">In Theatre</p>
                    <p className="text-3xl font-bold text-red-700 mt-1">{SAMPLE_STAFF_STATS.inTheatre}</p>
                </div>
            </div>

            {/* Staff Cards */}
            <div className="space-y-4">
                {SAMPLE_STAFF_LIST.map((staff, idx) => {
                    const badge = STAFF_BADGE_STYLES[staff.status] || STAFF_BADGE_STYLES.available;
                    return (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-all duration-300"
                        >
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                                <img
                                    src={staff.avatar}
                                    alt={staff.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">${staff.name.charAt(0)}</div>`;
                                    }}
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-base">{staff.name}</p>
                                <p className="text-sm text-gray-500">{staff.role}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Status:</span> {staff.statusLabel}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Current Case:</span> {staff.currentCase}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border} flex-shrink-0`}>
                                {badge.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StaffOnDutyModal;
