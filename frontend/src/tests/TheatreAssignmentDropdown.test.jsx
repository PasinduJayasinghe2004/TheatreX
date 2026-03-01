// ============================================================================
// TheatreAssignmentDropdown Component Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 12
//
// Tests for the TheatreAssignmentDropdown component covering:
//   - Loading state while fetching unassigned surgeries
//   - Empty state when no unassigned surgeries exist
//   - Surgery list rendering
//   - Assign button behaviour and success/error feedback
//   - Close button
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TheatreAssignmentDropdown from '../components/TheatreAssignmentDropdown';
import surgeryService from '../services/surgeryService';

// ── Mock surgeryService ───────────────────────────────────────────────────────
vi.mock('../services/surgeryService');

// Mock axios
vi.mock('axios', () => {
    const mockApi = {
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        },
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn()
    };
    return {
        default: {
            create: vi.fn(() => mockApi),
            get: vi.fn(),
            post: vi.fn()
        }
    };
});

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockTheatre = {
    id: 10,
    name: 'Theatre Alpha',
    status: 'available'
};

const mockSurgeries = [
    {
        id: 201,
        surgery_type: 'Appendectomy',
        patient_name: 'Alice Jones',
        scheduled_date: '2026-03-01',
        scheduled_time: '09:00:00',
        duration_minutes: 90,
        priority: 'routine',
        surgeon_name: 'Dr. Green'
    },
    {
        id: 202,
        surgery_type: 'Knee Replacement',
        patient_name: 'Bob Smith',
        scheduled_date: '2026-03-02',
        scheduled_time: '11:00:00',
        duration_minutes: 120,
        priority: 'urgent',
        surgeon_name: null
    }
];

// ── Helper ────────────────────────────────────────────────────────────────────

