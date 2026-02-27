// ============================================================================
// StatsCard Component
// ============================================================================
// Created by: M4 (Oneli) - Day 7
// 
// Reusable statistics card component for displaying dashboard metrics.
// Supports customizable title, value, icon, color, and subtitle.
// ============================================================================

import PropTypes from 'prop-types';

const StatsCard = ({ title, value, icon, color = 'blue', subtitle }) => {
    // Color variants for the card
    const colorVariants = {
        blue: 'bg-blue-50 border-blue-200 text-blue-600',
        green: 'bg-green-50 border-green-200 text-green-600',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
        red: 'bg-red-50 border-red-200 text-red-600',
        purple: 'bg-purple-50 border-purple-200 text-purple-600',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
        pink: 'bg-pink-50 border-pink-200 text-pink-600',
        gray: 'bg-gray-50 border-gray-200 text-gray-600'
    };

    const selectedColor = colorVariants[color] || colorVariants.blue;

    return (
        <div className={`p-6 rounded-lg border-2 ${selectedColor} transition-all duration-300 hover:shadow-lg`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {value !== null && value !== undefined ? value : '—'}
                    </p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="ml-4">
                        <div className={`p-3 rounded-full ${selectedColor}`}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

StatsCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    icon: PropTypes.node,
    color: PropTypes.oneOf(['blue', 'green', 'yellow', 'red', 'purple', 'indigo', 'pink', 'gray']),
    subtitle: PropTypes.string
};

export default StatsCard;
