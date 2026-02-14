
// Surgery Card Component

// Created by: M4 (Oneli) - Day 5
// 
// Displays a summary of a single surgery
// Used in the Surgery List view

import React from 'react';
import { Clock, Calendar, User, Activity } from 'lucide-react';

const SurgeryCard = ({ surgery, onEdit, onDelete }) => {
    // Helper to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200'; // scheduled
        }
    };

    // Helper to get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'emergency': return 'bg-red-50 text-red-700 border-red-100';
            case 'urgent': return 'bg-orange-50 text-orange-700 border-orange-100';
            default: return 'bg-blue-50 text-blue-700 border-blue-100'; // routine
        }
    };

    // Format date nicely
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time nicely
    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        // Handle both full ISO strings and TIME strings (HH:mm:ss)
        if (timeString.includes('T')) {
            return new Date(timeString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return timeString.substring(0, 5); // Simple HH:mm
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            {/* Header: Type and Status */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{surgery.surgery_type}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <User className="w-3 h-3 mr-1" />
                        <span>{surgery.patient_name || 'Unknown Patient'}</span>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(surgery.status)} capitalize`}>
                    {surgery.status?.replace('_', ' ') || 'Scheduled'}
                </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatDate(surgery.scheduled_date)}</span>
                </div>
                <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatTime(surgery.scheduled_time)} ({surgery.duration_minutes} min)</span>
                </div>
                <div className="flex items-center col-span-2">
                    <Activity className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="mr-2">Surgeon:</span>
                    <span className="font-medium text-gray-800">{surgery.surgeon?.name || 'Unassigned'}</span>
                </div>
            </div>

            {/* Footer: Priority and Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(surgery.priority)} capitalize`}>
                    {surgery.priority}
                </span>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(surgery.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        aria-label={`Edit surgery for ${surgery.patient_name}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(surgery.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        aria-label={`Delete surgery for ${surgery.patient_name}`}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurgeryCard;
