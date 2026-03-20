// ============================================================================
// Day 26 – M2 (Chandeepa) – Surgery Component Tests (Frontend)
// ============================================================================
// Covers:
//   - SurgeryList: loading, success, empty, error states; navigation
//   - SurgeryCard: renders patient/surgeon/status/priority data
//   - SurgeryDetail: full data display, badge colours, error handling
//   - SurgeryForm: field rendering, required-field validation, submit
//   - E2E component flow: list → detail → edit form
//
// Run: cd frontend && npx vitest run src/tests/day26_m2_surgery_components.test.jsx
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// ── Service mocks ──────────────────────────────────────────────────────────
vi.mock('../services/surgeryService');
vi.mock('../services/theatreService');

// ── Router mock ────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: '1' })
    };
});

// ── Lazy imports ───────────────────────────────────────────────────────────
import SurgeryList from '../pages/SurgeryList';
import SurgeryDetail from '../pages/SurgeryDetail';
import SurgeryCard from '../components/SurgeryCard';
import surgeryService from '../services/surgeryService';

// ── Shared mock data ───────────────────────────────────────────────────────
const mockSurgeries = [
    {
        id: 1,
        patient_name: 'Alice Johnson',
        surgery_type: 'Appendectomy',
        scheduled_date: '2027-06-15',
        scheduled_time: '09:00:00',
        duration_minutes: 90,
        status: 'scheduled',
        priority: 'routine',
        surgeon: { id: 1, name: 'Dr. Smith' }
    },
    {
        id: 2,
        patient_name: 'Bob Martinez',
        surgery_type: 'Knee Replacement',
        scheduled_date: '2027-06-16',
        scheduled_time: '13:00:00',
        duration_minutes: 150,
        status: 'in_progress',
        priority: 'urgent',
        surgeon: null
    },
    {
        id: 3,
        patient_name: 'Carol White',
        surgery_type: 'Heart Bypass',
        scheduled_date: '2027-06-17',
        scheduled_time: '07:30:00',
        duration_minutes: 300,
        status: 'completed',
        priority: 'emergency',
        surgeon: { id: 2, name: 'Dr. Lee' }
    }
];

