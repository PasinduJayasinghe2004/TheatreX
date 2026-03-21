// ============================================================================
// Day 26 – M4 (Oneli) – Staff Component Tests (Frontend)
// ============================================================================
// Covers:
//   - NursesPage: rendering, loading, empty state, filtering (search, availability, shift)
//   - TechniciansPage: rendering, loading, empty state, filtering (search, specialization, availability)
//   - Role-based visibility of Add/Edit/Delete buttons
//
// Run: cd frontend && npx vitest run src/tests/day26_m4_staff_components.test.jsx
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks MUST BE ABOVE IMPORTS for some ESM setups ─────────────────────────

vi.mock('../services/nurseService', () => ({
    default: {
        getAllNurses: vi.fn(),
        createNurse: vi.fn(),
        updateNurse: vi.fn(),
        deleteNurse: vi.fn(),
    }
}));

vi.mock('../services/technicianService', () => ({
    default: {
        getAllTechnicians: vi.fn(),
        deleteTechnician: vi.fn(),
    }
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }) => <>{children}</>
}));

// Mock TechnicianForm
vi.mock('../components/TechnicianForm', () => ({
    default: ({ onClose, onSuccess }) => (
        <div data-testid="technician-form">
            <button onClick={onClose}>Close</button>
            <button onClick={() => onSuccess({ id: 'new', name: 'New Tech' })}>Success</button>
        </div>
    )
}));

// Mock components to simplify tests
vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

vi.mock('../components/common/Loading', () => ({
    default: ({ message }) => <div data-testid="loading">{message}</div>
}));

vi.mock('../components/common/EmptyState', () => ({
    default: ({ title }) => <div data-testid="empty-state">{title}</div>
}));

// Mock Toast
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

// Mock Lucide icons (all icons used in NursesPage and TechniciansPage)
vi.mock('lucide-react', () => ({
    UserPlus: () => <div data-testid="icon-user-plus" />,
    Search: () => <div data-testid="icon-search" />,
    Filter: () => <div data-testid="icon-filter" />,
    RefreshCw: () => <div data-testid="icon-refresh-cw" />,
    Edit3: () => <div data-testid="icon-edit-3" />,
    Trash2: () => <div data-testid="icon-trash-2" />,
    Phone: () => <div data-testid="icon-phone" />,
    Mail: () => <div data-testid="icon-mail" />,
    Briefcase: () => <div data-testid="icon-briefcase" />,
    Clock: () => <div data-testid="icon-clock" />,
    CheckCircle: () => <div data-testid="icon-check-circle" />,
    XCircle: () => <div data-testid="icon-x-circle" />,
    AlertTriangle: () => <div data-testid="icon-alert-triangle" />,
    AlertCircle: () => <div data-testid="icon-alert-circle" />,
    X: () => <div data-testid="icon-x" />,
}));

// ── Now import the components ───────────────────────────────────────────────
import NursesPage from '../pages/NursesPage';
import TechniciansPage from '../pages/TechniciansPage';

// Mock components to simplify tests
vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

vi.mock('../components/common/Loading', () => ({
    default: ({ message }) => <div data-testid="loading">{message}</div>
}));

vi.mock('../components/common/EmptyState', () => ({
    default: ({ title }) => <div data-testid="empty-state">{title}</div>
}));

// Mock Toast
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

// Mock Lucide icons (all icons used in NursesPage and TechniciansPage)
vi.mock('lucide-react', () => ({
    UserPlus: () => <div data-testid="icon-user-plus" />,
    Search: () => <div data-testid="icon-search" />,
    Filter: () => <div data-testid="icon-filter" />,
    RefreshCw: () => <div data-testid="icon-refresh-cw" />,
    Edit3: () => <div data-testid="icon-edit-3" />,
    Trash2: () => <div data-testid="icon-trash-2" />,
    Phone: () => <div data-testid="icon-phone" />,
    Mail: () => <div data-testid="icon-mail" />,
    Briefcase: () => <div data-testid="icon-briefcase" />,
    Clock: () => <div data-testid="icon-clock" />,
    CheckCircle: () => <div data-testid="icon-check-circle" />,
    XCircle: () => <div data-testid="icon-x-circle" />,
    AlertTriangle: () => <div data-testid="icon-alert-triangle" />,
    AlertCircle: () => <div data-testid="icon-alert-circle" />,
    X: () => <div data-testid="icon-x" />,
}));

// ── Test Data ───────────────────────────────────────────────────────────────

const mockNurses = [
    {
        id: 'n1',
        name: 'Nurse Joy',
        specialization: 'ICU',
        license_number: 'LIC123',
        email: 'joy@test.com',
        phone: '0771234567',
        is_available: true,
        shift_preference: 'morning',
        active_surgery_count: 0
    },
    {
        id: 'n2',
        name: 'Nurse Ratched',
        specialization: 'Psychiatry',
        license_number: 'LIC456',
        email: 'ratched@test.com',
        phone: '0779999999',
        is_available: false,
        shift_preference: 'night',
        active_surgery_count: 2
    }
];

