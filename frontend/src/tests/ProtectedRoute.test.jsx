import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}));

describe('ProtectedRoute Security Audit', () => {
    beforeEach(() => {
        mockUseAuth.mockReset();
    });

    it('shows loading state while auth status resolves', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: true });

        render(
            <MemoryRouter initialEntries={['/secure']}>
                <ProtectedRoute>
                    <div>Secure Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('redirects unauthenticated users to login', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false });

        render(
            <MemoryRouter initialEntries={['/secure']}>
                <Routes>
                    <Route
                        path="/secure"
                        element={
                            <ProtectedRoute>
                                <div>Secure Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders protected content for authenticated users', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false });

        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>Secure Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText('Secure Content')).toBeInTheDocument();
    });
});
