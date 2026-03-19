
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
import { AlertCircle, RefreshCw, X, Clock, User, MapPin, Activity, Flag } from 'lucide-react';
import Layout from '../components/Layout';
import surgeryService from '../services/surgeryService';


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
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });


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
                setError(response.message || 'Failed to fetch events');
            }
        } catch (err) {
            setError(err.message || 'Error loading calendar events');
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


    // ── Event click → show popover ──

    const handleEventClick = useCallback((clickInfo) => {
        const rect = clickInfo.el.getBoundingClientRect();
        setPopoverPos({
            top: rect.top + window.scrollY - 10,
            left: rect.right + 12
        });
        setSelectedEvent(clickInfo.event);
    }, []);


    // ── Date click → create surgery ──

    const handleDateClick = useCallback((dateInfo) => {
        navigate('/surgeries/new', {
            state: { prefilledDate: dateInfo.dateStr }
        });
    }, [navigate]);


    // ── Refresh ──

    const handleRefresh = useCallback(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const view = calendarApi.view;
            fetchEvents(view.activeStart, view.activeEnd);
        }
    }, [fetchEvents]);


    // ── Close popover on outside click ──

    useEffect(() => {
        const close = () => setSelectedEvent(null);
        if (selectedEvent) {
            window.addEventListener('click', close, { once: true });
        }
        return () => window.removeEventListener('click', close);
    }, [selectedEvent]);


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


    // ── Helper: format status label ──

    const formatStatus = (s) =>
        s ? s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';


    // ── Render ──

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-6 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* ── Page header ── */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Theatre Schedule Calendar</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Click an event for details · Click a date to schedule
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 self-start"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* ── Legend ── */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status:</span>
                            {STATUS_LEGEND.map(({ label, color }) => (
                                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-700">
                                    <span
                                        className="w-3 h-3 rounded-sm inline-block"
                                        style={{ backgroundColor: color }}
                                    />
                                    {label}
                                </span>
                            ))}
                        </div>
                        <div className="hidden sm:block w-px bg-gray-200" />
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority:</span>
                            {PRIORITY_LEGEND.map(({ label, color }) => (
                                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-700">
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
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-700">{error}</p>
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
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 theatre-calendar">
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

                    {/* ── Event detail popover ── */}
                    {selectedEvent && (
                        <div
                            className="fixed z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                            style={{ top: popoverPos.top, left: Math.min(popoverPos.left, window.innerWidth - 300) }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Popover header */}
                            <div
                                className="px-4 py-3 flex items-center justify-between"
                                style={{ backgroundColor: selectedEvent.backgroundColor || '#3B82F6' }}
                            >
                                <h3 className="text-sm font-semibold text-white truncate pr-2">
                                    {selectedEvent.title}
                                </h3>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Popover body */}
                            <div className="p-4 space-y-2.5 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Patient:</span>
                                    <span>{selectedEvent.extendedProps.patientName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Surgeon:</span>
                                    <span>{selectedEvent.extendedProps.surgeonName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Theatre:</span>
                                    <span>{selectedEvent.extendedProps.theatreName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Duration:</span>
                                    <span>{selectedEvent.extendedProps.duration} min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Status:</span>
                                    <span className="capitalize">{formatStatus(selectedEvent.extendedProps.status)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flag className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Priority:</span>
                                    <span className="capitalize">{selectedEvent.extendedProps.priority}</span>
                                </div>
                            </div>

                            {/* View full details button */}
                            <div className="px-4 pb-3">
                                <button
                                    onClick={() => navigate(`/surgeries/${selectedEvent.extendedProps.surgeryId}`)}
                                    className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Loading overlay ── */}
                    {loading && (
                        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-40 pointer-events-none">
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg flex items-center gap-3">
                                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                                <span className="text-gray-700">Loading surgeries...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Custom FullCalendar styles ── */}
                <style>{`
                .theatre-calendar .fc {
                    font-family: inherit;
                }
                .theatre-calendar .fc-toolbar-title {
                    font-size: 1rem;
                    font-weight: 500;
                }
                .theatre-calendar .fc-button {
                    background-color: white !important;
                    border: 1px solid #d1d5db !important;
                    color: #374151 !important;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    text-transform: capitalize;
                }
                .theatre-calendar .fc-button:hover {
                    background-color: #f3f4f6 !important;
                }
                .theatre-calendar .fc-button-active {
                    background-color: #3b82f6 !important;
                    border-color: #3b82f6 !important;
                    color: white !important;
                }
                .theatre-calendar .fc-today-button {
                    background-color: white !important;
                    border: 1px solid #d1d5db !important;
                    color: #374151 !important;
                }
                .theatre-calendar .fc-col-header-cell {
                    background-color: #f9fafb;
                    padding: 0.75rem 0;
                }
                .theatre-calendar .fc-col-header-cell-cushion {
                    color: #374151;
                    font-weight: 500;
                }
                .theatre-calendar .fc-timegrid-slot-label {
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .theatre-calendar .fc-event {
                    border-radius: 6px;
                    border: none !important;
                    cursor: pointer;
                }
                .theatre-calendar .fc-daygrid-day-number {
                    color: #374151;
                    font-weight: 500;
                }
                .theatre-calendar .fc-day-today {
                    background-color: #eff6ff !important;
                }
            `}</style>
            </div>
        </Layout>
    );
};

export default Calendar;
