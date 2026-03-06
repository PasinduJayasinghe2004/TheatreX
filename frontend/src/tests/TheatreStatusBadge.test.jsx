// ============================================================================
// Theatre Status Badge & Color Utility Tests
// ============================================================================
// Created by: M3 (Janani) - Day 10
//
// Tests for:
// - TheatreStatusBadge component rendering + colour coding
// - TheatreStatusLegend component rendering + interactive mode
// - theatreStatusColors utility helpers
//
// Run with: npx vitest run src/tests/TheatreStatusBadge.test.jsx
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TheatreStatusBadge, {
    ALL_THEATRE_STATUSES,
    THEATRE_STATUS_LABELS,
    ALL_THEATRE_TYPES,
    THEATRE_TYPE_LABELS
} from '../components/TheatreStatusBadge';
import TheatreStatusLegend from '../components/TheatreStatusLegend';
import {
    THEATRE_STATUS,
    VALID_THEATRE_STATUSES,
    getStatusColor,
    getStatusLabel,
    getStatusBadgeClasses,
    getStatusDotClass,
    getStatusGradient,
    getStatusCardBorder,
    getStatusHex,
    VALID_THEATRE_TYPES,
    getTypeColor,
    getTypeLabel,
    getTypeBadgeClasses,
    getAllowedTransitions,
    THEATRE_STATUS_TRANSITIONS
} from '../utils/theatreStatusColors';

// ============================================================================
// theatreStatusColors utility tests
// ============================================================================
describe('theatreStatusColors utility', () => {
    // ── Enum constants ──────────────────────────────────────────────────────

    it('should define all four theatre statuses', () => {
        expect(VALID_THEATRE_STATUSES).toEqual([
            'available', 'in_use', 'maintenance', 'cleaning'
        ]);
    });

    it('THEATRE_STATUS enum should be frozen', () => {
        expect(Object.isFrozen(THEATRE_STATUS)).toBe(true);
    });

    it('should define all six theatre types', () => {
        expect(VALID_THEATRE_TYPES).toHaveLength(6);
        expect(VALID_THEATRE_TYPES).toContain('general');
        expect(VALID_THEATRE_TYPES).toContain('cardiac');
        expect(VALID_THEATRE_TYPES).toContain('emergency');
    });

    // ── getStatusColor ──────────────────────────────────────────────────────

    it('getStatusColor returns correct tokens for each status', () => {
        VALID_THEATRE_STATUSES.forEach(status => {
            const color = getStatusColor(status);
            expect(color).toHaveProperty('label');
            expect(color).toHaveProperty('bg');
            expect(color).toHaveProperty('text');
            expect(color).toHaveProperty('border');
            expect(color).toHaveProperty('dot');
            expect(color).toHaveProperty('gradient');
            expect(color).toHaveProperty('hex');
        });
    });

    it('getStatusColor falls back to available for unknown status', () => {
        const color = getStatusColor('nonexistent');
        expect(color.label).toBe('Available');
    });

    // ── Label helpers ───────────────────────────────────────────────────────

    it('getStatusLabel returns human-readable labels', () => {
        expect(getStatusLabel('available')).toBe('Available');
        expect(getStatusLabel('in_use')).toBe('In Use');
        expect(getStatusLabel('maintenance')).toBe('Maintenance');
        expect(getStatusLabel('cleaning')).toBe('Cleaning');
    });

    it('getTypeLabel returns human-readable type labels', () => {
        expect(getTypeLabel('cardiac')).toBe('Cardiac');
        expect(getTypeLabel('neuro')).toBe('Neuro');
        expect(getTypeLabel('day_surgery')).toBe('Day Surgery');
    });

    // ── Class-string helpers ────────────────────────────────────────────────

    it('getStatusBadgeClasses returns bg + text + border', () => {
        const classes = getStatusBadgeClasses('in_use');
        expect(classes).toContain('bg-blue-50');
        expect(classes).toContain('text-blue-700');
        expect(classes).toContain('border-blue-200');
    });

    it('getStatusDotClass returns dot colour', () => {
        expect(getStatusDotClass('maintenance')).toBe('bg-amber-500');
    });

    it('getStatusGradient returns gradient string', () => {
        const g = getStatusGradient('cleaning');
        expect(g).toContain('from-purple-500');
    });

    it('getStatusCardBorder returns left-border class', () => {
        expect(getStatusCardBorder('available')).toBe('border-l-emerald-500');
    });

    it('getStatusHex returns hex colour', () => {
        expect(getStatusHex('in_use')).toBe('#3b82f6');
    });

    // ── Type colour helpers ─────────────────────────────────────────────────

    it('getTypeColor returns correct token set', () => {
        const c = getTypeColor('cardiac');
        expect(c).toHaveProperty('label', 'Cardiac');
        expect(c).toHaveProperty('bg');
        expect(c).toHaveProperty('text');
        expect(c).toHaveProperty('hex');
    });

    it('getTypeBadgeClasses returns bg + text', () => {
        const classes = getTypeBadgeClasses('emergency');
        expect(classes).toContain('bg-rose-50');
        expect(classes).toContain('text-rose-700');
    });

    it('getTypeColor falls back to general for unknown type', () => {
        const c = getTypeColor('unknown');
        expect(c.label).toBe('General');
    });

    // ── Status transitions ──────────────────────────────────────────────────

    it('getAllowedTransitions returns correct transitions', () => {
        expect(getAllowedTransitions('available')).toEqual(['in_use', 'maintenance']);
        expect(getAllowedTransitions('in_use')).toEqual(['available', 'cleaning']);
        expect(getAllowedTransitions('maintenance')).toEqual(['available']);
        expect(getAllowedTransitions('cleaning')).toEqual(['available']);
    });

    it('getAllowedTransitions returns empty array for unknown status', () => {
        expect(getAllowedTransitions('bogus')).toEqual([]);
    });

    it('THEATRE_STATUS_TRANSITIONS should be frozen', () => {
        expect(Object.isFrozen(THEATRE_STATUS_TRANSITIONS)).toBe(true);
    });
});

