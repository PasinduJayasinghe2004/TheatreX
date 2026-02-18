// ============================================================================
// Surgery Form Component Tests - Modal UI Design
// ============================================================================
// Created by: M6 (Dinil) - Day 5
// 
// Tests for the new modal-style SurgeryForm component
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React, { createContext } from 'react';
import axios from 'axios';

// Mock the AuthContext module
vi.mock('../context/AuthContext', () => {
    const MockContext = React.createContext(null);
    return {
        AuthContext: MockContext,
        useAuth: () => ({
            token: 'mock-jwt-token',
            user: { role: 'coordinator' }
        }),
        AuthProvider: ({ children }) => children
    };
});

// Mock axios with interceptors
vi.mock('axios', () => {
    const mockAxios = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(function() { return this; }),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        },
        defaults: {
            headers: {
                common: {}
            }
        }
    };
    return {
        default: mockAxios,
        ...mockAxios
    };
});

// Import components after mocks
import SurgeryForm from '../components/SurgeryForm';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('SurgeryForm Modal Component Tests', () => {
    const mockToken = 'mock-jwt-token';
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();

    const mockSurgeons = [
        { id: 1, name: 'Dr. Smith' },
        { id: 2, name: 'Dr. Johnson' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock surgeons API call
        axios.get.mockResolvedValue({
            data: {
                success: true,
                data: mockSurgeons
            }
        });
    });

    const renderForm = (props = {}) => {
        return render(
            <BrowserRouter>
                <SurgeryForm
                    onSuccess={props.onSuccess}
                    onCancel={props.onCancel}
                    isModal={props.isModal !== undefined ? props.isModal : true}
                />
            </BrowserRouter>
        );
    };

    // ========================================================================
    // Modal Rendering Tests
    // ========================================================================
    describe('Modal Rendering', () => {
        it('should render modal with title', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('Schedule Surgery')).toBeInTheDocument();
            });
        });

        it('should render close button', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByLabelText('Close')).toBeInTheDocument();
            });
        });

        it('should render Patient Details section', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('Patient Details')).toBeInTheDocument();
            });
        });

        it('should render procedure name input', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByPlaceholderText('e.g. Appendectomy')).toBeInTheDocument();
            });
        });

        it('should render Confirm Schedule button', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Confirm Schedule/i })).toBeInTheDocument();
            });
        });

        it('should render Cancel button', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Patient Selection Tests
    // ========================================================================
    describe('Patient Selection', () => {
        it('should render patient dropdown', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('-- Select Patient --')).toBeInTheDocument();
            });
        });

        it('should render new patient name input', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();
            });
        });

        it('should have existing patients in dropdown', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('John Smith')).toBeInTheDocument();
                expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Staff Dropdown Tests
    // ========================================================================
    describe('Staff Dropdowns', () => {
        it('should fetch surgeons on mount', async () => {
            renderForm();

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith(
                    'http://localhost:5000/api/surgeries/surgeons',
                    expect.objectContaining({
                        headers: { Authorization: `Bearer ${mockToken}` }
                    })
                );
            });
        });

        it('should display surgeon dropdown', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('Select Surgeon')).toBeInTheDocument();
            });
        });

        it('should display nurse dropdown', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('Select Nurse')).toBeInTheDocument();
            });
        });

        it('should display anaesthetist dropdown', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('Select Anaesthetist')).toBeInTheDocument();
            });
        });

        it('should display theatre dropdown', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('Select Theatre')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Scheduling Fields Tests
    // ========================================================================
    describe('Scheduling Fields', () => {
        it('should render date input', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
            });
        });

        it('should render start time input', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument();
            });
        });

        it('should render duration input with default value', async () => {
            renderForm();
            await waitFor(() => {
                const durationInput = screen.getByLabelText(/Duration/i);
                expect(durationInput).toBeInTheDocument();
                expect(durationInput.value).toBe('60');
            });
        });
    });

    // ========================================================================
    // Form Validation Tests
    // ========================================================================
    describe('Form Validation', () => {
        it('should show error when procedure name is missing', async () => {
            renderForm();

            await waitFor(async () => {
                const submitButton = screen.getByRole('button', { name: /Confirm Schedule/i });
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/Please enter procedure name/i)).toBeInTheDocument();
            });
        });

        it('should show error when patient info is missing', async () => {
            renderForm();

            await waitFor(async () => {
                // Fill procedure name only
                fireEvent.change(screen.getByPlaceholderText('e.g. Appendectomy'), { 
                    target: { value: 'Appendectomy' } 
                });

                const submitButton = screen.getByRole('button', { name: /Confirm Schedule/i });
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/Please select a patient or enter patient name/i)).toBeInTheDocument();
            });
        });

        it('should show error when date/time is missing', async () => {
            renderForm();

            await waitFor(async () => {
                // Fill procedure name and patient name
                fireEvent.change(screen.getByPlaceholderText('e.g. Appendectomy'), { 
                    target: { value: 'Appendectomy' } 
                });
                fireEvent.change(screen.getByPlaceholderText('Enter Name'), { 
                    target: { value: 'Test Patient' } 
                });

                const submitButton = screen.getByRole('button', { name: /Confirm Schedule/i });
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/Please select date and time/i)).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Form Submission Tests
    // ========================================================================
    describe('Form Submission', () => {
        const fillValidForm = async () => {
            await waitFor(() => {
                // Fill procedure name
                fireEvent.change(screen.getByPlaceholderText('e.g. Appendectomy'), { 
                    target: { value: 'Appendectomy' } 
                });
                
                // Fill patient name
                fireEvent.change(screen.getByPlaceholderText('Enter Name'), { 
                    target: { value: 'Test Patient' } 
                });
                
                // Fill date
                const dateInput = screen.getByLabelText(/Date/i);
                fireEvent.change(dateInput, { target: { value: '2026-03-15' } });
                
                // Fill time
                const timeInput = screen.getByLabelText(/Start Time/i);
                fireEvent.change(timeInput, { target: { value: '10:00' } });
            });
        };

        it('should submit form with valid data', async () => {
            axios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    data: { id: 1, surgery_type: 'Appendectomy' }
                }
            });

            renderForm();
            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /Confirm Schedule/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    'http://localhost:5000/api/surgeries',
                    expect.objectContaining({
                        surgery_type: 'Appendectomy',
                        patient_name: 'Test Patient'
                    }),
                    expect.objectContaining({
                        headers: { Authorization: `Bearer ${mockToken}` }
                    })
                );
            });
        });

        it('should show success message on successful submission', async () => {
            axios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    data: { id: 1 }
                }
            });

            renderForm();
            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /Confirm Schedule/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Surgery scheduled successfully/i)).toBeInTheDocument();
            });
        });

        it('should show error message on API failure', async () => {
            axios.post.mockRejectedValueOnce({
                response: {
                    data: {
                        message: 'Server error'
                    }
                }
            });

            renderForm();
            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /Confirm Schedule/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Server error|Error scheduling surgery/i)).toBeInTheDocument();
            });
        });

        it('should call onSuccess callback after successful submission', async () => {
            axios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    data: { id: 1 }
                }
            });

            renderForm({ onSuccess: mockOnSuccess });
            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /Confirm Schedule/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
            });
        });

        it('should disable button during submission', async () => {
            axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

            renderForm();
            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /Confirm Schedule/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Scheduling.../i })).toBeDisabled();
            });
        });
    });

    // ========================================================================
    // Cancel and Close Tests
    // ========================================================================
    describe('Cancel and Close Actions', () => {
        it('should call onCancel when Cancel button is clicked', async () => {
            renderForm({ onCancel: mockOnCancel });

            await waitFor(() => {
                const cancelButton = screen.getByRole('button', { name: /Cancel/i });
                fireEvent.click(cancelButton);
            });

            expect(mockOnCancel).toHaveBeenCalled();
        });

        it('should call onCancel when close button is clicked', async () => {
            renderForm({ onCancel: mockOnCancel });

            await waitFor(() => {
                const closeButton = screen.getByLabelText('Close');
                fireEvent.click(closeButton);
            });

            expect(mockOnCancel).toHaveBeenCalled();
        });

        it('should navigate back when Cancel clicked without onCancel prop', async () => {
            renderForm();

            await waitFor(() => {
                const cancelButton = screen.getByRole('button', { name: /Cancel/i });
                fireEvent.click(cancelButton);
            });

            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });
    });

    // ========================================================================
    // Full Page Mode Tests
    // ========================================================================
    describe('Full Page Mode', () => {
        it('should render as full page when isModal is false', async () => {
            renderForm({ isModal: false });
            
            await waitFor(() => {
                expect(screen.getByText('Schedule Surgery')).toBeInTheDocument();
            });
        });
    });
});
