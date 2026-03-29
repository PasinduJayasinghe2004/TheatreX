/**
 * M5 Day 26 - Patient & Notification Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import patientService from '../services/patientService';
import notificationService from '../services/notificationService';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../services/patientService', () => ({
    default: { getAllPatients: vi.fn().mockResolvedValue({ success: true, data: [] }), deletePatient: vi.fn() }
}));

vi.mock('../services/notificationService', () => ({
    default: {
        getNotifications: vi.fn().mockResolvedValue({ success: true, data: [] }),
        getUnreadCount: vi.fn().mockResolvedValue({ success: true, count: 0 }),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        cleanupNotifications: vi.fn(),
        pollNotifications: vi.fn(),
    }
}));

const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }) => <>{children}</>
}));

// Mock child components
vi.mock('../components/SearchBar', () => ({
    default: ({ value, onChange, placeholder }) => (
        <input data-testid="search-bar" value={value} onChange={onChange} placeholder={placeholder} />
    )
}));

vi.mock('../components/FilterTabs', () => ({
    default: ({ onTabChange, tabs }) => (
        <div data-testid="filter-tabs">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => onTabChange(tab.id)}>{tab.label}</button>
            ))}
        </div>
    )
}));

vi.mock('lucide-react', () => ({
    Search: () => <span />, Filter: () => <span />, UserPlus: () => <span />,
    Edit3: () => <span />, Trash2: () => <span />, Phone: () => <span />,
    Mail: () => <span />, MapPin: () => <span />, Heart: () => <span />,
    Droplets: () => <span />, AlertTriangle: () => <span />, XCircle: () => <span />,
    CheckCircle: () => <span />, Bell: () => <span />, Trash: () => <span />,
    Clock: () => <span />, RefreshCcw: () => <span />, Pause: () => <span />,
    Play: () => <span />, ChevronRight: () => <span />, Calendar: () => <span />,
    Info: () => <span />, RefreshCw: () => <span />
}));

vi.mock('../components/Layout', () => ({ default: ({ children }) => <div data-testid="layout">{children}</div> }));
vi.mock('../components/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../components/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../components/DashboardChatBot', () => ({ default: () => <div data-testid="chatbot">Chatbot</div> }));
vi.mock('../components/common/Loading', () => ({ default: () => <div data-testid="loading">Loading...</div> }));
vi.mock('../components/common/EmptyState', () => ({ default: () => <div data-testid="empty-state">Empty</div> }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

vi.mock('../components/NotificationList', () => ({
    default: () => {
        /*
        useEffect(() => {
            if (onPollingStatus && !hasCalled.current) {
                onPollingStatus({
                    paused: false,
                    lastPolledAt: null,
                    refresh: vi.fn(),
                    pause: vi.fn(),
                    resume: vi.fn()
                });
                hasCalled.current = true;
            }
        }, [onPollingStatus]);
        */
        return <div data-testid="notification-list">Mock List</div>;
    }
}));

// ── Imports ────────────────────────────────────────────────────────────────

import PatientsPage from '../pages/PatientsPage';
import NotificationsPage from '../pages/NotificationsPage';

const mockPatients = [{ id: 1, name: 'John Doe', age: 45, gender: 'male', blood_type: 'A+', phone: '0771112223', email: 'john@test.com', is_active: true }];
const mockNotifications = [{ id: 1, title: 'Notif 1', message: 'Msg 1', type: 'info', is_read: false, created_at: new Date().toISOString() }];

// ── Tests ──────────────────────────────────────────────────────────────────

describe('M5 Day 26 – Patient & Notification Components', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        patientService.getAllPatients.mockResolvedValue({ success: true, data: mockPatients });
        notificationService.getNotifications.mockResolvedValue({ success: true, data: mockNotifications });
        notificationService.getUnreadCount.mockResolvedValue({ success: true, count: 1 });
        mockUseAuth.mockReturnValue({ user: { role: 'admin' }, isAuthenticated: true });
    });

    it('PatientsPage: renders patient data', async () => {
        render(<BrowserRouter><PatientsPage /></BrowserRouter>);
        await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());
        expect(await screen.findByText('John Doe')).toBeInTheDocument();
    });

    it('NotificationsPage: renders (no layout)', async () => {
        render(<BrowserRouter><NotificationsPage /></BrowserRouter>);
        expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    });
});
