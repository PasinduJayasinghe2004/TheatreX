import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

// Mock axios
vi.mock('axios');

describe('Login Component Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderLogin = () => {
        return render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    describe('Component Rendering', () => {
        it('should render login form with email and password fields', () => {
            renderLogin();

            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        });

        it('should render link to register page', () => {
            renderLogin();

            const registerLink = screen.getByText(/don't have an account/i);
            expect(registerLink).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should show validation errors for empty fields', async () => {
            renderLogin();

            const submitButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            });
        });

        it('should validate email format', async () => {
            renderLogin();

            const emailInput = screen.getByLabelText(/email/i);
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.blur(emailInput);

            await waitFor(() => {
                expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
            });
        });
    });

    describe('Form Submission', () => {
        it('should submit form with valid credentials', async () => {
            const mockAxios = await import('axios');
            mockAxios.default.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        token: 'mock-jwt-token',
                        user: {
                            id: 1,
                            email: 'test@example.com',
                            name: 'Test User'
                        }
                    }
                }
            });

            renderLogin();

            // Fill in form
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'SecurePass123!' }
            });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockAxios.default.post).toHaveBeenCalledWith(
                    expect.stringContaining('/api/auth/login'),
                    expect.objectContaining({
                        email: 'test@example.com',
                        password: 'SecurePass123!'
                    })
                );
            });
        });

        it('should show loading state during submission', async () => {
            const mockAxios = await import('axios');
            mockAxios.default.post.mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 100))
            );

            renderLogin();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'SecurePass123!' }
            });

            const submitButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(submitButton);

            // Check for loading state
            expect(submitButton).toBeDisabled();
        });

        it('should handle invalid credentials error', async () => {
            const mockAxios = await import('axios');
            mockAxios.default.post.mockRejectedValue({
                response: {
                    status: 401,
                    data: {
                        success: false,
                        message: 'Invalid credentials'
                    }
                }
            });

            renderLogin();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'WrongPassword' }
            });

            const submitButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            });
        });

        it('should handle network errors', async () => {
            const mockAxios = await import('axios');
            mockAxios.default.post.mockRejectedValue({
                message: 'Network Error'
            });

            renderLogin();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'SecurePass123!' }
            });

            const submitButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/network error/i)).toBeInTheDocument();
            });
        });
    });

    describe('Token Storage', () => {
        it('should store JWT token in localStorage on successful login', async () => {
            const mockAxios = await import('axios');
            const mockToken = 'mock-jwt-token';

            mockAxios.default.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        token: mockToken,
                        user: { id: 1, email: 'test@example.com' }
                    }
                }
            });

            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

            renderLogin();

            // Fill and submit form
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'SecurePass123!' }
            });

            const submitButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(setItemSpy).toHaveBeenCalledWith('token', mockToken);
            });
        });
    });

    describe('Password Security', () => {
        it('should clear password field on failed login', async () => {
            const mockAxios = await import('axios');
            mockAxios.default.post.mockRejectedValue({
                response: {
                    status: 401,
                    data: { success: false, message: 'Invalid credentials' }
                }
            });

            renderLogin();

            const passwordInput = screen.getByLabelText(/password/i);
            fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } });

            const submitButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(passwordInput.value).toBe('');
            });
        });
    });
});
