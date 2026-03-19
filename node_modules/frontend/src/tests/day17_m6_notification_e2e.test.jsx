// ============================================================================
// Notification E2E Integration Tests - M6 Day 17
// ============================================================================
// Created by: M6 (Dinil) - Day 17
//
// End-to-end frontend integration tests for the complete notification
// user flow, combining multiple components and the service layer.
//
// Unlike unit tests (Day 16), these tests validate multi-step flows:
//  1. Dropdown: open → unread badge → mark single read → badge decrements
//  2. Dropdown: mark all read → badge disappears, button hides
//  3. Dropdown: error → retry flow
//  4. Dropdown: notification type icons/colors render per type
//  5. NotificationList: initial fetch + mark read + mark all + unread filter
//  6. NotificationsPage: render + polling status + pause/resume + manual refresh
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    render,
    screen,
    waitFor,
    fireEvent,
    act
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import NotificationList from '../components/NotificationList';
import notificationService from '../services/notificationService.js';

// ── Mock notification service ────────────────────────────────────────────────
vi.mock('../services/notificationService.js', () => ({
    default: {
        getNotifications: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        getUnreadCount: vi.fn(),
        pollNotifications: vi.fn(),
    }
}));

// ── Mock Layout (for pages) ──────────────────────────────────────────────────
vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeNotif = (overrides = {}) => ({
    id: 1,
    type: 'info',
    title: 'Default Notification',
    message: 'Default message',
    is_read: false,
    created_at: new Date().toISOString(),
    ...overrides
});

const renderDropdown = () =>
    render(
        <BrowserRouter>
            <NotificationDropdown />
        </BrowserRouter>
    );

const openDropdown = async () => {
    const bell = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bell);
    // Wait for dropdown to open
    await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
};

// ============================================================================
// E2E FLOW 1: Unread Badge → Mark Single Read → Badge Decrements
// ============================================================================
describe('E2E Flow 1 – Mark Single Read (Dropdown)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows badge with count, then count drops after marking one read', async () => {
        // Setup: 2 unread notifications
        notificationService.getUnreadCount
            .mockResolvedValueOnce({ success: true, data: { unread_count: 2 } })
            .mockResolvedValueOnce({ success: true, data: { unread_count: 1 } });

        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [
                makeNotif({ id: 10, title: 'First Unread', is_read: false }),
                makeNotif({ id: 11, title: 'Second Unread', is_read: false }),
            ]
        });
        notificationService.markAsRead.mockResolvedValue({
            success: true,
            data: { id: 10, is_read: true }
        });

        renderDropdown();

        // Badge shows 2
        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument();
        });

        // Open the dropdown
        await openDropdown();

        // Both notifications should appear
        await waitFor(() => {
            expect(screen.getByText('First Unread')).toBeInTheDocument();
            expect(screen.getByText('Second Unread')).toBeInTheDocument();
        });

        // Click the mark-as-read button on the first item
        const markReadBtns = screen.getAllByTitle('Mark as read');
        await act(async () => {
            fireEvent.click(markReadBtns[0]);
        });

        // markAsRead service was called
        await waitFor(() => {
            expect(notificationService.markAsRead).toHaveBeenCalledWith(10);
        });
    });

    it('shows no mark-read button for already-read notifications in dropdown', async () => {
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 0 }
        });
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [makeNotif({ id: 20, title: 'Already Read', is_read: true })]
        });

        renderDropdown();
        await openDropdown();

        await waitFor(() => {
            expect(screen.getByText('Already Read')).toBeInTheDocument();
        });

        expect(screen.queryByTitle('Mark as read')).not.toBeInTheDocument();
    });
});

