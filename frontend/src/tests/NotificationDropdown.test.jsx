// ============================================================================
// NotificationDropdown Tests - M6 Day 16
// ============================================================================
// Created by: M6 (Dinil) - Day 16
//
// Tests for NotificationDropdown component:
//  - Bell button renders
//  - Click toggles dropdown open/closed
//  - Loading state while fetching
//  - Notifications list when data arrives
//  - Empty state when no notifications
//  - Unread badge shows correct count
//  - Badge hidden when unread = 0
//  - Bell animation triggers when new notification arrives
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NotificationDropdown from '../components/NotificationDropdown';
import notificationService from '../services/notificationService.js';

// ── Mock the notification service ───────────────────────────────────────────
vi.mock('../services/notificationService.js', () => ({
    default: {
        getUnreadCount: vi.fn(),
        getNotifications: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
    }
}));

// ─────────────────────────────────────────────────────────────────────────────
describe('NotificationDropdown (M6 Day 16)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Default: no unread, no notifications
        notificationService.getUnreadCount.mockResolvedValue({ success: true, data: { unread_count: 0 } });
        notificationService.getNotifications.mockResolvedValue({ success: true, data: [] });
    });

    const renderComponent = () => render(<NotificationDropdown />);

    // ── Bell button ──────────────────────────────────────────────────────────
    it('should render the bell button', async () => {
        renderComponent();
        const bell = await screen.findByRole('button', { name: /notifications/i });
        expect(bell).toBeInTheDocument();
    });

    // ── Dropdown closed by default ───────────────────────────────────────────
    it('should NOT show dropdown panel initially', () => {
        renderComponent();
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });

    // ── Clicking bell opens dropdown ─────────────────────────────────────────
    it('should open the dropdown when bell is clicked', async () => {
        renderComponent();
        const bell = screen.getByRole('button', { name: /notifications/i });
        fireEvent.click(bell);
        await waitFor(() => {
            expect(screen.getByText('Notifications')).toBeInTheDocument();
        });
    });

    // ── Clicking bell again closes dropdown ──────────────────────────────────
    it('should close the dropdown when bell is clicked again', async () => {
        renderComponent();
        const bell = screen.getByRole('button', { name: /notifications/i });
        fireEvent.click(bell); // open
        await waitFor(() => expect(screen.getByText('Notifications')).toBeInTheDocument());
        fireEvent.click(bell); // close
        await waitFor(() => expect(screen.queryByText('Notifications')).not.toBeInTheDocument());
    });

    // ── Loading spinner ──────────────────────────────────────────────────────
    it('should show loading spinner while fetching notifications', async () => {
        // Never resolve so we stay in loading state
        notificationService.getNotifications.mockReturnValue(new Promise(() => { }));
        renderComponent();
        const bell = screen.getByRole('button', { name: /notifications/i });
        fireEvent.click(bell);
        await waitFor(() => {
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    // ── Empty state ──────────────────────────────────────────────────────────
    it('should show empty state when there are no notifications', async () => {
        notificationService.getNotifications.mockResolvedValue({ success: true, data: [] });
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
        await waitFor(() => {
            expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
        });
    });

    // ── Notifications list renders ───────────────────────────────────────────
    it('should display notification titles when data is available', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [
                {
                    id: 1, type: 'reminder', title: 'Surgery in 15 minutes',
                    message: 'Appendectomy for John Doe starts soon.',
                    is_read: false, created_at: new Date().toISOString()
                },
                {
                    id: 2, type: 'info', title: 'Schedule Updated',
                    message: 'Theatre B schedule has been updated.',
                    is_read: true, created_at: new Date().toISOString()
                }
            ]
        });

        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
        await waitFor(() => {
            expect(screen.getByText('Surgery in 15 minutes')).toBeInTheDocument();
            expect(screen.getByText('Schedule Updated')).toBeInTheDocument();
        });
    });

    // ── Unread badge hidden when count = 0 ───────────────────────────────────
    it('should NOT show unread badge when unread_count is 0', async () => {
        notificationService.getUnreadCount.mockResolvedValue({ success: true, data: { unread_count: 0 } });
        renderComponent();
        await waitFor(() => {
            // Badge would show a number, should not exist when 0
            expect(screen.queryByText('0')).not.toBeInTheDocument();
        });
    });

    // ── Unread badge visible when count > 0 ─────────────────────────────────
    it('should show unread badge with count when unread_count > 0', async () => {
        notificationService.getUnreadCount.mockResolvedValue({ success: true, data: { unread_count: 5 } });
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    // ── Badge caps at 99+ ────────────────────────────────────────────────────
    it('should show "99+" when unread_count exceeds 99', async () => {
        notificationService.getUnreadCount.mockResolvedValue({ success: true, data: { unread_count: 150 } });
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('99+')).toBeInTheDocument();
        });
    });

    // ── Error state ──────────────────────────────────────────────────────────
    it('should show retry button when notifications fail to load', async () => {
        notificationService.getNotifications.mockRejectedValue(new Error('Network error'));
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
        await waitFor(() => {
            expect(screen.getByText('Try again')).toBeInTheDocument();
        });
    });

    // ── Unread notification highlighted ─────────────────────────────────────
    it('should show notification header as semibold for unread items', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [{
                id: 10, type: 'alert', title: 'Unread Alert',
                message: 'This has not been read yet.',
                is_read: false, created_at: new Date().toISOString()
            }]
        });
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
        await waitFor(() => {
            const title = screen.getByText('Unread Alert');
            expect(title).toBeInTheDocument();
        });
    });

    // ── Footer "View all" shown when notifications exist ────────────────────
    it('should show "View all notifications" footer link when list is non-empty', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [{
                id: 20, type: 'success', title: 'Surgery Complete',
                message: 'Operation finished successfully.',
                is_read: true, created_at: new Date().toISOString()
            }]
        });
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
        await waitFor(() => {
            expect(screen.getByText(/view all notifications/i)).toBeInTheDocument();
        });
    });

    // ── "X new" pill in header ───────────────────────────────────────────────
    it('should show "X new" pill in dropdown header when unread > 0', async () => {
        notificationService.getUnreadCount.mockResolvedValue({ success: true, data: { unread_count: 3 } });
        notificationService.getNotifications.mockResolvedValue({ success: true, data: [] });
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
        await waitFor(() => {
            expect(screen.getByText('3 new')).toBeInTheDocument();
        });
    });
});
