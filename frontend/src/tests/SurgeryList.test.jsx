// ============================================================================
// Surgery List Page Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 5
// 
// Tests for the SurgeryList page that displays all surgeries
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SurgeryList from '../pages/SurgeryList';
import surgeryService from '../services/surgeryService';

// Mock the surgery service
vi.mock('../services/surgeryService');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('SurgeryList Page Tests', () => {
    const mockSurgeries = [
        {
            id: 1,
            patient_name: 'John Doe',
            surgery_type: 'Appendectomy',
            scheduled_date: '2026-03-15',
            scheduled_time: '10:00:00',
            duration_minutes: 90,
            status: 'scheduled',
            priority: 'routine',
            surgeon: { id: 1, name: 'Dr. Smith' }
        },
        {
            id: 2,
            patient_name: 'Jane Smith',
            surgery_type: 'Knee Replacement',
            scheduled_date: '2026-03-16',
            scheduled_time: '14:00:00',
            duration_minutes: 120,
            status: 'scheduled',
            priority: 'urgent',
            surgeon: { id: 2, name: 'Dr. Johnson' }
        },
        {
            id: 3,
            patient_name: 'Bob Wilson',
            surgery_type: 'Heart Bypass',
            scheduled_date: '2026-03-17',
            scheduled_time: '08:00:00',
            duration_minutes: 240,
            status: 'in_progress',
            priority: 'emergency',
            surgeon: null
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderList = () => {
        return render(
            <BrowserRouter>
                <SurgeryList />
            </BrowserRouter>
        );
    };

    // ========================================================================
    // Loading State Tests
    // ========================================================================
    describe('Loading State', () => {
        it('should show loading indicator while fetching data', async () => {
            surgeryService.getAllSurgeries.mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );
            const { container } = renderList();
            // Check for loading indicator (Loading component with animate-spin class)
            expect(container.querySelector('.animate-spin')).toBeTruthy();
        });
    });

    // ========================================================================
    // Success State Tests
    // ========================================================================
    describe('Success State', () => {
        beforeEach(() => {
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: true,
                data: mockSurgeries
            });
        });

        it('should display page title', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Surgeries')).toBeInTheDocument();
            });
        });

        it('should display surgery count', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('3 surgeries found')).toBeInTheDocument();
            });
        });

        it('should display all surgery cards', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
                expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
            });
        });

        it('should display surgery types', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Appendectomy')).toBeInTheDocument();
                expect(screen.getByText('Knee Replacement')).toBeInTheDocument();
                expect(screen.getByText('Heart Bypass')).toBeInTheDocument();
            });
        });

        it('should have Create Surgery button', async () => {
            renderList();
            await waitFor(() => {
                expect(screen.getByText('Create Surgery')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Empty State Tests
    // ========================================================================
    describe('Empty State', () => {
        it('should show empty state when no surgeries exist', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: true,
                data: []
            });

            renderList();

            await waitFor(() => {
                expect(screen.getByText('No Surgeries Found')).toBeInTheDocument();
                expect(screen.getByText('Create First Surgery')).toBeInTheDocument();
            });
        });

        it('should show correct count for single surgery', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: true,
                data: [mockSurgeries[0]]
            });

            renderList();

            await waitFor(() => {
                expect(screen.getByText('1 surgery found')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Error State Tests
    // ========================================================================
    describe('Error State', () => {
        it('should show error message when API fails', async () => {
            surgeryService.getAllSurgeries.mockRejectedValue(
                new Error('Network error')
            );

            renderList();

            await waitFor(() => {
                expect(screen.getByText('Error Loading Surgeries')).toBeInTheDocument();
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });

        it('should show Try Again button on error', async () => {
            surgeryService.getAllSurgeries.mockRejectedValue(
                new Error('Server error')
            );

            renderList();

            await waitFor(() => {
                expect(screen.getByText('Try Again')).toBeInTheDocument();
            });
        });

        it('should handle API returning success: false', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: false,
                message: 'Failed to load surgeries'
            });

            renderList();

            await waitFor(() => {
                expect(screen.getByText('Error Loading Surgeries')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Navigation Tests
    // ========================================================================
    describe('Navigation', () => {
        beforeEach(() => {
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: true,
                data: mockSurgeries
            });
        });

        it('should call navigate when Create Surgery button is clicked', async () => {
            renderList();

            await waitFor(() => {
                expect(screen.getByText('Create Surgery')).toBeInTheDocument();
            });

            const createButton = screen.getByText('Create Surgery');
            createButton.click();

            expect(mockNavigate).toHaveBeenCalledWith('/surgeries/new');
        });
    });

    // ========================================================================
    // API Call Tests
    // ========================================================================
    describe('API Calls', () => {
        it('should call getAllSurgeries on mount', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: true,
                data: []
            });

            renderList();

            await waitFor(() => {
                expect(surgeryService.getAllSurgeries).toHaveBeenCalledTimes(1);
            });
        });
    });
});