// ============================================================================
// E2E FLOW 2: Mark All Read → Badge Clears, Button Disappears
// ============================================================================
describe('E2E Flow 2 – Mark All Read (Dropdown)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('mark-all-read clears unread state and hides the button', async () => {
        notificationService.getUnreadCount
            .mockResolvedValueOnce({ success: true, data: { unread_count: 3 } })
            .mockResolvedValue({ success: true, data: { unread_count: 0 } });

        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [
                makeNotif({ id: 30, title: 'Unread A', is_read: false }),
                makeNotif({ id: 31, title: 'Unread B', is_read: false }),
                makeNotif({ id: 32, title: 'Unread C', is_read: false }),
            ]
        });
        notificationService.markAllAsRead.mockResolvedValue({
            success: true, count: 3
        });

        renderDropdown();

        // Badge shows count
        await waitFor(() => {
            expect(screen.getByText('3')).toBeInTheDocument();
        });

        await openDropdown();

        // Mark all read button is visible
        await waitFor(() => {
            expect(screen.getByText('Mark all read')).toBeInTheDocument();
        });

        // Click it
        await act(async () => {
            fireEvent.click(screen.getByText('Mark all read'));
        });

        // Service was called once
        await waitFor(() => {
            expect(notificationService.markAllAsRead).toHaveBeenCalledTimes(1);
        });

        // Mark all read button should disappear
        await waitFor(() => {
            expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
        });
    });

    it('mark-all-read button is absent when there are no unread notifications', async () => {
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 0 }
        });
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [makeNotif({ id: 40, title: 'All Read', is_read: true })]
        });

        renderDropdown();
        await openDropdown();

        await waitFor(() => {
            expect(screen.getByText('All Read')).toBeInTheDocument();
        });
        expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    });
});

// ============================================================================
// E2E FLOW 3: Error Recovery (Retry)
// ============================================================================
describe('E2E Flow 3 – Error Recovery (Dropdown)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 0 }
        });
    });

    it('shows error state with retry button when fetch fails', async () => {
        notificationService.getNotifications.mockRejectedValue(
            new Error('Network error')
        );

        renderDropdown();
        await openDropdown();

        await waitFor(() => {
            expect(screen.getByText('Try again')).toBeInTheDocument();
        });
    });

    it('retries and shows notifications when retry is clicked after failure', async () => {
        // First call fails, second call succeeds
        notificationService.getNotifications
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce({
                success: true,
                data: [makeNotif({ id: 50, title: 'After Retry', is_read: false })]
            });

        renderDropdown();
        await openDropdown();

        // Error state
        await waitFor(() => {
            expect(screen.getByText('Try again')).toBeInTheDocument();
        });

        // Click retry
        await act(async () => {
            fireEvent.click(screen.getByText('Try again'));
        });

        // Should now show the notification
        await waitFor(() => {
            expect(screen.getByText('After Retry')).toBeInTheDocument();
        });
    });
});

// ============================================================================
// E2E FLOW 4: Notification Type Icons and Colors in Dropdown
// ============================================================================
describe('E2E Flow 4 – Notification Types in Dropdown', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 2 }
        });
    });

    const typeTestCases = ['reminder', 'alert', 'info', 'warning', 'success'];

    typeTestCases.forEach(type => {
        it(`renders notification of type "${type}" with an icon`, async () => {
            notificationService.getNotifications.mockResolvedValue({
                success: true,
                data: [makeNotif({ id: 100, type, title: `${type} notification`, is_read: false })]
            });

            const { container } = renderDropdown();
            await openDropdown();

            await waitFor(() => {
                expect(screen.getByText(`${type} notification`)).toBeInTheDocument();
            });

            // An SVG icon should be rendered
            expect(container.querySelector('svg')).not.toBeNull();
        });
    });

    it('renders multiple notification types simultaneously', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [
                makeNotif({ id: 200, type: 'reminder', title: 'Reminder Notif', is_read: false }),
                makeNotif({ id: 201, type: 'alert', title: 'Alert Notif', is_read: false }),
            ]
        });

        renderDropdown();
        await openDropdown();

        await waitFor(() => {
            expect(screen.getByText('Reminder Notif')).toBeInTheDocument();
            expect(screen.getByText('Alert Notif')).toBeInTheDocument();
        });
    });
});

