import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getDashboardSummary } from '../services/dashboardService';
import surgeryService from '../services/surgeryService';
import theatreService from '../services/theatreService';

const BRAND = {
    primary: 'blue',
    surface: 'bg-white dark:bg-slate-900',
    border: 'border border-slate-200/70 dark:border-slate-700/80',
    shadow: 'shadow-sm',
};

const THEATRE_STATUS_STYLES = {
    in_use: { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'In Use' },
    available: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Available' },
    maintenance: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Maintenance' },
    cleaning: { badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500', label: 'Cleaning' },
};

const PANEL_KEYS = {
    kpi: 'kpi',
    timeline: 'timeline',
    alerts: 'alerts',
    table: 'table',
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const formatTime = (value) => {
    if (!value) return '--:--';
    try {
        const d = new Date(`2000-01-01T${value}`);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
        return value;
    }
};

const formatStamp = (date) => {
    if (!date) return 'No data yet';
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const EmptyPanel = ({ title, description }) => (
    <div className={`${BRAND.surface} ${BRAND.border} ${BRAND.shadow} rounded-2xl p-8 text-center`}>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </div>
);

const PanelSkeleton = ({ rows = 4 }) => (
    <div className={`${BRAND.surface} ${BRAND.border} ${BRAND.shadow} rounded-2xl p-5 animate-pulse`}>
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="space-y-3 mt-5">
            {Array.from({ length: rows }).map((_, idx) => (
                <div key={idx} className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
        </div>
    </div>
);

const TheatreStatusBadge = ({ status }) => {
    const style = THEATRE_STATUS_STYLES[status] || THEATRE_STATUS_STYLES.available;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {style.label}
        </span>
    );
};

const AnimatedCount = ({ value, trigger }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const prevValueRef = useRef(0);
    const target = Number(value);

    useEffect(() => {
        if (!Number.isFinite(target)) return;

        const from = prevValueRef.current;
        const to = target;
        const durationMs = 500;
        const start = performance.now();
        let rafId;

        const step = (ts) => {
            const progress = Math.min((ts - start) / durationMs, 1);
            const next = from + (to - from) * progress;
            setDisplayValue(next);

            if (progress < 1) {
                rafId = requestAnimationFrame(step);
            } else {
                prevValueRef.current = to;
            }
        };

        rafId = requestAnimationFrame(step);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [target, trigger]);

    if (!Number.isFinite(target)) return <span>{value}</span>;

    const rounded = Number.isInteger(target) ? Math.round(displayValue) : Number(displayValue.toFixed(1));
    return <span>{rounded}</span>;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const today = useMemo(() => getTodayDateString(), []);

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [theatreFilter, setTheatreFilter] = useState('all');
    const [density, setDensity] = useState('comfortable');
    const [searchQuery, setSearchQuery] = useState('');
    const [timelineMode, setTimelineMode] = useState('active');
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [isKpiModalVisible, setIsKpiModalVisible] = useState(false);
    const [pinnedTheatreIds, setPinnedTheatreIds] = useState([]);
    const [collapsedGroups, setCollapsedGroups] = useState({
        pinned: false,
        in_use: false,
        available: true,
        maintenance: true,
        other: true,
    });
    const [expandedGroups, setExpandedGroups] = useState({
        pinned: true,
        in_use: false,
        available: false,
        maintenance: false,
        other: false,
    });
    const [kpiAnimationTick, setKpiAnimationTick] = useState(0);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [surgeries, setSurgeries] = useState([]);
    const [theatres, setTheatres] = useState([]);

    const [widgetUpdatedAt, setWidgetUpdatedAt] = useState({
        [PANEL_KEYS.kpi]: null,
        [PANEL_KEYS.timeline]: null,
        [PANEL_KEYS.alerts]: null,
        [PANEL_KEYS.table]: null,
    });

    const refreshTimerRef = useRef(null);
    const kpiModalCloseTimerRef = useRef(null);

    const setPanelTimestamp = useCallback((key) => {
        setWidgetUpdatedAt((prev) => ({
            ...prev,
            [key]: new Date(),
        }));
    }, []);

    const fetchDashboardData = useCallback(async (isManual = false) => {
        if (isManual) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setErrorMessage(null);

        const surgeryParams = {
            startDate,
            endDate,
        };

        try {
            const [kpiResult, surgeriesResult, theatreResult] = await Promise.allSettled([
                Promise.all([getDashboardStats(), getDashboardSummary()]),
                surgeryService.getAllSurgeries(surgeryParams),
                theatreService.getCoordinatorOverview(),
            ]);

            if (kpiResult.status === 'fulfilled') {
                const [statsResponse, summaryResponse] = kpiResult.value;
                if (statsResponse?.success) {
                    setStats(statsResponse.data);
                }
                if (summaryResponse?.success) {
                    setSummary(summaryResponse.data);
                }
                setPanelTimestamp(PANEL_KEYS.kpi);
                setKpiAnimationTick((prev) => prev + 1);
            }

            if (surgeriesResult.status === 'fulfilled') {
                const response = surgeriesResult.value;
                if (response?.success) {
                    setSurgeries(Array.isArray(response.data) ? response.data : []);
                    setPanelTimestamp(PANEL_KEYS.table);
                } else {
                    throw new Error(response?.message || 'Failed to load surgeries');
                }
            }

            if (theatreResult.status === 'fulfilled') {
                const raw = theatreResult.value;
                const directPayload = raw?.summary && Array.isArray(raw?.data);
                const wrappedPayload = raw?.data?.summary && Array.isArray(raw?.data?.data);
                const theatreData = directPayload ? raw.data : wrappedPayload ? raw.data.data : [];
                setTheatres(Array.isArray(theatreData) ? theatreData : []);
                setPanelTimestamp(PANEL_KEYS.timeline);
            }

            if (
                kpiResult.status !== 'fulfilled' &&
                surgeriesResult.status !== 'fulfilled' &&
                theatreResult.status !== 'fulfilled'
            ) {
                throw new Error('Unable to fetch dashboard widgets.');
            }
        } catch (error) {
            const message = error?.message || 'Failed to refresh dashboard data.';
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setPanelTimestamp(PANEL_KEYS.alerts);
            setRefreshing(false);
            setLoading(false);
        }
    }, [endDate, setPanelTimestamp, startDate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        refreshTimerRef.current = setInterval(() => {
            fetchDashboardData(true);
        }, 60000);

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [fetchDashboardData]);

    useEffect(() => {
        if (!selectedKpi) {
            setIsKpiModalVisible(false);
            return;
        }

        const frameId = requestAnimationFrame(() => {
            setIsKpiModalVisible(true);
        });

        return () => cancelAnimationFrame(frameId);
    }, [selectedKpi]);

    useEffect(() => {
        return () => {
            if (kpiModalCloseTimerRef.current) {
                clearTimeout(kpiModalCloseTimerRef.current);
            }
        };
    }, []);

    const surgeryRows = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const all = surgeries.filter((s) => {
            if (theatreFilter === 'all') return true;
            return String(s.theatre_id || '') === theatreFilter;
        });

        if (!q) return all;

        return all.filter((s) => {
            const patient = (s.patient_name || '').toLowerCase();
            const type = (s.surgery_type || '').toLowerCase();
            const surgeon = (s.surgeon?.name || s.surgeon_name || '').toLowerCase();
            return patient.includes(q) || type.includes(q) || surgeon.includes(q);
        });
    }, [searchQuery, surgeries, theatreFilter]);

    const liveTheatres = useMemo(() => {
        const rows = theatres.filter((t) => theatreFilter === 'all' || String(t.id) === theatreFilter);
        const statusFiltered = timelineMode === 'active'
            ? rows.filter((t) => t.status === 'in_use' || t.current_surgery)
            : rows;

        const sorted = [...statusFiltered].sort((a, b) => {
            const aPriority = a.status === 'in_use' ? 0 : 1;
            const bPriority = b.status === 'in_use' ? 0 : 1;
            return aPriority - bPriority;
        });

        return sorted;
    }, [theatreFilter, theatres, timelineMode]);

    const groupedTimeline = useMemo(() => {
        const groups = {
            in_use: [],
            available: [],
            maintenance: [],
            other: [],
        };

        liveTheatres.forEach((theatre) => {
            if (theatre.status === 'in_use') {
                groups.in_use.push(theatre);
            } else if (theatre.status === 'available') {
                groups.available.push(theatre);
            } else if (theatre.status === 'maintenance') {
                groups.maintenance.push(theatre);
            } else {
                groups.other.push(theatre);
            }
        });

        const pinned = [];
        Object.keys(groups).forEach((key) => {
            groups[key] = groups[key].filter((theatre) => {
                if (pinnedTheatreIds.includes(theatre.id)) {
                    pinned.push(theatre);
                    return false;
                }
                return true;
            });
        });

        return {
            pinned,
            ...groups,
        };
    }, [liveTheatres, pinnedTheatreIds]);

    const staffOnDuty = summary?.today_stats?.staff_on_duty?.total ?? null;
    const emergencyCount = surgeries.filter((s) => s.priority === 'emergency').length;
    const inProgressCount = surgeries.filter((s) => s.status === 'in_progress').length;
    const scheduledCount = surgeries.filter((s) => s.status === 'scheduled').length;

    const alerts = useMemo(() => {
        const list = [];

        if (errorMessage) {
            list.push({ id: 'fetch-error', type: 'error', message: errorMessage });
        }

        if (emergencyCount > 0) {
            list.push({
                id: 'emergency',
                type: 'warning',
                message: `${emergencyCount} emergency ${emergencyCount === 1 ? 'case is' : 'cases are'} in the selected range.`,
            });
        }

        if (inProgressCount > 0 && scheduledCount > 15) {
            list.push({
                id: 'capacity',
                type: 'info',
                message: `High throughput detected: ${inProgressCount} in progress and ${scheduledCount} scheduled.`,
            });
        }

        return list;
    }, [emergencyCount, errorMessage, inProgressCount, scheduledCount]);

    const theatreFilterOptions = useMemo(() => {
        return theatres.map((t) => ({
            value: String(t.id),
            label: t.name || `Theatre ${t.id}`,
        }));
    }, [theatres]);

    const kpiCards = [
        {
            key: 'total',
            label: 'Total Surgeries',
            value: surgeries.length,
            subtitle: `Range: ${startDate} to ${endDate}`,
            colour: 'bg-blue-50',
            icon: (
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            key: 'inProgress',
            label: 'In Progress',
            value: inProgressCount,
            subtitle: 'Live ongoing procedures',
            colour: 'bg-blue-50',
            icon: (
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            key: 'emergency',
            label: 'Emergencies',
            value: emergencyCount,
            subtitle: 'Requires fast coordination',
            colour: 'bg-red-50',
            icon: (
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        {
            key: 'avgDuration',
            label: 'Avg Duration',
            value: stats?.avgDuration ?? stats?.avg_duration ?? '--',
            subtitle: 'Minutes per surgery',
            colour: 'bg-blue-50',
            icon: (
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            ),
        },
    ];

    const tableRowPadding = density === 'compact' ? 'py-2.5' : 'py-4';
    const showInitialSkeleton = loading && surgeries.length === 0 && theatres.length === 0 && !summary;
    const activeKpi = kpiCards.find((card) => card.key === selectedKpi) || null;

    const kpiModalRows = useMemo(() => {
        if (!selectedKpi) return [];

        if (selectedKpi === 'total') {
            return [...surgeries].sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));
        }

        if (selectedKpi === 'inProgress') {
            return surgeries.filter((s) => s.status === 'in_progress');
        }

        if (selectedKpi === 'emergency') {
            return surgeries.filter((s) => s.priority === 'emergency');
        }

        if (selectedKpi === 'avgDuration') {
            return [...surgeries]
                .filter((s) => Number.isFinite(Number(s.duration_minutes)))
                .sort((a, b) => Number(b.duration_minutes || 0) - Number(a.duration_minutes || 0));
        }

        return [];
    }, [selectedKpi, surgeries]);

    const togglePinTheatre = (theatreId) => {
        setPinnedTheatreIds((prev) => {
            if (prev.includes(theatreId)) {
                return prev.filter((id) => id !== theatreId);
            }
            return [...prev, theatreId];
        });
    };

    const toggleGroupCollapsed = (groupKey) => {
        setCollapsedGroups((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }));
    };

    const toggleGroupExpanded = (groupKey) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }));
    };

    const closeKpiModal = () => {
        setIsKpiModalVisible(false);

        if (kpiModalCloseTimerRef.current) {
            clearTimeout(kpiModalCloseTimerRef.current);
        }

        kpiModalCloseTimerRef.current = setTimeout(() => {
            setSelectedKpi(null);
        }, 180);
    };

    const openKpiModal = (kpiKey) => {
        if (selectedKpi === kpiKey) {
            closeKpiModal();
            return;
        }

        if (kpiModalCloseTimerRef.current) {
            clearTimeout(kpiModalCloseTimerRef.current);
        }

        setSelectedKpi(kpiKey);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="sticky top-0 z-20 backdrop-blur bg-slate-50/95 dark:bg-slate-950/95 border-b border-slate-200/70 dark:border-slate-800/80 px-3 sm:px-6 py-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">Theatre Mission Control</h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {user?.name ? `${user.name.split(' ')[0]}, manage live operations with trusted data.` : 'Manage live operations with trusted data.'}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 px-3 rounded-lg text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                                aria-label="Start date"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-9 px-3 rounded-lg text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                                aria-label="End date"
                            />
                            <select
                                value={theatreFilter}
                                onChange={(e) => setTheatreFilter(e.target.value)}
                                className="h-9 px-3 rounded-lg text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                                aria-label="Filter theatre"
                            >
                                <option value="all">All theatres</option>
                                {theatreFilterOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => fetchDashboardData(true)}
                                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button
                                onClick={() => navigate('/surgeries/new')}
                                className="h-9 px-4 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                New Surgery
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-3 sm:p-6 space-y-6">
                    <section data-testid="dashboard-title">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Core KPIs</h2>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Updated {formatStamp(widgetUpdatedAt[PANEL_KEYS.kpi])}</span>
                        </div>
                        {showInitialSkeleton ? (
                            <PanelSkeleton rows={4} />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                {kpiCards.map((card) => (
                                    <button
                                        key={card.label}
                                        type="button"
                                        onClick={() => openKpiModal(card.key)}
                                        className="text-left transition-transform duration-200 hover:-translate-y-0.5"
                                        aria-label={`Open ${card.label} details`}
                                    >
                                        <SummaryCard
                                            label={card.label}
                                            value={<AnimatedCount value={card.value} trigger={kpiAnimationTick} />}
                                            subtitle={card.subtitle}
                                            colour={card.colour}
                                            icon={card.icon}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="xl:col-span-2">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Live Theatre Timeline</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Updated {formatStamp(widgetUpdatedAt[PANEL_KEYS.timeline])}</span>
                                    <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setTimelineMode('active')}
                                            className={`px-2.5 py-1 text-[11px] font-semibold ${timelineMode === 'active' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'}`}
                                        >
                                            Active
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTimelineMode('all')}
                                            className={`px-2.5 py-1 text-[11px] font-semibold ${timelineMode === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'}`}
                                        >
                                            All
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading && theatres.length === 0 ? (
                                <PanelSkeleton rows={5} />
                            ) : liveTheatres.length === 0 ? (
                                <EmptyPanel
                                    title="No theatres for this view"
                                    description={timelineMode === 'active' ? 'No active theatres right now. Switch to All to see full list.' : 'The selected filter returned no theatre cards.'}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {[
                                        { key: 'pinned', label: 'Pinned', rows: groupedTimeline.pinned },
                                        { key: 'in_use', label: 'In Use', rows: groupedTimeline.in_use },
                                        { key: 'available', label: 'Available', rows: groupedTimeline.available },
                                        { key: 'maintenance', label: 'Maintenance', rows: groupedTimeline.maintenance },
                                        { key: 'other', label: 'Other', rows: groupedTimeline.other },
                                    ].filter((group) => group.rows.length > 0).map((group) => {
                                        const isCollapsed = collapsedGroups[group.key];
                                        const isExpanded = expandedGroups[group.key];
                                        const rows = isExpanded ? group.rows : group.rows.slice(0, 3);

                                        return (
                                            <div key={group.key} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGroupCollapsed(group.key)}
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
                                                    >
                                                        <span className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▼</span>
                                                        {group.label} ({group.rows.length})
                                                    </button>
                                                    {group.rows.length > 3 && !isCollapsed && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleGroupExpanded(group.key)}
                                                            className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
                                                            {isExpanded ? 'Show Less' : `View All (${group.rows.length})`}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className={`grid transition-all duration-300 ease-out ${isCollapsed ? 'grid-rows-[0fr] opacity-70' : 'grid-rows-[1fr] opacity-100'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="p-3 space-y-3 transition-transform duration-300 ease-out">
                                                            {rows.map((theatre) => {
                                                                const surgery = theatre.current_surgery;
                                                                const progress = Math.min(Number(surgery?.auto_progress ?? surgery?.manual_progress ?? 0), 100);
                                                                const pinned = pinnedTheatreIds.includes(theatre.id);

                                                                return (
                                                                    <div
                                                                        key={theatre.id}
                                                                        className={`${BRAND.surface} ${BRAND.border} ${BRAND.shadow} rounded-xl p-4 transition-all duration-200 hover:shadow-md`}
                                                                    >
                                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{theatre.name || `Theatre ${theatre.id}`}</p>
                                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                                    {theatre.location || 'Location not set'}
                                                                                    {theatre.theatre_type ? ` • ${theatre.theatre_type}` : ''}
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => togglePinTheatre(theatre.id)}
                                                                                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${pinned ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                                                >
                                                                                    {pinned ? 'Pinned' : 'Pin'}
                                                                                </button>
                                                                                <TheatreStatusBadge status={theatre.status} />
                                                                            </div>
                                                                        </div>

                                                                        {surgery ? (
                                                                            <div className="mt-3">
                                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{surgery.surgery_type || 'Surgery in progress'}</p>
                                                                                    <StatusBadge status={surgery.status || 'in_progress'} />
                                                                                </div>
                                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                                    Patient: {surgery.patient_name || 'N/A'} • Start: {formatTime(surgery.scheduled_time)}
                                                                                </p>
                                                                                <div className="mt-2">
                                                                                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                                        <span>Progress</span>
                                                                                        <span>{progress}%</span>
                                                                                    </div>
                                                                                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                                                        <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">No active surgery assigned.</p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Alerts & Staff</h2>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Updated {formatStamp(widgetUpdatedAt[PANEL_KEYS.alerts])}</span>
                            </div>

                            <div className={`${BRAND.surface} ${BRAND.border} ${BRAND.shadow} rounded-xl p-4 space-y-4`}>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Staff Availability</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-lg border border-slate-200/80 dark:border-slate-700 p-3">
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">On Duty</p>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{staffOnDuty ?? '--'}</p>
                                        </div>
                                        <div className="rounded-lg border border-slate-200/80 dark:border-slate-700 p-3">
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">In Progress</p>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{inProgressCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Operational Alerts</p>
                                    {alerts.length === 0 ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No active alerts for this range.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {alerts.map((alert) => (
                                                <div
                                                    key={alert.id}
                                                    className={`rounded-lg border px-3 py-2 text-xs ${alert.type === 'error'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : alert.type === 'warning'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}
                                                >
                                                    {alert.message}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Surgery Queue</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Updated {formatStamp(widgetUpdatedAt[PANEL_KEYS.table])}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <input
                                    type="text"
                                    placeholder="Search patient, procedure, surgeon"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 px-3 rounded-lg text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                                />
                                <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
                                    <button
                                        onClick={() => setDensity('compact')}
                                        className={`h-9 px-3 text-xs font-semibold ${density === 'compact'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        Compact
                                    </button>
                                    <button
                                        onClick={() => setDensity('comfortable')}
                                        className={`h-9 px-3 text-xs font-semibold ${density === 'comfortable'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        Comfortable
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`${BRAND.surface} ${BRAND.border} ${BRAND.shadow} rounded-xl overflow-hidden`}>
                            {loading && surgeries.length === 0 ? (
                                <PanelSkeleton rows={6} />
                            ) : surgeryRows.length === 0 ? (
                                <EmptyPanel
                                    title="No surgeries in this range"
                                    description="Try another date range or theatre filter."
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px]">
                                        <thead className="bg-slate-100 dark:bg-slate-800/80">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Time</th>
                                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Patient</th>
                                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Procedure</th>
                                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Theatre</th>
                                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Surgeon</th>
                                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Status</th>
                                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                                            {surgeryRows.map((surgery) => (
                                                <tr key={surgery.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className={`px-4 ${tableRowPadding} text-sm text-slate-700 dark:text-slate-200`}>
                                                        {formatTime(surgery.scheduled_time)}
                                                    </td>
                                                    <td className={`px-4 ${tableRowPadding} text-sm text-slate-700 dark:text-slate-200`}>
                                                        {surgery.patient_name || 'N/A'}
                                                    </td>
                                                    <td className={`px-4 ${tableRowPadding} text-sm text-slate-700 dark:text-slate-200`}>
                                                        {surgery.surgery_type || 'N/A'}
                                                    </td>
                                                    <td className={`px-4 ${tableRowPadding} text-sm text-slate-700 dark:text-slate-200`}>
                                                        {surgery.theatre_id ? `Theatre ${surgery.theatre_id}` : '--'}
                                                    </td>
                                                    <td className={`px-4 ${tableRowPadding} text-sm text-slate-700 dark:text-slate-200`}>
                                                        {surgery.surgeon?.name || surgery.surgeon_name || 'Unassigned'}
                                                    </td>
                                                    <td className={`px-4 ${tableRowPadding}`}>
                                                        <StatusBadge status={surgery.status || 'scheduled'} />
                                                    </td>
                                                    <td className={`px-4 ${tableRowPadding}`}>
                                                        <button
                                                            onClick={() => navigate(`/surgeries/${surgery.id}`)}
                                                            className="px-2.5 py-1.5 rounded-md text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {activeKpi && (
                    <div
                        className={`fixed inset-0 z-40 flex items-center justify-center p-4 transition-all duration-200 ${isKpiModalVisible ? 'bg-slate-950/45 backdrop-blur-[1px] opacity-100' : 'bg-slate-950/0 opacity-0'}`}
                        onClick={closeKpiModal}
                    >
                        <div
                            className={`w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl transition-all duration-200 ${isKpiModalVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.98]'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{activeKpi.label} Details</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {selectedKpi === 'total' && `Showing surgeries between ${startDate} and ${endDate}`}
                                        {selectedKpi === 'inProgress' && 'Showing only surgeries currently in progress'}
                                        {selectedKpi === 'emergency' && 'Showing emergency surgeries in selected range'}
                                        {selectedKpi === 'avgDuration' && 'Showing surgeries sorted by duration'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeKpiModal}
                                    className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="p-5">
                                {kpiModalRows.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No surgery records found for this KPI in the selected range.</p>
                                ) : (
                                    <div className="max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                        <table className="w-full">
                                            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Time</th>
                                                    <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Patient</th>
                                                    <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Procedure</th>
                                                    <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-300">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {kpiModalRows.slice(0, 50).map((surgery) => (
                                                    <tr
                                                        key={surgery.id}
                                                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                                        onClick={() => {
                                                            closeKpiModal();
                                                            navigate(`/surgeries/${surgery.id}`);
                                                        }}
                                                        title="Open surgery detail"
                                                    >
                                                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">{formatTime(surgery.scheduled_time)}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">{surgery.patient_name || 'N/A'}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                                                            {surgery.surgery_type || 'N/A'}
                                                            {selectedKpi === 'avgDuration' && Number.isFinite(Number(surgery.duration_minutes)) && (
                                                                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({surgery.duration_minutes} min)</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <StatusBadge status={surgery.status || 'scheduled'} />
                                                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Open</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
