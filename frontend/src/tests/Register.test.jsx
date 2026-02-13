import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';

// Mock axios
vi.mock('axios');

describe('Register Component Tests', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    const renderRegister = () => {
        return render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
    };

    describe('Component Rendering', () => {
        it('should render register form with all fields', () => {
            renderRegister();

            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
        });

        it('should render link to login page', () => {
            renderRegister();

            const loginLink = screen.getByText(/already have an account/i);
            expect(loginLink).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should show validation errors for empty fields', async () => {
            renderRegister();

            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/name is required/i)).toBeInTheDocument();
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            });
        });

        it('should validate email format', async () => {
            renderRegister();

            const emailInput = screen.getByLabelText(/email/i);
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.blur(emailInput);

            await waitFor(() => {
                expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
            });
        });

        it('should validate password strength', async () => {
            renderRegister();

            const passwordInput = screen.getByLabelText(/password/i);
            fireEvent.change(passwordInput, { target: { value: '123' } });
            fireEvent.blur(passwordInput);

            await waitFor(() => {
                expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
            });
        });
    });

    describe('Form Submission', () => {
        it('should submit form with valid data', async () => {
            const mockAxios = await import('axios');
            mockAxios.default.post.mockResolvedValue({
                data: {
                    success: true,
                    message: 'User registered successfully'
                }
            });

            renderRegister();

            // Fill in form
            fireEvent.change(screen.getByLabelText(/name/i), {
                target: { value: 'Test User' }
            });
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'SecurePass123!' }
            });
            fireEvent.change(screen.getByLabelText(/role/i), {
                target: { value: 'coordinator' }
            });
            fireEvent.change(screen.getByLabelText(/phone/i), {
                target: { value: '0771234567' }
            });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockAxios.default.post).toHaveBeenCalledWith(
                    expect.stringContaining('/api/auth/register'),
                    expect.objectContaining({
                        email: 'test@example.com'
                    })
                );
            });
        });

        it('should show loading state during submission', async () => {
            const mockAxios = await import('axios');
            mockAxios.default.post.mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 100))
            );

            renderRegister();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/name/i), {
                target: { value: 'Test User' }
            });
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'SecurePass123!' }
            });

            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            // Check for loading state
            expect(submitButton).toBeDisabled();
        });

        it('should handle registration errors', async () => {
            const mockAxios = await import('axios');
            mockAxios.default.post.mockRejectedValue({
                response: {
                    data: {
                        success: false,
                        message: 'Email already exists'
                    }
                }
            });

            renderRegister();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'existing@example.com' }
            });

            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
            });
        });
    });

    // Token storage test removed as registration doesn't return token in this implementation
});
