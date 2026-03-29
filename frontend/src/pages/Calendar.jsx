
// Calendar Page Component

// Created by: M1 (Pasindu) - Day 7
// Updated by: M2 (Chandeepa) - Day 7 (Calendar layout, events integration,
//   status/priority color coding, legend, event detail popover)

// Displays surgeries in a calendar view using FullCalendar
// Features:
// - Month/Week/Day views
// - Click on event to view surgery details
// - Color-coded by status and priority
// - Legend showing color meanings
// - Event detail popover on click
// - Fetches pre-formatted events from /api/surgeries/events


import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import surgeryService from '../services/surgeryService';
import { toast } from 'react-toastify';
import SurgeryDetailsModal from '../components/SurgeryDetailsModal';


// ── Legend colour config (matches backend STATUS_COLORS / PRIORITY_COLORS) ──

const STATUS_LEGEND = [
    { label: 'Scheduled', color: '#3B82F6' },
    { label: 'In Progress', color: '#F59E0B' },
    { label: 'Completed', color: '#10B981' },
    { label: 'Cancelled', color: '#EF4444' }
];

const PRIORITY_LEGEND = [
    { label: 'Routine', color: '#3B82F6' },
    { label: 'Urgent', color: '#F97316' },
    { label: 'Emergency', color: '#EF4444' }
];


// ── Calendar Component ──