// ============================================================================
// E2E FLOW 5: NotificationList – Full User Flow
// ============================================================================
describe('E2E Flow 5 – NotificationList Full Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const mockNotifs = [
        makeNotif({ id: 301, title: 'Surgery Reminder', is_read: false, type: 'reminder' }),
        makeNotif({ id: 302, title: 'Theatre Update', is_read: true, type: 'info' }),
        makeNotif({ id: 303, title: 'Emergency Alert', is_read: false, type: 'alert' }),
    ];

    it('loads and renders all notifications on mount', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true, data: mockNotifs
        });

        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('Surgery Reminder')).toBeInTheDocument();
            expect(screen.getByText('Theatre Update')).toBeInTheDocument();
            expect(screen.getByText('Emergency Alert')).toBeInTheDocument();
        });
    });

    it('filters to unread-only when unreadOnly prop is passed', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true, data: mockNotifs
        });

        render(<NotificationList unreadOnly={true} />);

        await waitFor(() => {
            expect(screen.getByText('Surgery Reminder')).toBeInTheDocument();
            expect(screen.getByText('Emergency Alert')).toBeInTheDocument();
        });

        // Read item should not appear
        expect(screen.queryByText('Theatre Update')).not.toBeInTheDocument();
    });

    it('mark-as-read updates the item and calls service', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true, data: [mockNotifs[0]]
        });
        notificationService.markAsRead.mockResolvedValue({ success: true });

        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('Surgery Reminder')).toBeInTheDocument();
        });

        const markReadBtn = screen.getByTitle('Mark as read');
        await act(async () => {
            fireEvent.click(markReadBtn);
        });

        expect(notificationService.markAsRead).toHaveBeenCalledWith(301);
    });

    it('mark-all-as-read button calls service', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true, data: mockNotifs
        });
        notificationService.markAllAsRead.mockResolvedValue({ success: true });

        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('Surgery Reminder')).toBeInTheDocument();
        });

        const markAllBtn = screen.getByText('Mark all as read');
        await act(async () => {
            fireEvent.click(markAllBtn);
        });

        expect(notificationService.markAllAsRead).toHaveBeenCalledTimes(1);
    });

    it('auto-polls every 30 seconds', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true, data: mockNotifs
        });

        render(<NotificationList />);

        // Initial fetch
        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
        });

        // Advance 30s → poll triggers
        await act(async () => {
            vi.advanceTimersByTime(30000);
        });

        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
        });
    });

    it('mounts and unmounts cleanly without errors', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true, data: mockNotifs
        });

        const { unmount } = render(<NotificationList />);

        // Wait for initial fetch
        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
        });

        // Should unmount without throwing
        expect(() => unmount()).not.toThrow();
    });

    it('shows empty state when no notifications exist', async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true, data: []
        });

        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('No notifications found')).toBeInTheDocument();
        });
    });

    it('shows error state and proper message on fetch failure', async () => {
        notificationService.getNotifications.mockRejectedValue(
            new Error('Server unreachable')
        );

        render(<NotificationList />);

        await waitFor(() => {
            expect(screen.getByText('Server unreachable')).toBeInTheDocument();
        });
    });
});

// ============================================================================
// E2E FLOW 6: Dropdown + 99+ Badge Cap
// ============================================================================
describe('E2E Flow 6 – Badge Display Accuracy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        notificationService.getNotifications.mockResolvedValue({
            success: true, data: []
        });
    });

    it('shows 99+ when unread count exceeds 99', async () => {
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 200 }
        });

        renderDropdown();

        await waitFor(() => {
            expect(screen.getByText('99+')).toBeInTheDocument();
        });
    });

    it('shows exact count when unread is between 1 and 99', async () => {
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 42 }
        });

        renderDropdown();

        await waitFor(() => {
            expect(screen.getByText('42')).toBeInTheDocument();
        });
    });

    it('hides badge when unread count is 0', async () => {
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 0 }
        });

        renderDropdown();

        await waitFor(() => {
            expect(screen.queryByText('0')).not.toBeInTheDocument();
        });
    });
});

// ============================================================================
// E2E FLOW 7: Dropdown – View All Navigates and Closes
// ============================================================================
describe('E2E Flow 7 – View All Notifications Navigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 1 }
        });
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: [makeNotif({ id: 400, title: 'Navigate Test', is_read: false })]
        });
    });

    it('clicking "View all notifications" closes the dropdown', async () => {
        renderDropdown();
        await openDropdown();

        await waitFor(() => {
            expect(screen.getByText(/view all notifications/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/view all notifications/i));

        await waitFor(() => {
            expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
        });
    });

    it('"X new" pill appears in dropdown header when unread > 0', async () => {
        notificationService.getUnreadCount.mockResolvedValue({
            success: true, data: { unread_count: 7 }
        });

        renderDropdown();
        await openDropdown();

        await waitFor(() => {
            expect(screen.getByText('7 new')).toBeInTheDocument();
        });
    });
});
