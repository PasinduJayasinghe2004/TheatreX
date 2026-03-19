import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

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

// Import component after mocks
import Register from '../pages/Register';

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

            // Check for page title
            expect(screen.getByText(/TheatreX/i)).toBeInTheDocument();
            expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
            
            // Check for form elements by placeholder
            expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
            
            // Check for submit button
            expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        });

        it('should render link to login page', () => {
            renderRegister();

            const loginLink = screen.getByText(/already have an account/i);
            expect(loginLink).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should show password strength indicator', async () => {
            renderRegister();

            const passwordInput = screen.getByPlaceholderText(/enter password/i);
            fireEvent.change(passwordInput, { target: { value: '123' } });

            await waitFor(() => {
                expect(screen.getByText(/too short/i)).toBeInTheDocument();
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

            // Fill in form using placeholders
            fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
                target: { value: 'Test User' }
            });
            fireEvent.change(screen.getByPlaceholderText(/john@example.com/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
                target: { value: 'SecurePass123!' }
            });
            fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
                target: { value: 'SecurePass123!' }
            });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /create account/i });
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

            // Fill all required fields
            fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
                target: { value: 'Test User' }
            });
            fireEvent.change(screen.getByPlaceholderText(/john@example.com/i), {
                target: { value: 'existing@example.com' }
            });
            fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
                target: { value: 'SecurePass123!' }
            });
            fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
                target: { value: 'SecurePass123!' }
            });

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
            });
        });
    });
});