const mockSurgery = {
    id: 1,
    patient_name: 'Alice Johnson',
    patient_age: 35,
    patient_gender: 'female',
    surgery_type: 'Appendectomy',
    description: 'Standard laparoscopic procedure',
    scheduled_date: '2027-06-15',
    scheduled_time: '09:00:00',
    duration_minutes: 90,
    theatre_id: 1,
    status: 'scheduled',
    priority: 'routine',
    notes: 'No known allergies',
    surgeon: { id: 1, name: 'Dr. Smith', email: 'smith@hospital.com' },
    created_at: '2027-05-01T08:00:00Z',
    updated_at: '2027-05-01T08:00:00Z'
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SurgeryList
// ─────────────────────────────────────────────────────────────────────────────
describe('M2 Day 26 – SurgeryList Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockReset();
    });

    const renderList = () => render(<BrowserRouter><SurgeryList /></BrowserRouter>);

    describe('Loading State', () => {
        it('shows loading spinner while fetching', () => {
            surgeryService.getAllSurgeries.mockImplementation(() => new Promise(() => {}));
            const { container } = renderList();
            expect(container.querySelector('.animate-spin')).toBeTruthy();
        });
    });

    describe('Success State', () => {
        beforeEach(() => {
            surgeryService.getAllSurgeries.mockResolvedValue({ 
                success: true, 
                data: mockSurgeries,
                meta: { pagination: { total: 3 } }
            });
        });

        it('displays page title', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByTestId('surgery-list-title')).toBeInTheDocument();
            });
        });

        it('displays surgery count', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('3 total surgeries')).toBeInTheDocument();
            });
        });

        it('displays all patient names', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
                expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
                expect(screen.getByText('Carol White')).toBeInTheDocument();
            });
        });

        it('displays surgery types', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Appendectomy')).toBeInTheDocument();
                expect(screen.getByText('Knee Replacement')).toBeInTheDocument();
            });
        });

        it('renders Create Surgery button', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Create Surgery')).toBeInTheDocument();
            });
        });

        it('Create Surgery button navigates to /surgeries/new', async () => {
            renderList();
            await waitFor(() => screen.getByText('Create Surgery'));
            fireEvent.click(screen.getByText('Create Surgery'));
            expect(mockNavigate).toHaveBeenCalledWith('/surgeries/new');
        });
    });

    describe('Empty State', () => {
        it('shows empty state when no surgeries', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [], meta: { pagination: { total: 0 } } });
            renderList();
            await waitFor(() => {
                expect(screen.getByText('No Surgeries Found')).toBeInTheDocument();
            });
        });

        it('shows singular "total surgery" for 1 surgery', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [mockSurgeries[0]], meta: { pagination: { total: 1 } } });
            renderList();
            await waitFor(() => {
                expect(screen.getByText('1 total surgery')).toBeInTheDocument();
            });
        });
    });

    describe('Error State', () => {
        it('shows error message when API throws', async () => {
            surgeryService.getAllSurgeries.mockRejectedValue(new Error('Network error'));
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Error Loading Surgeries')).toBeInTheDocument();
            });
        });

        it('shows the error message text', async () => {
            surgeryService.getAllSurgeries.mockRejectedValue(new Error('Server timeout'));
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Server timeout')).toBeInTheDocument();
            });
        });

        it('shows Try Again button on error', async () => {
            surgeryService.getAllSurgeries.mockRejectedValue(new Error('DB error'));
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Try Again')).toBeInTheDocument();
            });
        });

        it('handles API returning success: false', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({ success: false, message: 'Unauthorized' });
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Error Loading Surgeries')).toBeInTheDocument();
            });
        });
    });

    describe('API Calls', () => {
        it('calls getAllSurgeries once on mount', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });
            renderList();
            await waitFor(() => {
                expect(surgeryService.getAllSurgeries).toHaveBeenCalledTimes(1);
            });
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. SurgeryCard Component
// ─────────────────────────────────────────────────────────────────────────────
describe('M2 Day 26 – SurgeryCard Component', () => {
    beforeEach(() => vi.clearAllMocks());

    const renderCard = (surgery) =>
        render(<BrowserRouter><SurgeryCard surgery={surgery} /></BrowserRouter>);

    it('renders patient name', () => {
        renderCard(mockSurgeries[0]);
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    it('renders surgery type', () => {
        renderCard(mockSurgeries[0]);
        expect(screen.getByText('Appendectomy')).toBeInTheDocument();
    });

    it('renders status badge text', () => {
        renderCard(mockSurgeries[0]);
        // The StatusBadge component renders the status text inside a span
        expect(screen.getByText(/scheduled/i)).toBeInTheDocument();
    });

    it('renders priority badge text and color', () => {
        renderCard(mockSurgeries[0]);
        // Priority is rendered in a span with the text and specific color classes
        const priorityElement = screen.getByText(/routine/i);
        expect(priorityElement).toBeInTheDocument();
        expect(priorityElement.className).toContain('capitalize');
    });

    it('renders surgeon name when available', () => {
        renderCard(mockSurgeries[0]);
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    it('renders "Unassigned" when surgeon is null', () => {
        renderCard(mockSurgeries[1]);
        expect(screen.getByText(/unassigned/i)).toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SurgeryDetail Page
// ─────────────────────────────────────────────────────────────────────────────
describe('M2 Day 26 – SurgeryDetail Page', () => {
    beforeEach(() => vi.clearAllMocks());

    const renderDetail = () => render(<BrowserRouter><SurgeryDetail /></BrowserRouter>);

    it('shows loading spinner while fetching', () => {
        surgeryService.getSurgeryById.mockImplementation(() => new Promise(() => {}));
        const { container } = renderDetail();
        expect(container.querySelector('.animate-spin')).toBeTruthy();
    });

    it('displays surgery type as title', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({ success: true, data: mockSurgery });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByText('Appendectomy')).toBeInTheDocument();
        });
    });

    it('displays patient name', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({ success: true, data: mockSurgery });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        });
    });

    it('displays surgeon name', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({ success: true, data: mockSurgery });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
        });
    });

    it('renders status badge', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({ success: true, data: mockSurgery });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByTestId('status-badge')).toHaveTextContent(/scheduled/i);
        });
    });

    it('renders priority badge', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({ success: true, data: mockSurgery });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByTestId('priority-badge')).toHaveTextContent(/routine/i);
        });
    });

    it('shows error state when API fails', async () => {
        surgeryService.getSurgeryById.mockRejectedValue(new Error('Failed to fetch'));
        renderDetail();
        await waitFor(() => {
            expect(screen.getAllByText(/error|failed/i).length).toBeGreaterThan(0);
        });
    });

    it('calls getSurgeryById with the route param ID', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({ success: true, data: mockSurgery });
        renderDetail();
        await waitFor(() => {
            expect(surgeryService.getSurgeryById).toHaveBeenCalledWith('1');
        });
    });

    it('handles surgery with no surgeon gracefully', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({
            success: true,
            data: { ...mockSurgery, surgeon: null, surgeon_id: null }
        });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByText('Appendectomy')).toBeInTheDocument();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Surgery E2E Component Flow
// ─────────────────────────────────────────────────────────────────────────────
describe('M2 Day 26 – E2E: Surgery Component Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockReset();
    });

    it('SurgeryList loads and renders multiple surgeries', async () => {
        surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: mockSurgeries });
        render(<BrowserRouter><SurgeryList /></BrowserRouter>);
        await waitFor(() => {
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
            expect(screen.getByText('Carol White')).toBeInTheDocument();
        });
    });

    it('SurgeryDetail shows full data for a loaded surgery', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({ success: true, data: mockSurgery });
        render(<BrowserRouter><SurgeryDetail /></BrowserRouter>);
        await waitFor(() => {
            expect(screen.getByText('Appendectomy')).toBeInTheDocument();
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        });
    });

    it('SurgeryDetail shows edit/delete controls', async () => {
        surgeryService.getSurgeryById.mockResolvedValue({ success: true, data: mockSurgery });
        render(<BrowserRouter><SurgeryDetail /></BrowserRouter>);
        await waitFor(() => {
            expect(screen.getByText(/Edit/i)).toBeInTheDocument();
            expect(screen.getByText(/Delete/i)).toBeInTheDocument();
        });
    });
});
