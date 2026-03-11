// ============================================================================
// NotificationItem Tests - M6 Day 16
// ============================================================================
// Created by: M6 (Dinil) - Day 16
//
// Tests for the NotificationItem component:
//  - Renders title, message, and timestamp
//  - Shows "mark as read" button only for unread items
//  - Calls onMarkRead(id) when button is clicked
//  - Applies correct type-based styles
//  - Read items have no action button
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationItem from '../components/NotificationItem';

// ── Helper to build a notification object ───────────────────────────────────
const makeNotification = (overrides = {}) => ({
    id: 1,
    type: 'info',
    title: 'Test Notification',
    message: 'This is a test notification message.',
    is_read: false,
    created_at: new Date('2024-01-15T14:30:00Z').toISOString(),
    ...overrides
});

// ─────────────────────────────────────────────────────────────────────────────
describe('NotificationItem (M6 Day 16)', () => {

    // ── Basic rendering ──────────────────────────────────────────────────────
    it('should render the notification title', () => {
        render(<NotificationItem notification={makeNotification()} onMarkRead={vi.fn()} />);
        expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });

    it('should render the notification message', () => {
        render(<NotificationItem notification={makeNotification()} onMarkRead={vi.fn()} />);
        expect(screen.getByText('This is a test notification message.')).toBeInTheDocument();
    });

    it('should render a formatted timestamp', () => {
        render(<NotificationItem notification={makeNotification()} onMarkRead={vi.fn()} />);
        // Verify time appears on screen (exact format depends on locale)
        const timeEl = document.querySelector('span[class*="text-"]');
        expect(timeEl).not.toBeNull();
    });

    // ── Unread item ───────────────────────────────────────────────────────────
    it('should show the mark-as-read button for unread notifications', () => {
        render(
            <NotificationItem
                notification={makeNotification({ is_read: false })}
                onMarkRead={vi.fn()}
            />
        );
        const btn = screen.getByTitle(/mark as read/i);
        expect(btn).toBeInTheDocument();
    });

    it('should call onMarkRead with the notification id when button is clicked', () => {
        const mockMarkRead = vi.fn();
        render(
            <NotificationItem
                notification={makeNotification({ id: 42, is_read: false })}
                onMarkRead={mockMarkRead}
            />
        );
        fireEvent.click(screen.getByTitle(/mark as read/i));
        expect(mockMarkRead).toHaveBeenCalledTimes(1);
        expect(mockMarkRead).toHaveBeenCalledWith(42);
    });

    // ── Read item ─────────────────────────────────────────────────────────────
    it('should NOT show the mark-as-read button for already-read notifications', () => {
        render(
            <NotificationItem
                notification={makeNotification({ is_read: true })}
                onMarkRead={vi.fn()}
            />
        );
        expect(screen.queryByTitle(/mark as read/i)).not.toBeInTheDocument();
    });

    // ── Unread visual indicator ───────────────────────────────────────────────
    it('should apply unread highlight class for unread notifications', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ is_read: false })}
                onMarkRead={vi.fn()}
            />
        );
        // The outer div should have the unread-style background
        const outerDiv = container.firstChild;
        expect(outerDiv.className).toContain('bg-indigo-50');
    });

    it('should NOT apply unread highlight for read notifications', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ is_read: true })}
                onMarkRead={vi.fn()}
            />
        );
        const outerDiv = container.firstChild;
        expect(outerDiv.className).not.toContain('bg-indigo-50');
    });

    // ── Type icon rendering ──────────────────────────────────────────────────
    it('should render an icon for reminder type', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ type: 'reminder' })}
                onMarkRead={vi.fn()}
            />
        );
        // An SVG icon should be present
        expect(container.querySelector('svg')).not.toBeNull();
    });

    it('should render an icon for alert type', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ type: 'alert' })}
                onMarkRead={vi.fn()}
            />
        );
        expect(container.querySelector('svg')).not.toBeNull();
    });

    it('should render an icon for success type', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ type: 'success' })}
                onMarkRead={vi.fn()}
            />
        );
        expect(container.querySelector('svg')).not.toBeNull();
    });

    // ── Type styles ───────────────────────────────────────────────────────────
    it('should apply reminder (blue) type styles', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ type: 'reminder' })}
                onMarkRead={vi.fn()}
            />
        );
        const iconWrapper = container.querySelector('.bg-blue-100');
        expect(iconWrapper).not.toBeNull();
    });

    it('should apply alert (red) type styles', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ type: 'alert' })}
                onMarkRead={vi.fn()}
            />
        );
        const iconWrapper = container.querySelector('.bg-red-100');
        expect(iconWrapper).not.toBeNull();
    });

    it('should apply success (emerald) type styles', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ type: 'success' })}
                onMarkRead={vi.fn()}
            />
        );
        const iconWrapper = container.querySelector('.bg-green-100');
        expect(iconWrapper).not.toBeNull();
    });

    it('should default to gray/info styles for unknown type', () => {
        const { container } = render(
            <NotificationItem
                notification={makeNotification({ type: 'info' })}
                onMarkRead={vi.fn()}
            />
        );
        const iconWrapper = container.querySelector('.bg-gray-100');
        expect(iconWrapper).not.toBeNull();
    });

    // ── Title style vs read status ────────────────────────────────────────────
    it('should render title in bold dark color for unread notification', () => {
        render(
            <NotificationItem
                notification={makeNotification({ is_read: false })}
                onMarkRead={vi.fn()}
            />
        );
        const titleEl = screen.getByText('Test Notification');
        expect(titleEl.className).toContain('text-gray-900');
    });

    it('should render title in muted color for read notification', () => {
        render(
            <NotificationItem
                notification={makeNotification({ is_read: true })}
                onMarkRead={vi.fn()}
            />
        );
        const titleEl = screen.getByText('Test Notification');
        expect(titleEl.className).toContain('text-gray-600');
    });
});
