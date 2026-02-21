// ============================================================================
// Theatre Status Legend Component
// ============================================================================
// Created by: M3 (Janani) - Day 10
//
// A compact horizontal legend that shows every theatre status with its
// associated colour dot and label.  Useful at the top of dashboards or
// list pages to give users a quick reference.
//
// Props:
//   size       – 'sm' | 'md'  (default 'sm')
//   className  – extra wrapper classes
//   interactive – if true, each item is a clickable filter button
//   activeStatus – currently selected status (highlights that item)
//   onStatusClick – callback(status) fired when an item is clicked
// ============================================================================

import React from 'react';
import {
    VALID_THEATRE_STATUSES,
    getStatusColor,
    getStatusLabel
} from '../utils/theatreStatusColors';

const SIZE_MAP = {
    sm: { dot: 'w-2 h-2', text: 'text-xs', gap: 'gap-1.5', padding: 'px-2 py-1' },
    md: { dot: 'w-2.5 h-2.5', text: 'text-sm', gap: 'gap-2', padding: 'px-3 py-1.5' }
};

const TheatreStatusLegend = ({
    size = 'sm',
    className = '',
    interactive = false,
    activeStatus = null,
    onStatusClick = () => {}
}) => {
    const s = SIZE_MAP[size] || SIZE_MAP.sm;

    return (
        <div
            className={`flex flex-wrap items-center gap-3 ${className}`}
            role={interactive ? 'group' : undefined}
            aria-label="Theatre status legend"
        >
            {VALID_THEATRE_STATUSES.map((status) => {
                const color = getStatusColor(status);
                const label = getStatusLabel(status);
                const isActive = activeStatus === status;

                const inner = (
                    <>
                        <span className={`rounded-full ${color.dot} ${s.dot} shrink-0`} />
                        <span className={`${s.text} font-medium ${isActive ? color.text : 'text-gray-600'}`}>
                            {label}
                        </span>
                    </>
                );

                if (interactive) {
                    return (
                        <button
                            key={status}
                            type="button"
                            onClick={() => onStatusClick(status)}
                            className={`
                                inline-flex items-center ${s.gap} ${s.padding} rounded-full border
                                transition-all duration-150
                                ${isActive
                                    ? `${color.bg} ${color.border} ${color.text} ring-2 ${color.ringColor}`
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }
                            `}
                            aria-pressed={isActive}
                            aria-label={`Filter by ${label}`}
                        >
                            {inner}
                        </button>
                    );
                }

                return (
                    <span
                        key={status}
                        className={`inline-flex items-center ${s.gap} ${s.padding}`}
                    >
                        {inner}
                    </span>
                );
            })}

            {/* "All" reset button when interactive and a filter is active */}
            {interactive && activeStatus && (
                <button
                    type="button"
                    onClick={() => onStatusClick(null)}
                    className={`
                        inline-flex items-center ${s.gap} ${s.padding} rounded-full
                        border border-gray-300 bg-gray-50 text-gray-500
                        hover:bg-gray-100 transition-colors ${s.text} font-medium
                    `}
                    aria-label="Clear status filter"
                >
                    ✕ Clear
                </button>
            )}
        </div>
    );
};

export default TheatreStatusLegend;
