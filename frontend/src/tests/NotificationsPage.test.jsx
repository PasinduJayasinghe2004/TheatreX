// ============================================================================
// NotificationsPage Tests - M3 Day 17
// ============================================================================
// Created by: M3 (Janani) - Day 17
//
// Tests for the NotificationsPage with auto-refresh controls:
//  - Page header renders
//  - Polling status bar renders (active indicator, last updated)
//  - Pause / Resume button toggles
//  - Manual Refresh button works
//  - NotificationList is rendered inside the page
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationsPage from '../pages/NotificationsPage';
import notificationService from '../services/notificationService.js';

// ── Mock Layout ─────────────────────────────────────────────────────────────
vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

// ── Mock notification service ───────────────────────────────────────────────
vi.mock('../services/notificationService.js', () => ({
    default: {
        getNotifications: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        getUnreadCount: vi.fn(),
        pollNotifications: vi.fn(),
    }
}));

const mockNotifications = [
    {
        id: 1,
        type: 'info',
        title: 'Test Notification',
        message: 'Test message',
        is_read: false,
        created_at: new Date().toISOString()
    }
];

// ─────────────────────────────────────────────────────────────────────────────
describe('NotificationsPage with Polling Controls (M3 Day 17)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: mockNotifications
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderPage = () => render(
        <BrowserRouter>
            <NotificationsPage />
        </BrowserRouter>
    );

    // ── Page header ─────────────────────────────────────────────────────
    it('should render the page title and subtitle', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Notifications')).toBeInTheDocument();
            expect(screen.getByText(/stay updated/i)).toBeInTheDocument();
        });
    });

    // ── Polling status bar ──────────────────────────────────────────────
    it('should render polling status bar with auto-refresh indicator', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/auto-refresh every 30s/i)).toBeInTheDocument();
        });
    });

    // ── Last updated indicator ──────────────────────────────────────────
    it('should show last updated time', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/last updated/i)).toBeInTheDocument();
        });
    });

    // ── Pause button ────────────────────────────────────────────────────
    it('should show Pause button and toggle to Resume on click', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Pause')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Pause'));
        });

        await waitFor(() => {
            expect(screen.getByText('Resume')).toBeInTheDocument();
            expect(screen.getByText(/auto-refresh paused/i)).toBeInTheDocument();
        });
    });

    // ── Resume button ───────────────────────────────────────────────────
    it('should resume polling when Resume is clicked', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Pause')).toBeInTheDocument();
        });

        // Pause
        await act(async () => {
            fireEvent.click(screen.getByText('Pause'));
        });

        await waitFor(() => {
            expect(screen.getByText('Resume')).toBeInTheDocument();
        });

        // Resume
        await act(async () => {
            fireEvent.click(screen.getByText('Resume'));
        });

        await waitFor(() => {
            expect(screen.getByText('Pause')).toBeInTheDocument();
            expect(screen.getByText(/auto-refresh every 30s/i)).toBeInTheDocument();
        });
    });

    // ── Refresh button ──────────────────────────────────────────────────
    it('should have a manual Refresh button', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Refresh')).toBeInTheDocument();
        });
    });

    it('should trigger a fresh fetch when Refresh is clicked', async () => {
        renderPage();

        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Refresh'));
        });

        await waitFor(() => {
            expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
        });
    });

    // ── All Notifications section ───────────────────────────────────────
    it('should render the All Notifications section heading', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('All Notifications')).toBeInTheDocument();
        });
    });

    // ── Notification data renders ───────────────────────────────────────
    it('should render notification data from the service', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Test Notification')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });
    });
});