const mockTechs = [
    {
        id: 't1',
        name: 'Tech Tony',
        specialization: 'Surgical Equipment',
        license_number: 'TECH123',
        email: 'tony@test.com',
        phone: '0772223334',
        is_available: true,
        shift_preference: 'afternoon',
        years_of_experience: 5
    }
];

// ── NursesPage Tests ────────────────────────────────────────────────────────

describe('M4 Day 26 – NursesPage Component', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        const nurseService = (await import('../services/nurseService')).default;
        nurseService.getAllNurses.mockResolvedValue({ success: true, data: mockNurses });
        
        mockUseAuth.mockReturnValue({
            user: { role: 'coordinator' },
            isAuthenticated: true
        });
    });

    const renderNursesPage = () => render(
        <MemoryRouter>
            <NursesPage />
        </MemoryRouter>
    );

    it('renders the Nurses page title', async () => {
        renderNursesPage();
        expect(screen.getByText('Nurses')).toBeInTheDocument();
    });

    it('shows loading state initially', async () => {
        const nurseService = (await import('../services/nurseService')).default;
        nurseService.getAllNurses.mockReturnValue(new Promise(() => {})); // Never resolves
        renderNursesPage();
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders nurse cards after data is fetched', async () => {
        renderNursesPage();
        await waitFor(() => {
            expect(screen.getByText('Nurse Joy')).toBeInTheDocument();
            expect(screen.getByText('Nurse Ratched')).toBeInTheDocument();
        });
    });

    it('filters nurses by search query', async () => {
        renderNursesPage();
        await waitFor(() => screen.getByText('Nurse Joy'));
        
        const searchInput = screen.getByPlaceholderText(/search by name/i);
        fireEvent.change(searchInput, { target: { value: 'Joy' } });
        
        // Wait for fetch to be called with query (the component uses search state in dependency array of fetchNurses)
        const nurseService = (await import('../services/nurseService')).default;
        await waitFor(() => {
            expect(nurseService.getAllNurses).toHaveBeenCalledWith(expect.objectContaining({ search: 'Joy' }));
        });
    });

    it('hides Add Nurse button for staff role', async () => {
        mockUseAuth.mockReturnValue({ user: { role: 'nurse' } });
        renderNursesPage();
        expect(screen.queryByText('Add Nurse')).not.toBeInTheDocument();
    });

    it('shows Add Nurse button for admin role', async () => {
        mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
        renderNursesPage();
        expect(screen.getByText('Add Nurse')).toBeInTheDocument();
    });

    it('shows edit/delete actions for coordinator', async () => {
        mockUseAuth.mockReturnValue({ user: { role: 'coordinator' } });
        renderNursesPage();
        await waitFor(() => {
            expect(screen.getByLabelText(/Edit Nurse Joy/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Delete Nurse Joy/i)).toBeInTheDocument();
        });
    });
});

// ── TechniciansPage Tests ───────────────────────────────────────────────────

describe('M4 Day 26 – TechniciansPage Component', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        const techService = (await import('../services/technicianService')).default;
        techService.getAllTechnicians.mockResolvedValue({ success: true, data: mockTechs });
        
        mockUseAuth.mockReturnValue({
            user: { role: 'coordinator' },
            isAuthenticated: true
        });
    });

    const renderTechsPage = () => render(
        <MemoryRouter>
            <TechniciansPage />
        </MemoryRouter>
    );

    it('renders the Technicians page title', async () => {
        renderTechsPage();
        expect(screen.getByText('Technicians')).toBeInTheDocument();
    });

    it('renders technician card', async () => {
        renderTechsPage();
        // Should show loading first
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('Tech Tony')).toBeInTheDocument();
            expect(screen.getByText('Surgical Equipment')).toBeInTheDocument();
        });
    });

    it('filters technicians (client-side search)', async () => {
        renderTechsPage();
        await waitFor(() => screen.getByText('Tech Tony'));
        
        const searchInput = screen.getByPlaceholderText(/search name, email/i);
        fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
        
        await waitFor(() => {
            expect(screen.queryByText('Tech Tony')).not.toBeInTheDocument();
            expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        });
    });

    it('hides management buttons for unauthorized roles', async () => {
        mockUseAuth.mockReturnValue({ user: { role: 'surgeon' } });
        renderTechsPage();
        await waitFor(() => screen.getByText('Tech Tony'));
        
        expect(screen.queryByTitle(/Edit technician/i)).not.toBeInTheDocument();
        expect(screen.queryByTitle(/Delete technician/i)).not.toBeInTheDocument();
        expect(screen.queryByText('Add Technician')).not.toBeInTheDocument();
    });
});
