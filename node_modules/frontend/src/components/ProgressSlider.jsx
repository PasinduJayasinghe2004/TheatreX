// ============================================================================
// Progress Slider Component
// ============================================================================
// Created by: M1 (Pasindu) - Day 11
//
// A reusable progress slider component for tracking surgery progress.
// Displays a slider (0-100%) that coordinators/admins can use to update
// the progress of an in-progress surgery.
//
// Props:
//   value        - Current progress value (0-100)
//   onChange     - Callback(newValue) fired when slider value changes
//   onCommit     - Callback(finalValue) fired when user releases the slider
//   disabled     - Whether the slider is disabled
//   showLabel    - Whether to show the percentage label (default: true)
//   size         - 'sm' | 'md' | 'lg' (default: 'md')
//   variant      - 'default' | 'compact' (default: 'default')
// ============================================================================

import { useState, useCallback } from 'react';
import { Activity } from 'lucide-react';

// ── Size Configuration ──────────────────────────────────────────────────────

const SIZE_CONFIG = {
    sm: {
        track: 'h-1.5',
        thumb: 'w-3 h-3',
        label: 'text-xs',
        icon: 'w-3 h-3'
    },
    md: {
        track: 'h-2',
        thumb: 'w-4 h-4',
        label: 'text-sm',
        icon: 'w-4 h-4'
    },
    lg: {
        track: 'h-3',
        thumb: 'w-5 h-5',
        label: 'text-base',
        icon: 'w-5 h-5'
    }
};

// ── Progress Color based on value ───────────────────────────────────────────

const getProgressColor = (value) => {
    if (value < 25) return 'bg-red-500';
    if (value < 50) return 'bg-amber-500';
    if (value < 75) return 'bg-blue-500';
    return 'bg-emerald-500';
};

const getProgressBgColor = (value) => {
    if (value < 25) return 'bg-red-100';
    if (value < 50) return 'bg-amber-100';
    if (value < 75) return 'bg-blue-100';
    return 'bg-emerald-100';
};

// ── Component ───────────────────────────────────────────────────────────────

const ProgressSlider = ({
    value = 0,
    onChange,
    onCommit,
    disabled = false,
    showLabel = true,
    size = 'md',
    variant = 'default'
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
    const displayValue = isDragging ? localValue : value;
    const progressColor = getProgressColor(displayValue);
    const bgColor = getProgressBgColor(displayValue);

    // Handle slider change (during drag)
    const handleChange = useCallback((e) => {
        const newValue = parseInt(e.target.value, 10);
        setLocalValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    }, [onChange]);

    // Handle mouse down - start dragging
    const handleMouseDown = useCallback(() => {
        setIsDragging(true);
    }, []);

    // Handle mouse up - commit the value
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (onCommit) {
            onCommit(localValue);
        }
    }, [localValue, onCommit]);

    // Compact variant for card display
    if (variant === 'compact') {
        return (
            <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                        <Activity className={`${config.icon} text-blue-600`} />
                        <span className={`${config.label} font-medium text-gray-700`}>Progress</span>
                    </div>
                    {showLabel && (
                        <span className={`${config.label} font-bold ${progressColor.replace('bg-', 'text-')}`}>
                            {displayValue}%
                        </span>
                    )}
                </div>
                <div className={`relative w-full ${config.track} ${bgColor} rounded-full overflow-hidden`}>
                    <div
                        className={`absolute left-0 top-0 h-full ${progressColor} rounded-full transition-all duration-150`}
                        style={{ width: `${displayValue}%` }}
                    />
                </div>
            </div>
        );
    }

    // Default variant with interactive slider
    return (
        <div className="w-full">
            {/* Header with label */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Activity className={`${config.icon} text-blue-600`} />
                    <span className={`${config.label} font-medium text-gray-700`}>Surgery Progress</span>
                </div>
                {showLabel && (
                    <span className={`${config.label} font-bold ${progressColor.replace('bg-', 'text-')}`}>
                        {displayValue}%
                    </span>
                )}
            </div>

            {/* Progress bar background */}
            <div className={`relative w-full ${config.track} ${bgColor} rounded-full mb-2`}>
                <div
                    className={`absolute left-0 top-0 h-full ${progressColor} rounded-full transition-all duration-150`}
                    style={{ width: `${displayValue}%` }}
                />
            </div>

            {/* Slider input */}
            {!disabled && (
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={isDragging ? localValue : value}
                    onChange={handleChange}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        handleMouseDown(e);
                    }}
                    onPointerUp={(e) => {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                        handleMouseUp(e);
                    }}
                    disabled={disabled}
                    className={`
                        w-full h-2 appearance-none cursor-pointer rounded-full
                        bg-transparent
                        [&::-webkit-slider-runnable-track]:rounded-full
                        [&::-webkit-slider-runnable-track]:bg-gray-200
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:${config.thumb}
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-blue-600
                        [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-white
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:cursor-grab
                        [&::-webkit-slider-thumb]:active:cursor-grabbing
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-track]:rounded-full
                        [&::-moz-range-track]:bg-gray-200
                        [&::-moz-range-thumb]:${config.thumb}
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-blue-600
                        [&::-moz-range-thumb]:border-2
                        [&::-moz-range-thumb]:border-white
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    `}
                />
            )}

            {/* Progress milestones */}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
            </div>
        </div>
    );
};

export default ProgressSlider;
