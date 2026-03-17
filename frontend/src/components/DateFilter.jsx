// ============================================================================
// Date Filter Component
// ============================================================================
// Created by: M4 (Oneli) - Day 6
// 
// Provides date range filtering UI for surgeries
// Features:
// - Start date picker
// - End date picker
// - Apply filter button
// - Clear filter button
// ============================================================================

import { useState } from 'react';
import { Calendar, X } from 'lucide-react';

const DateFilter = ({ onFilterChange, onClearFilter }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Handle apply filter
    const handleApplyFilter = () => {
        if (!startDate && !endDate) {
            return; // No filter to apply
        }

        onFilterChange({
            startDate: startDate || null,
            endDate: endDate || null
        });
    };

    // Handle clear filter
    const handleClearFilter = () => {
        setStartDate('');
        setEndDate('');
        onClearFilter();
    };

    // Check if any filter is active
    const hasActiveFilter = startDate || endDate;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
                {/* Start Date */}
                <div className="flex-1">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Start Date
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* End Date */}
                <div className="flex-1">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        End Date
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleApplyFilter}
                        disabled={!startDate && !endDate}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        Apply Filter
                    </button>

                    {hasActiveFilter && (
                        <button
                            onClick={handleClearFilter}
                            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Active Filter Indicator */}
            {hasActiveFilter && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                        <span className="font-medium">Active Filter:</span>
                        {startDate && ` From ${new Date(startDate).toLocaleDateString()}`}
                        {startDate && endDate && ' -'}
                        {endDate && ` To ${new Date(endDate).toLocaleDateString()}`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DateFilter;