const renderDropdown = (props = {}) => {
    const defaultProps = {
        theatre: mockTheatre,
        onAssigned: vi.fn(),
        onClose: vi.fn(),
        ...props
    };
    return { ...render(<TheatreAssignmentDropdown {...defaultProps} />), ...defaultProps };
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TheatreAssignmentDropdown Component Tests - M6 Day 12', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── Header ────────────────────────────────────────────────────────────────
    describe('Header', () => {
        it('should display "Assign Surgery" title', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: [] });
            renderDropdown();
            expect(screen.getByText('Assign Surgery')).toBeInTheDocument();
        });

        it('should display the target theatre name', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: [] });
            renderDropdown();
            expect(screen.getByText(/Theatre Alpha/)).toBeInTheDocument();
        });
    });

    // ── Loading State ─────────────────────────────────────────────────────────
    describe('Loading State', () => {
        it('should show loading spinner while fetching surgeries', () => {
            surgeryService.getUnassignedSurgeries.mockImplementation(() => new Promise(() => { }));
            const { container } = renderDropdown();
            expect(container.querySelector('.animate-spin')).toBeTruthy();
        });
    });

    // ── Empty State ───────────────────────────────────────────────────────────
    describe('Empty State', () => {
        it('should show "No unassigned surgeries" when the list is empty', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: [] });
            renderDropdown();
            await waitFor(() => {
                expect(screen.getByText('No unassigned surgeries')).toBeInTheDocument();
            });
        });
    });

    // ── Surgery List ──────────────────────────────────────────────────────────
    describe('Surgery List', () => {
        beforeEach(() => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: mockSurgeries });
        });

        it('should display surgery types', async () => {
            renderDropdown();
            await waitFor(() => {
                expect(screen.getByText('Appendectomy')).toBeInTheDocument();
                expect(screen.getByText('Knee Replacement')).toBeInTheDocument();
            });
        });

        it('should display patient names', async () => {
            renderDropdown();
            await waitFor(() => {
                expect(screen.getByText(/Alice Jones/)).toBeInTheDocument();
                expect(screen.getByText(/Bob Smith/)).toBeInTheDocument();
            });
        });

        it('should display priority badges for both surgeries', async () => {
            renderDropdown();
            await waitFor(() => {
                expect(screen.getByText('routine')).toBeInTheDocument();
                expect(screen.getByText('urgent')).toBeInTheDocument();
            });
        });

        it('should display surgeon name when available', async () => {
            renderDropdown();
            await waitFor(() => {
                expect(screen.getByText(/Dr\. Green/)).toBeInTheDocument();
            });
        });

        it('should render an Assign button for each surgery', async () => {
            renderDropdown();
            await waitFor(() => {
                const assignBtns = screen.getAllByText('Assign');
                expect(assignBtns).toHaveLength(2);
            });
        });
    });

    // ── Assign Action ─────────────────────────────────────────────────────────
    describe('Assign Action', () => {
        it('should call assignSurgeryToTheatre with correct IDs when Assign is clicked', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: mockSurgeries });
            surgeryService.assignSurgeryToTheatre = vi.fn().mockResolvedValue({
                success: true,
                message: 'Surgery assigned successfully'
            });

            renderDropdown();

            await waitFor(() => screen.getAllByText('Assign'));
            fireEvent.click(screen.getAllByText('Assign')[0]);

            await waitFor(() => {
                expect(surgeryService.assignSurgeryToTheatre).toHaveBeenCalledWith(201, 10);
            });
        });

        it('should call onAssigned callback after a successful assignment', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: mockSurgeries });
            surgeryService.assignSurgeryToTheatre = vi.fn().mockResolvedValue({
                success: true,
                message: 'Surgery assigned successfully'
            });

            const onAssigned = vi.fn();
            render(<TheatreAssignmentDropdown theatre={mockTheatre} onAssigned={onAssigned} onClose={vi.fn()} />);

            await waitFor(() => screen.getAllByText('Assign'));
            fireEvent.click(screen.getAllByText('Assign')[0]);

            await waitFor(() => {
                expect(onAssigned).toHaveBeenCalled();
            });
        });

        it('should show success message after a successful assignment', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: mockSurgeries });
            surgeryService.assignSurgeryToTheatre = vi.fn().mockResolvedValue({
                success: true,
                message: 'Surgery assigned successfully'
            });

            renderDropdown();
            await waitFor(() => screen.getAllByText('Assign'));
            fireEvent.click(screen.getAllByText('Assign')[0]);

            await waitFor(() => {
                expect(screen.getByText('Surgery assigned successfully')).toBeInTheDocument();
            });
        });

        it('should remove the assigned surgery from the list after assignment', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: mockSurgeries });
            surgeryService.assignSurgeryToTheatre = vi.fn().mockResolvedValue({
                success: true,
                message: 'Assigned'
            });

            renderDropdown();
            await waitFor(() => screen.getAllByText('Assign'));
            fireEvent.click(screen.getAllByText('Assign')[0]);

            await waitFor(() => {
                expect(screen.queryByText('Appendectomy')).not.toBeInTheDocument();
                // Second surgery should still be visible
                expect(screen.getByText('Knee Replacement')).toBeInTheDocument();
            });
        });

        it('should show error message when assignment fails', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: mockSurgeries });
            surgeryService.assignSurgeryToTheatre = vi.fn().mockRejectedValue(
                new Error('Theatre is not available')
            );

            renderDropdown();
            await waitFor(() => screen.getAllByText('Assign'));
            fireEvent.click(screen.getAllByText('Assign')[0]);

            await waitFor(() => {
                expect(screen.getByText('Theatre is not available')).toBeInTheDocument();
            });
        });
    });

    // ── Close Button ──────────────────────────────────────────────────────────
    describe('Close Button', () => {
        it('should call onClose when the close button is clicked', async () => {
            surgeryService.getUnassignedSurgeries.mockResolvedValue({ data: [] });
            const onClose = vi.fn();

            render(<TheatreAssignmentDropdown theatre={mockTheatre} onAssigned={vi.fn()} onClose={onClose} />);

            await waitFor(() => screen.getByText('No unassigned surgeries'));

            // Close button has aria-label="Close"
            const closeBtn = screen.getByLabelText('Close');
            fireEvent.click(closeBtn);

            expect(onClose).toHaveBeenCalled();
        });
    });
});