// ============================================================================
// TheatreStatusBadge component tests
// ============================================================================
describe('TheatreStatusBadge component', () => {
    it('renders the correct label for each status', () => {
        ALL_THEATRE_STATUSES.forEach(status => {
            const { unmount } = render(<TheatreStatusBadge status={status} />);
            expect(screen.getByText(THEATRE_STATUS_LABELS[status])).toBeInTheDocument();
            unmount();
        });
    });

    it('renders as a <span> by default', () => {
        const { container } = render(<TheatreStatusBadge status="available" />);
        const el = container.firstChild;
        expect(el.tagName).toBe('SPAN');
    });

    it('renders as a <button> when onClick is provided', () => {
        const handleClick = vi.fn();
        const { container } = render(
            <TheatreStatusBadge status="available" onClick={handleClick} />
        );
        const el = container.firstChild;
        expect(el.tagName).toBe('BUTTON');
        fireEvent.click(el);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies md size classes when size="md"', () => {
        const { container } = render(
            <TheatreStatusBadge status="in_use" size="md" />
        );
        expect(container.firstChild.className).toContain('text-sm');
    });

    it('applies colour-coded classes matching the utility', () => {
        const { container } = render(
            <TheatreStatusBadge status="maintenance" />
        );
        const className = container.firstChild.className;
        expect(className).toContain('bg-amber-50');
        expect(className).toContain('text-amber-700');
        expect(className).toContain('border-amber-200');
    });

    it('falls back gracefully for an unknown status', () => {
        render(
            <TheatreStatusBadge status="nonexistent" />
        );
        // Should fall back to available styling
        expect(screen.getByText('Available')).toBeInTheDocument();
    });
});

// ============================================================================
// Re-exported constants from TheatreStatusBadge
// ============================================================================
describe('TheatreStatusBadge re-exports', () => {
    it('ALL_THEATRE_STATUSES matches VALID_THEATRE_STATUSES', () => {
        expect(ALL_THEATRE_STATUSES).toEqual(VALID_THEATRE_STATUSES);
    });

    it('THEATRE_STATUS_LABELS maps every status to a string', () => {
        ALL_THEATRE_STATUSES.forEach(s => {
            expect(typeof THEATRE_STATUS_LABELS[s]).toBe('string');
        });
    });

    it('ALL_THEATRE_TYPES has six entries', () => {
        expect(ALL_THEATRE_TYPES).toHaveLength(6);
    });

    it('THEATRE_TYPE_LABELS maps every type to a string', () => {
        ALL_THEATRE_TYPES.forEach(t => {
            expect(typeof THEATRE_TYPE_LABELS[t]).toBe('string');
        });
    });
});

// ============================================================================
// TheatreStatusLegend component tests
// ============================================================================
describe('TheatreStatusLegend component', () => {
    it('renders all four status labels', () => {
        render(<TheatreStatusLegend />);
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('In Use')).toBeInTheDocument();
        expect(screen.getByText('Maintenance')).toBeInTheDocument();
        expect(screen.getByText('Cleaning')).toBeInTheDocument();
    });

    it('renders <span> items by default (non-interactive)', () => {
        const { container } = render(<TheatreStatusLegend />);
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(0);
    });

    it('renders <button> items when interactive', () => {
        const { container } = render(
            <TheatreStatusLegend interactive onStatusClick={() => { }} />
        );
        const buttons = container.querySelectorAll('button');
        // 4 status buttons (no clear button when nothing active)
        expect(buttons.length).toBe(4);
    });

    it('calls onStatusClick when an item is clicked', () => {
        const handleClick = vi.fn();
        render(
            <TheatreStatusLegend interactive onStatusClick={handleClick} />
        );
        fireEvent.click(screen.getByText('Maintenance'));
        expect(handleClick).toHaveBeenCalledWith('maintenance');
    });

    it('shows clear button when activeStatus is set', () => {
        render(
            <TheatreStatusLegend
                interactive
                activeStatus="in_use"
                onStatusClick={() => { }}
            />
        );
        expect(screen.getByText(/Clear/)).toBeInTheDocument();
    });

    it('calls onStatusClick(null) when clear is clicked', () => {
        const handleClick = vi.fn();
        render(
            <TheatreStatusLegend
                interactive
                activeStatus="in_use"
                onStatusClick={handleClick}
            />
        );
        fireEvent.click(screen.getByText(/Clear/));
        expect(handleClick).toHaveBeenCalledWith(null);
    });
});
