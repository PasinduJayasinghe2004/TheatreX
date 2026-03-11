import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
    SignIn: () => <div data-testid="clerk-signin">Clerk SignIn Component</div>,
    useUser: () => ({ isSignedIn: false, user: null }),
    useAuth: () => ({ isLoaded: true, userId: null, getToken: () => Promise.resolve('token') }),
    useClerk: () => ({ signOut: vi.fn() })
}));

describe('Login Component Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderLogin = (initialEntries = ['/login']) => {
        return render(
            <AuthProvider>
                <MemoryRouter initialEntries={initialEntries}>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );
    };

    describe('Component Rendering', () => {
        it('should render the Clerk SignIn component', () => {
            renderLogin();
            expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
        });

        it('should render the brand logo and name', () => {
            renderLogin();
            expect(screen.getByAltText('TheatreX Logo')).toBeInTheDocument();
            expect(screen.getByText('TheatreX')).toBeInTheDocument();
        });
    });

    describe('Logout Message', () => {
        it('should show logout success message when redirected with loggedOut state', async () => {
            // MemoryRouter allows passing state in initialEntries
            render(
                <AuthProvider>
                    <MemoryRouter initialEntries={[{ pathname: '/login', state: { loggedOut: true } }]}>
                        <Login />
                    </MemoryRouter>
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByText(/you have been logged out successfully/i)).toBeInTheDocument();
            });
        });
    });
});
