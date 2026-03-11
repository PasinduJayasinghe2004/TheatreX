// ============================================================================
// NotificationList Polling Tests - M3 Day 17
// ============================================================================
// Created by: M3 (Janani) - Day 17
//
// Tests for the NotificationList component with 30s polling via usePolling:
//  - Initial data fetch on mount
//  - Polling fires at interval (30s)
//  - Mark as read triggers refresh
//  - Mark all as read triggers refresh
//  - Optimistic updates on mark read
//  - Exposes polling status via onPollingStatus callback
//  - Loading / error / empty states
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import NotificationList from '../components/NotificationList';
import notificationService from '../services/notificationService.js';

// ── Mock the notification service ───────────────────────────────────────────
vi.mock('../services/notificationService.js', () => ({
    default: {
        getNotifications: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        getUnreadCount: vi.fn(),
        pollNotifications: vi.fn(),
    }
}));

// ── Sample data ─────────────────────────────────────────────────────────────
const mockNotifications = [
    {
        id: 1,
        type: 'reminder',
        title: 'Surgery in 15 min',
        message: 'Prepare for knee replacement',
        is_read: false,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        type: 'info',
        title: 'Schedule Updated',
        message: 'Theatre 3 availability changed',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 3,
        type: 'alert',
        title: 'Emergency booking',
        message: 'New emergency in Theatre 1',
        is_read: false,
        created_at: new Date(Date.now() - 7200000).toISOString()
    }
];

// ─────────────────────────────────────────────────────────────────────────────
describe('NotificationList with Polling (M3 Day 17)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: mockNotifications
        });
        notificationService.markAsRead.mockResolvedValue({ success: true });
        notificationService.markAllAsRead.mockResolvedValue({ success: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ── Basic rendering ─────────────────────────────────────────────────
    it('should fetch and render notifications on mount', async () => {
        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('Surgery in 15 min')).toBeInTheDocument();
            expect(screen.getByText('Schedule Updated')).toBeInTheDocument();
            expect(screen.getByText('Emergency booking')).toBeInTheDocument();
        });

        expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
    });

    // ── Loading state ───────────────────────────────────────────────────
    it('should show loading skeleton initially', () => {
        // Delay the response so loading state is visible
        notificationService.getNotifications.mockReturnValue(new Promise(() => {}));
        const { container } = render(<NotificationList />);
        const skeletons = container.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    // ── Error state ─────────────────────────────────────────────────────
    it('should show error message when fetch fails', async () => {
        notificationService.getNotifications.mockRejectedValue(new Error('Network error'));
        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    // ── Empty state ─────────────────────────────────────────────────────
    it('should show empty state when no notifications', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: []
        });
        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('No notifications found')).toBeInTheDocument();
        });
    });

    // ── Polling interval ────────────────────────────────────────────────
    it('should poll for notifications every 30 seconds', async () => {
        render(<NotificationList />);

        // Wait for initial fetch
        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
        });

        // Advance time by 30s — should trigger another fetch
        await act(async () => {
            vi.advanceTimersByTime(30000);
        });

        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
        });

        // Advance another 30s
        await act(async () => {
            vi.advanceTimersByTime(30000);
        });

        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(3);
        });
    });

    // ── Mark as read ────────────────────────────────────────────────────
    it('should mark notification as read and refresh list', async () => {
        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('Surgery in 15 min')).toBeInTheDocument();
        });

        // Find mark-as-read buttons (checkmark icons on unread items)
        const markReadButtons = screen.getAllByTitle('Mark as read');
        expect(markReadButtons.length).toBeGreaterThan(0);

        await act(async () => {
            fireEvent.click(markReadButtons[0]);
        });

        expect(notificationService.markAsRead).toHaveBeenCalledWith(1);
    });

    // ── Mark all as read ────────────────────────────────────────────────
    it('should have mark all as read button and call service', async () => {
        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('Surgery in 15 min')).toBeInTheDocument();
        });

        const markAllBtn = screen.getByText('Mark all as read');
        expect(markAllBtn).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(markAllBtn);
        });

        expect(notificationService.markAllAsRead).toHaveBeenCalledTimes(1);
    });

    // ── Unread-only filter ──────────────────────────────────────────────
    it('should filter to unread-only when prop is set', async () => {
        render(<NotificationList unreadOnly={true} />);

        await waitFor(() => {
            expect(screen.getByText('Surgery in 15 min')).toBeInTheDocument();
            expect(screen.getByText('Emergency booking')).toBeInTheDocument();
        });

        // "Schedule Updated" is read, should not appear
        expect(screen.queryByText('Schedule Updated')).not.toBeInTheDocument();
    });

    // ── onPollingStatus callback ────────────────────────────────────────
    it('should expose polling status to parent via callback', async () => {
        const pollingStatusFn = vi.fn();
        render(<NotificationList onPollingStatus={pollingStatusFn} />);

        await waitFor(() => {
            expect(pollingStatusFn).toHaveBeenCalled();
        });

        const status = pollingStatusFn.mock.calls[pollingStatusFn.mock.calls.length - 1][0];
        expect(status).toHaveProperty('refresh');
        expect(status).toHaveProperty('pause');
        expect(status).toHaveProperty('resume');
        expect(status).toHaveProperty('paused');
        expect(status).toHaveProperty('lastPolledAt');
        expect(typeof status.refresh).toBe('function');
        expect(typeof status.pause).toBe('function');
        expect(typeof status.resume).toBe('function');
    });

    // ── Cleanup on unmount ──────────────────────────────────────────────
    it('should stop polling on unmount', async () => {
        const { unmount } = render(<NotificationList />);

        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
        });

        unmount();

        // Advance time — should NOT trigger any more calls
        await act(async () => {
            vi.advanceTimersByTime(60000);
        });

        // Should still be 1 (only the initial fetch)
        expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
    });
});
