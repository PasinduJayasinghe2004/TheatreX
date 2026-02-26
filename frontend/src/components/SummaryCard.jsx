// ============================================================================
// Summary Card Component
// ============================================================================
// Created by: M5 (Inthusha) - Day 12
//
// Reusable card for displaying summary statistics on dashboards.
// ============================================================================

import React from 'react';

/**
 * SummaryCard Component
 * @param {string} label - The text label for the metric
 * @param {string|number} value - The numeric or text value to display
 * @param {string} colour - Tailwind background colour for the icon container
 * @param {React.ReactNode} icon - SVG or other icon element
 */
const SummaryCard = ({ label, value, colour, icon }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 transition-all hover:shadow-md">
        <div className={`w-12 h-12 ${colour} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
    </div>
);

export default SummaryCard;