const Calendar = () => {
    const navigate = useNavigate();
    const calendarRef = useRef(null);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedSurgeryId, setSelectedSurgeryId] = useState(null);


    // ── Fetch events from the new /events API ──

    const fetchEvents = useCallback(async (startDate, endDate) => {
        try {
            setLoading(true);
            setError(null);

            const response = await surgeryService.getCalendarEvents({
                startDate: startDate?.toISOString().split('T')[0],
                endDate: endDate?.toISOString().split('T')[0]
            });

            if (response.success) {
                setEvents(response.data);
            } else {
                const msg = response.message || 'Failed to fetch events';
                setError(msg);
                toast.error(msg);
            }
        } catch (err) {
            const msg = err.message || 'Error loading calendar events';
            setError(msg);
            toast.error(msg);
            console.error('Error fetching calendar events:', err);
        } finally {
            setLoading(false);
        }
    }, []);


    // ── Initial load – current month ──

    useEffect(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        fetchEvents(startOfMonth, endOfMonth);
    }, [fetchEvents]);


    // ── Handle view / date-range change ──

    const handleDatesSet = useCallback((dateInfo) => {
        fetchEvents(dateInfo.start, dateInfo.end);
    }, [fetchEvents]);


    // ── Event click → show Modal ──

    const handleEventClick = useCallback((clickInfo) => {
        const surgeryId = clickInfo.event.extendedProps.surgeryId;
        setSelectedSurgeryId(surgeryId);
        setIsDetailsModalOpen(true);
    }, []);


    // ── Date click → create surgery ──

    const handleDateClick = useCallback((dateInfo) => {
        navigate('/surgeries/new', {
            state: { prefilledDate: dateInfo.dateStr }
        });
    }, [navigate]);


    // ── Refresh ──

    const handleRefresh = useCallback(async () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const view = calendarApi.view;
            await fetchEvents(view.activeStart, view.activeEnd);
            toast.info('Calendar schedule refreshed');
        }
    }, [fetchEvents]);


    // ── Custom event content renderer ──

    const renderEventContent = (eventInfo) => {
        const { surgeonName, theatreName } = eventInfo.event.extendedProps;
        const timeText = eventInfo.timeText;

        return (
            <div className="p-1.5 overflow-hidden text-xs text-white leading-tight">
                {timeText && (
                    <div className="font-medium text-[10px] opacity-90">
                        {timeText}
                    </div>
                )}
                <div className="font-semibold truncate">
                    {surgeonName ? `Dr. ${surgeonName.split(' ').pop()}` : 'Unassigned'}
                </div>
                <div className="text-[10px] opacity-90 truncate">
                    {theatreName}
                </div>
            </div>
        );
    };


    // ── Render ──

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-6 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* ── Page header ── */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theatre Schedule Calendar</h1>
                            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                                Click an event for details · Click a date to schedule
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 self-start shadow-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* ── Legend ── */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3 shadow-sm">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status:</span>
                            {STATUS_LEGEND.map(({ label, color }) => (
                                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                                    <span
                                        className="w-3 h-3 rounded-sm inline-block"
                                        style={{ backgroundColor: color }}
                                    />
                                    {label}
                                </span>
                            ))}
                        </div>
                        <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority:</span>
                            {PRIORITY_LEGEND.map(({ label, color }) => (
                                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                                    <span
                                        className="w-3 h-3 rounded-full inline-block"
                                        style={{ backgroundColor: color }}
                                    />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Error state ── */}
                    {error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-700 dark:text-red-400">{error}</p>
                                <button
                                    onClick={handleRefresh}
                                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Calendar container ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 theatre-calendar overflow-hidden">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'today prev,next',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            buttonText={{
                                today: 'Today',
                                month: 'Month',
                                week: 'Week',
                                day: 'Day'
                            }}
                            titleFormat={{ year: 'numeric', month: 'long', day: 'numeric' }}
                            events={events}
                            eventClick={handleEventClick}
                            dateClick={handleDateClick}
                            datesSet={handleDatesSet}
                            eventContent={renderEventContent}
                            height="auto"
                            contentHeight={600}
                            nowIndicator={true}
                            dayMaxEvents={3}
                            moreLinkClick="popover"
                            slotMinTime="06:00:00"
                            slotMaxTime="22:00:00"
                            slotDuration="01:00:00"
                            slotLabelFormat={{
                                hour: 'numeric',
                                minute: '2-digit',
                                meridiem: 'short'
                            }}
                            allDaySlot={false}
                            weekends={true}
                            selectable={true}
                            editable={false}
                            eventDisplay="block"
                            dayHeaderFormat={{ weekday: 'long', month: '2-digit', day: '2-digit' }}
                            loading={(isLoading) => setLoading(isLoading)}
                        />
                    </div>
                </div>

                {/* ── Surgery Details Modal ── */}
                <SurgeryDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    surgeryId={selectedSurgeryId}
                />

                {/* ── Loading overlay ── */}
                {loading && (
                    <div className="fixed inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-[60] flex items-center justify-center">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col items-center gap-4">
                            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-gray-600 dark:text-gray-300 font-medium">Updating Schedule...</p>
                        </div>
                    </div>
                )}

                {/* ── Custom FullCalendar styles ── */}
                <style>{`
                .theatre-calendar .fc { font-family: inherit; }
                .theatre-calendar .fc-toolbar-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
                .dark .theatre-calendar .fc-toolbar-title { color: #f1f5f9; }
                .theatre-calendar .fc-button {
                    background-color: white !important;
                    border: 1px solid #e2e8f0 !important;
                    color: #475569 !important;
                    font-weight: 600;
                    padding: 0.5rem 0.8rem !important;
                    text-transform: capitalize;
                    font-size: 0.85rem !important;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .dark .theatre-calendar .fc-button {
                    background-color: #1e293b !important;
                    border-color: #334155 !important;
                    color: #cbd5e1 !important;
                }
                .theatre-calendar .fc-button:hover { background-color: #f8fafc !important; }
                .dark .theatre-calendar .fc-button:hover { background-color: #334155 !important; }
                .theatre-calendar .fc-button-active {
                    background-color: #3b82f6 !important;
                    border-color: #3b82f6 !important;
                    color: white !important;
                }
                .theatre-calendar .fc-col-header-cell { background-color: #f8fafc; padding: 0.75rem 0; border-color: #e2e8f0 !important; }
                .dark .theatre-calendar .fc-col-header-cell { background-color: #0f172a; border-color: #1e293b !important; }
                .theatre-calendar .fc-col-header-cell-cushion { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; }
                .theatre-calendar .fc-event { border-radius: 4px; border: none !important; cursor: pointer; transition: transform 0.1s; }
                .theatre-calendar .fc-event:hover { transform: scale(1.02); filter: brightness(1.1); }
                .theatre-calendar .fc-daygrid-day-number { color: #64748b; font-weight: 600; font-size: 0.85rem; padding: 8px !important; }
                .theatre-calendar .fc-day-today { background-color: #eff6ff !important; }
                .dark .theatre-calendar .fc-day-today { background-color: #1e293b/50 !important; }
                .theatre-calendar .fc-scrollgrid { border-radius: 8px; overflow: hidden; border-color: #e2e8f0 !important; }
                .dark .theatre-calendar .fc-scrollgrid { border-color: #1e293b !important; }
                .theatre-calendar td, .theatre-calendar th { border-color: #f1f5f9 !important; }
                .dark .theatre-calendar td, .dark .theatre-calendar th { border-color: #1e293b !important; }
            `}</style>
            </div>
        </Layout>
    );
};

export default Calendar;
