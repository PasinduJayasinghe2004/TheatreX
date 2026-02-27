export const STATUS_STYLES = {
    scheduled: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Scheduled'
    },
    in_progress: {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: 'In Progress'
    },
    completed: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Completed'
    },
    cancelled: {
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        label: 'Cancelled'
    }
};

export const VALID_STATUS_TRANSITIONS = {
    scheduled: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: ['scheduled']
};

export const STATUS_LABELS = Object.fromEntries(
    Object.entries(STATUS_STYLES).map(([key, val]) => [key, val.label])
);

export const ALL_STATUSES = Object.keys(STATUS_STYLES);
