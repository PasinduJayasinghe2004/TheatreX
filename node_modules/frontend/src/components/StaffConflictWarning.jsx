// ============================================================================
// Staff Conflict Warning Component
// ============================================================================
// Created by: M4 (Oneli) - Day 9
// 
// Displays warning alerts when staff scheduling conflicts are detected.
// Shows detailed information about conflicting surgeries.
//
// Props:
// - warnings: Array of warning objects from checkStaffConflicts API
// - loading: Boolean to show loading state
// - onDismiss: Optional callback when warning is dismissed
// ============================================================================

import { useState } from 'react';

// Icons for different warning types
const AlertIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const ErrorIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

// Loading spinner
const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// Format time for display
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
        // Handle various time formats
        const time = new Date(`2000-01-01T${timeStr}`);
        return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return timeStr;
    }
};

// Single warning item component
const WarningItem = ({ warning, onDismiss, expanded, onToggle }) => {
    const isError = warning.severity === 'error';
    
    const bgColor = isError ? 'bg-red-50' : 'bg-yellow-50';
    const borderColor = isError ? 'border-red-200' : 'border-yellow-200';
    const textColor = isError ? 'text-red-800' : 'text-yellow-800';
    const iconColor = isError ? 'text-red-500' : 'text-yellow-500';
    const badgeColor = isError ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

    return (
        <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-3`}>
            <div className="flex items-start">
                {/* Icon */}
                <div className={`flex-shrink-0 ${iconColor}`}>
                    {isError ? <ErrorIcon /> : <AlertIcon />}
                </div>
                
                {/* Content */}
                <div className="ml-3 flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${textColor}`}>
                                {warning.staff_role} Conflict
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {isError ? 'Critical' : 'Warning'}
                            </span>
                        </div>
                        {onDismiss && (
                            <button
                                onClick={() => onDismiss(warning.staff_id, warning.type)}
                                className={`${textColor} hover:opacity-70 transition-opacity`}
                                aria-label="Dismiss warning"
                            >
                                <CloseIcon />
                            </button>
                        )}
                    </div>
                    
                    {/* Message */}
                    <p className={`text-sm mt-1 ${textColor}`}>
                        {warning.message}
                    </p>
                    
                    {/* Conflicting surgeries - expandable */}
                    {warning.conflicting_surgeries && warning.conflicting_surgeries.length > 0 && (
                        <div className="mt-2">
                            <button
                                onClick={onToggle}
                                className={`text-xs ${textColor} hover:underline flex items-center gap-1`}
                            >
                                {expanded ? 'Hide' : 'Show'} conflicting surgery details
                                <svg 
                                    className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {expanded && (
                                <div className={`mt-2 p-2 rounded ${isError ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                    {warning.conflicting_surgeries.map((surgery, idx) => (
                                        <div key={surgery.surgery_id || idx} className="text-xs mb-2 last:mb-0">
                                            <div className="font-medium">{surgery.surgery_type}</div>
                                            <div className="text-opacity-80">
                                                <span>Patient: {surgery.patient || 'N/A'}</span>
                                                {surgery.theatre && <span> | Theatre: {surgery.theatre}</span>}
                                            </div>
                                            <div className="text-opacity-80">
                                                Time: {formatTime(surgery.scheduled_time)} ({surgery.duration} min)
                                                {surgery.priority && surgery.priority !== 'routine' && (
                                                    <span className="ml-2 text-red-600 font-medium">
                                                        [{surgery.priority.toUpperCase()}]
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main component
const StaffConflictWarning = ({ 
    warnings = [], 
    loading = false, 
    onDismiss = null,
    className = ''
}) => {
    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpand = (staffId, type) => {
        const key = `${type}-${staffId}`;
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Show loading state
    if (loading) {
        return (
            <div className={`flex items-center gap-2 text-yellow-600 text-sm ${className}`}>
                <Spinner />
                <span>Checking staff availability...</span>
            </div>
        );
    }

    // No warnings
    if (!warnings || warnings.length === 0) {
        return null;
    }

    // Sort warnings by severity (errors first)
    const sortedWarnings = [...warnings].sort((a, b) => {
        if (a.severity === 'error' && b.severity !== 'error') return -1;
        if (a.severity !== 'error' && b.severity === 'error') return 1;
        return 0;
    });

    const errorCount = warnings.filter(w => w.severity === 'error').length;
    const warningCount = warnings.filter(w => w.severity === 'warning').length;

    return (
        <div className={`staff-conflict-warning ${className}`}>
            {/* Summary header */}
            <div className="flex items-center gap-2 mb-3">
                <div className={`text-sm font-medium ${errorCount > 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                    {errorCount > 0 && (
                        <span className="mr-2">
                            {errorCount} critical conflict{errorCount > 1 ? 's' : ''}
                        </span>
                    )}
                    {warningCount > 0 && (
                        <span>
                            {warningCount} warning{warningCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Warning list */}
            {sortedWarnings.map((warning, index) => {
                const key = `${warning.type}-${warning.staff_id}`;
                return (
                    <WarningItem
                        key={key || index}
                        warning={warning}
                        onDismiss={onDismiss}
                        expanded={expandedItems[key] || false}
                        onToggle={() => toggleExpand(warning.staff_id, warning.type)}
                    />
                );
            })}

            {/* Action hint */}
            {errorCount > 0 && (
                <p className="text-xs text-red-600 mt-2">
                    Please resolve critical conflicts before scheduling the surgery.
                </p>
            )}
        </div>
    );
};

export default StaffConflictWarning;
