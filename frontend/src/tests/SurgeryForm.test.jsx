// ============================================================================
// Surgery Form Component Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 5
// 
// Tests for the SurgeryForm component used for creating new surgeries
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SurgeryForm from '../components/SurgeryForm';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('SurgeryForm Component Tests', () => {
    const mockToken = 'mock-jwt-token';
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();

    const mockSurgeons = [
        { id: 1, name: 'Dr. Smith', email: 'smith@hospital.com' },
        { id: 2, name: 'Dr. Johnson', email: 'johnson@hospital.com' }
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
            <AuthContext.Provider value={{ token: mockToken, user: { role: 'coordinator' } }}>
                <BrowserRouter>
                    <SurgeryForm
                        onSuccess={props.onSuccess}
                        onCancel={props.onCancel}
                    />
                </BrowserRouter>
            </AuthContext.Provider>
        );
    };

    // ========================================================================
    // Component Rendering Tests
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render page title', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText('Schedule New Surgery')).toBeInTheDocument();
            });
        });

        it('should render Patient Information section', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByText(/Patient Information/)).toBeInTheDocument();
            });
        });

        it('should render patient input fields', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByPlaceholderText('Enter patient ID')).toBeInTheDocument();
            });
        });

        it('should render surgery type input', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByLabelText(/Surgery Type/i)).toBeInTheDocument();
            });
        });

        it('should render scheduled date input', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByLabelText(/Scheduled Date/i)).toBeInTheDocument();
            });
        });

        it('should render scheduled time input', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByLabelText(/Scheduled Time/i)).toBeInTheDocument();
            });
        });

        it('should render duration input', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument();
            });
        });

        it('should render submit button', async () => {
            renderForm();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Schedule Surgery|Create Surgery|Submit/i })).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Surgeon Dropdown Tests
    // ========================================================================
    describe('Surgeon Dropdown', () => {
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

        it('should display surgeons in dropdown after loading', async () => {
            renderForm();

            await waitFor(() => {
                const surgeonSelect = screen.getByLabelText(/Surgeon/i);
                expect(surgeonSelect).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Form Input Tests
    // ========================================================================
    describe('Form Input', () => {
        it('should update patient name on input', async () => {
            renderForm();

            await waitFor(() => {
                const patientNameInput = screen.getByPlaceholderText(/patient name/i);
                fireEvent.change(patientNameInput, { target: { value: 'Test Patient' } });
                expect(patientNameInput.value).toBe('Test Patient');
            });
        });

        it('should update surgery type on input', async () => {
            renderForm();

            await waitFor(() => {
                const surgeryTypeInput = screen.getByLabelText(/Surgery Type/i);
                fireEvent.change(surgeryTypeInput, { target: { value: 'Appendectomy' } });
                expect(surgeryTypeInput.value).toBe('Appendectomy');
            });
        });

        it('should have status defaulted to scheduled', async () => {
            renderForm();

            await waitFor(() => {
                const statusSelect = screen.getByLabelText(/Status/i);
                expect(statusSelect.value).toBe('scheduled');
            });
        });

        it('should have priority defaulted to routine', async () => {
            renderForm();

            await waitFor(() => {
                const prioritySelect = screen.getByLabelText(/Priority/i);
                expect(prioritySelect.value).toBe('routine');
            });
        });
    });

    // ========================================================================
    // Form Validation Tests
    // ========================================================================
    describe('Form Validation', () => {
        it('should show error when required fields are missing', async () => {
            renderForm();

            await waitFor(async () => {
                const submitButton = screen.getByRole('button', { name: /Schedule Surgery|Create Surgery|Submit/i });
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
            });
        });

        it('should show error when patient info is missing', async () => {
            renderForm();

            await waitFor(async () => {
                // Fill only non-patient fields
                fireEvent.change(screen.getByLabelText(/Surgery Type/i), { target: { value: 'Appendectomy' } });
                fireEvent.change(screen.getByLabelText(/Scheduled Date/i), { target: { value: '2026-03-15' } });
                fireEvent.change(screen.getByLabelText(/Scheduled Time/i), { target: { value: '10:00' } });
                fireEvent.change(screen.getByLabelText(/Duration/i), { target: { value: '90' } });

                const submitButton = screen.getByRole('button', { name: /Schedule Surgery|Create Surgery|Submit/i });
                fireEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/patient information/i)).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Form Submission Tests
    // ========================================================================
    describe('Form Submission', () => {
        const validFormData = {
            patient_name: 'John Doe',
            patient_age: '45',
            patient_gender: 'male',
            surgery_type: 'Appendectomy',
            scheduled_date: '2026-03-15',
            scheduled_time: '10:00',
            duration_minutes: '90'
        };

        const fillForm = async () => {
            await waitFor(() => {
                const patientNameInput = screen.getByPlaceholderText(/patient name/i);
                fireEvent.change(patientNameInput, { target: { value: validFormData.patient_name } });
            });

            fireEvent.change(screen.getByPlaceholderText(/patient age/i) || screen.getByLabelText(/age/i), {
                target: { value: validFormData.patient_age }
            });

            const genderSelect = screen.getByLabelText(/Gender/i);
            fireEvent.change(genderSelect, { target: { value: validFormData.patient_gender } });

            fireEvent.change(screen.getByLabelText(/Surgery Type/i), {
                target: { value: validFormData.surgery_type }
            });

            fireEvent.change(screen.getByLabelText(/Scheduled Date/i), {
                target: { value: validFormData.scheduled_date }
            });

            fireEvent.change(screen.getByLabelText(/Scheduled Time/i), {
                target: { value: validFormData.scheduled_time }
            });

            fireEvent.change(screen.getByLabelText(/Duration/i), {
                target: { value: validFormData.duration_minutes }
            });
        };

        it('should submit form with valid data', async () => {
            axios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    data: { id: 1, ...validFormData }
                }
            });

            renderForm();
            await fillForm();

            const submitButton = screen.getByRole('button', { name: /Schedule Surgery|Create Surgery|Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    'http://localhost:5000/api/surgeries',
                    expect.objectContaining({
                        surgery_type: validFormData.surgery_type
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
                    data: { id: 1, ...validFormData }
                }
            });

            renderForm();
            await fillForm();

            const submitButton = screen.getByRole('button', { name: /Schedule Surgery|Create Surgery|Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Surgery created successfully/i)).toBeInTheDocument();
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
            await fillForm();

            const submitButton = screen.getByRole('button', { name: /Schedule Surgery|Create Surgery|Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Server error|Error creating surgery/i)).toBeInTheDocument();
            });
        });

        it('should call onSuccess callback after successful submission', async () => {
            axios.post.mockResolvedValueOnce({
                data: {
                    success: true,
                    data: { id: 1, ...validFormData }
                }
            });

            renderForm({ onSuccess: mockOnSuccess });
            await fillForm();

            const submitButton = screen.getByRole('button', { name: /Schedule Surgery|Create Surgery|Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
            });
        });
    });

    // ========================================================================
    // Priority and Status Options Tests
    // ========================================================================
    describe('Priority and Status Options', () => {
        it('should have all status options available', async () => {
            renderForm();

            await waitFor(() => {
                const statusSelect = screen.getByLabelText(/Status/i);
                expect(statusSelect).toContainHTML('scheduled');
            });
        });

        it('should have all priority options available', async () => {
            renderForm();

            await waitFor(() => {
                const prioritySelect = screen.getByLabelText(/Priority/i);
                expect(prioritySelect).toContainHTML('routine');
            });
        });
    });
});
