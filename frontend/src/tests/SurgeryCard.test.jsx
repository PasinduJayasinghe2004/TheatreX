// ============================================================================
// Surgery Card Component Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 5
// 
// Tests for the SurgeryCard component displaying individual surgery summaries
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SurgeryCard from '../components/SurgeryCard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('SurgeryCard Component Tests', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    // Sample surgery data
    const mockSurgery = {
        id: 1,
        patient_name: 'John Doe',
        patient_age: 45,
        patient_gender: 'male',
        surgery_type: 'Appendectomy',
        scheduled_date: '2026-03-15',
        scheduled_time: '10:00:00',
        duration_minutes: 90,
        status: 'scheduled',
        priority: 'routine',
        surgeon: {
            id: 1,
            name: 'Dr. Smith',
            email: 'smith@hospital.com'
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderCard = (surgery = mockSurgery) => {
        return render(
            <BrowserRouter>
                <SurgeryCard
                    surgery={surgery}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            </BrowserRouter>
        );
    };

    // ========================================================================
    // Component Rendering Tests
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render surgery type as title', () => {
            renderCard();
            expect(screen.getByText('Appendectomy')).toBeInTheDocument();
        });

        it('should render patient name', () => {
            renderCard();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('should render surgeon name when assigned', () => {
            renderCard();
            expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
        });

        it('should render "Unassigned" when no surgeon', () => {
            const surgeryWithoutSurgeon = {
                ...mockSurgery,
                surgeon: null
            };
            renderCard(surgeryWithoutSurgeon);
            expect(screen.getByText('Unassigned')).toBeInTheDocument();
        });

        it('should render duration in minutes', () => {
            renderCard();
            expect(screen.getByText(/90 min/)).toBeInTheDocument();
        });

        it('should render View, Edit, and Delete buttons', () => {
            renderCard();
            expect(screen.getByText('View')).toBeInTheDocument();
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Status Badge Tests
    // ========================================================================
    describe('Status Badge', () => {
        it('should display scheduled status correctly', () => {
            renderCard();
            const statusBadge = screen.getByText('scheduled');
            expect(statusBadge).toBeInTheDocument();
            expect(statusBadge.className).toContain('bg-gray-100');
        });

        it('should display completed status with green styling', () => {
            const completedSurgery = { ...mockSurgery, status: 'completed' };
            renderCard(completedSurgery);
            const statusBadge = screen.getByText('completed');
            expect(statusBadge.className).toContain('bg-green-100');
        });

        it('should display in_progress status with blue styling', () => {
            const inProgressSurgery = { ...mockSurgery, status: 'in_progress' };
            renderCard(inProgressSurgery);
            const statusBadge = screen.getByText('in progress');
            expect(statusBadge.className).toContain('bg-blue-100');
        });

        it('should display cancelled status with red styling', () => {
            const cancelledSurgery = { ...mockSurgery, status: 'cancelled' };
            renderCard(cancelledSurgery);
            const statusBadge = screen.getByText('cancelled');
            expect(statusBadge.className).toContain('bg-red-100');
        });
    });

    // ========================================================================
    // Priority Badge Tests
    // ========================================================================
    describe('Priority Badge', () => {
        it('should display routine priority with blue styling', () => {
            renderCard();
            const priorityBadge = screen.getByText('routine');
            expect(priorityBadge).toBeInTheDocument();
            expect(priorityBadge.className).toContain('bg-blue-50');
        });

        it('should display urgent priority with orange styling', () => {
            const urgentSurgery = { ...mockSurgery, priority: 'urgent' };
            renderCard(urgentSurgery);
            const priorityBadge = screen.getByText('urgent');
            expect(priorityBadge.className).toContain('bg-orange-50');
        });

        it('should display emergency priority with red styling', () => {
            const emergencySurgery = { ...mockSurgery, priority: 'emergency' };
            renderCard(emergencySurgery);
            const priorityBadge = screen.getByText('emergency');
            expect(priorityBadge.className).toContain('bg-red-50');
        });
    });

    // ========================================================================
    // Button Interaction Tests
    // ========================================================================
    describe('Button Interactions', () => {
        it('should navigate to detail page when View button is clicked', () => {
            renderCard();
            const viewButton = screen.getByText('View');
            fireEvent.click(viewButton);
            expect(mockNavigate).toHaveBeenCalledWith('/surgeries/1');
        });

        it('should call onEdit with surgery ID when Edit button is clicked', () => {
            renderCard();
            const editButton = screen.getByText('Edit');
            fireEvent.click(editButton);
            expect(mockOnEdit).toHaveBeenCalledWith(1);
        });

        it('should call onDelete with surgery ID when Delete button is clicked', () => {
            renderCard();
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);
            expect(mockOnDelete).toHaveBeenCalledWith(1);
        });
    });

    // ========================================================================
    // Date and Time Formatting Tests
    // ========================================================================
    describe('Date and Time Formatting', () => {
        it('should format date correctly', () => {
            renderCard();
            // Check for formatted date (e.g., "Sun, Mar 15")
            expect(screen.getByText(/Mar/)).toBeInTheDocument();
            expect(screen.getByText(/15/)).toBeInTheDocument();
        });

        it('should handle missing scheduled_date gracefully', () => {
            const noDateSurgery = { ...mockSurgery, scheduled_date: null };
            renderCard(noDateSurgery);
            expect(screen.getByText('N/A')).toBeInTheDocument();
        });

        it('should format time correctly', () => {
            renderCard();
            // Time should be formatted (10:00 from "10:00:00")
            expect(screen.getByText(/10:00/)).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Edge Cases Tests
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle missing patient name', () => {
            const noPatientName = { ...mockSurgery, patient_name: null };
            renderCard(noPatientName);
            expect(screen.getByText('Unknown Patient')).toBeInTheDocument();
        });

        it('should handle surgery without duration', () => {
            const noDuration = { ...mockSurgery, duration_minutes: null };
            renderCard(noDuration);
            // Should not show duration or handle gracefully
            expect(screen.queryByText(/min\)/)).not.toBeInTheDocument();
        });

        it('should have correct aria-labels for accessibility', () => {
            renderCard();
            expect(screen.getByLabelText(/View surgery details for John Doe/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Edit surgery for John Doe/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Delete surgery for John Doe/i)).toBeInTheDocument();
        });
    });
});
