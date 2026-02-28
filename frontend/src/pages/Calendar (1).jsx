
// Calendar Page Component

// Created by: M1 (Pasindu) - Day 7

// Displays surgeries in a calendar view using FullCalendar
// Features:
// - Month/Week/Day views
// - Click on event to view surgery details
// - Color-coded by status/priority
// - Fetches surgeries by date range for performance


import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AlertCircle, RefreshCw } from 'lucide-react';
import surgeryService from '../services/surgeryService';


// Event Colors - Match UI Design (Blue theme)

const EVENT_COLOR = {
    backgroundColor: '#3B82F6',  // Blue
    borderColor: '#2563EB',
    textColor: '#FFFFFF'
};


// Calendar Component

const Calendar = () => {
    const navigate = useNavigate();
    const calendarRef = useRef(null);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // Transform Surgery to Calendar Event

    const transformSurgeryToEvent = (surgery) => {
        // Combine date and time for start
        let start = surgery.scheduled_date;
        let startTimeStr = '';
        if (surgery.scheduled_time) {
            // Handle both ISO time and HH:mm:ss formats
            startTimeStr = surgery.scheduled_time.includes('T')
                ? surgery.scheduled_time.split('T')[1].substring(0, 5)
                : surgery.scheduled_time.substring(0, 5);
            start = `${surgery.scheduled_date.split('T')[0]}T${startTimeStr}`;
        }

        // Calculate end time based on duration
        let end = null;
        let endTimeStr = '';
        if (surgery.duration_minutes && surgery.scheduled_time) {
            const startDate = new Date(start);
            const endDate = new Date(startDate.getTime() + surgery.duration_minutes * 60000);
            end = endDate.toISOString();
            endTimeStr = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }

        // Format start time for display
        const formattedStartTime = startTimeStr ?
            new Date(`2000-01-01T${startTimeStr}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

        return {
            id: surgery.id.toString(),
            title: surgery.surgery_type || 'Surgery',
            start,
            end,
            allDay: !surgery.scheduled_time,
            extendedProps: {
                surgeryId: surgery.id,
                surgeryType: surgery.surgery_type,
                patientName: surgery.patient_name,
                surgeonName: surgery.surgeon?.name || 'Unassigned',
                theatreName: surgery.theatre_id ? `Theatre:-${String(surgery.theatre_id).padStart(2, '0')}` : 'No Theatre',
                status: surgery.status,
                priority: surgery.priority,
                duration: surgery.duration_minutes,
                startTime: formattedStartTime,
                endTime: endTimeStr
            },
            ...EVENT_COLOR
        };
    };


    // Fetch Surgeries for Date Range

    const fetchSurgeries = useCallback(async (startDate, endDate) => {
        try {
            setLoading(true);
            setError(null);

            const response = await surgeryService.getAllSurgeries({
                startDate: startDate?.toISOString().split('T')[0],
                endDate: endDate?.toISOString().split('T')[0]
            });

            if (response.success) {
                const calendarEvents = response.data.map(transformSurgeryToEvent);
                setEvents(calendarEvents);
            } else {
                setError(response.message || 'Failed to fetch surgeries');
            }
        } catch (err) {
            setError(err.message || 'Error loading surgeries');
            console.error('Error fetching surgeries for calendar:', err);
        } finally {
            setLoading(false);
        }
    }, []);


    // Initial Load - Fetch Current Month
    useEffect(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        fetchSurgeries(startOfMonth, endOfMonth);
    }, [fetchSurgeries]);


    // Handle Date Range Change (view change/navigation)

    const handleDatesSet = (dateInfo) => {
        fetchSurgeries(dateInfo.start, dateInfo.end);

    };


    // Handle Event Click - Navigate to Surgery Detail

    const handleEventClick = (clickInfo) => {
        const surgeryId = clickInfo.event.extendedProps.surgeryId;
        navigate(`/surgeries/${surgeryId}`);
    };


    // Handle Date Click - Navigate to Create Surgery

    const handleDateClick = (dateInfo) => {
        navigate('/surgeries/new', {
            state: {
                prefilledDate: dateInfo.dateStr
            }
        });
    };


    // Refresh Calendar

    const handleRefresh = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const view = calendarApi.view;
            fetchSurgeries(view.activeStart, view.activeEnd);
        }
    };

    // Custom Event Content Renderer - Match UI Design

    const renderEventContent = (eventInfo) => {
        const { startTime, endTime, surgeonName, theatreName } = eventInfo.event.extendedProps;

        return (
            <div className="p-1.5 overflow-hidden text-xs text-white leading-tight">
                {/* Time Range */}
                {startTime && endTime && (
                    <div className="font-medium text-[10px] opacity-90">
                        {startTime} - {endTime}
                    </div>
                )}
                {/* Doctor Name */}
                <div className="font-semibold truncate">
                    {surgeonName ? `Dr. ${surgeonName.split(' ').pop()}` : 'Unassigned'}
                </div>
                {/* Theatre */}
                <div className="text-[10px] opacity-90 truncate">
                    {theatreName}
                </div>
            </div>
        );
    };


    // Render

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Page Header - Match UI Design */}
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Theatre Schedule Calendar</h1>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Error State */}
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

                {/* Calendar Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 theatre-calendar">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
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

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 pointer-events-none">
                        <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
                            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                            <span className="text-gray-700">Loading surgeries...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Styles for FullCalendar to match UI design */}
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
    );
};

export default Calendar;
