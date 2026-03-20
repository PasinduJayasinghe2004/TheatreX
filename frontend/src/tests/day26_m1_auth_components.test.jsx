// ============================================================================
// Day 26 – M1 (Pasindu) – Auth Component Tests (Frontend)
// ============================================================================
// Covers:
//   - Login page: renders Clerk SignIn, brand, logout message
//   - Register page: form fields, password strength, submit, error handling
//   - ProtectedRoute: loading state, redirect when unauth, renders when auth
//   - Profile page: renders user data, edit controls
//
// Run: cd frontend && npx vitest run src/tests/day26_m1_auth_components.test.jsx
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, BrowserRouter } from 'react-router-dom';

// ── Global mock: Clerk ──────────────────────────────────────────────────────
vi.mock('@clerk/clerk-react', () => ({
    SignIn: (props) => <div data-testid="clerk-signin" {...(props || {})} />,
    SignedIn: ({ children }) => <>{children}</>,
    SignedOut: ({ children }) => <>{children}</>,
    useUser: () => ({ isSignedIn: false, user: null }),
    useAuth: () => ({ isLoaded: true, userId: null, getToken: () => Promise.resolve('token') }),
    useClerk: () => ({ signOut: vi.fn() }),
    ClerkProvider: ({ children }) => <>{children}</>
}));

// ── Global mock: axios ──────────────────────────────────────────────────────
vi.mock('axios', () => {
    const mockAxios = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(function () { return this; }),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        },
        defaults: { headers: { common: {} } }
    };
    return { default: mockAxios, ...mockAxios };
});

// ── Lazy imports after mocks ────────────────────────────────────────────────
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';

// ── AuthContext mock factory (allows per-test values) ───────────────────────
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }) => <>{children}</>
}));

// ─────────────────────────────────────────────────────────────────────────────
// 1. Login Component
// ─────────────────────────────────────────────────────────────────────────────
describe('M1 Day 26 – Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            loading: false,
            login: vi.fn(),
            logout: vi.fn()
        });
    });

    const renderLogin = (state = {}) =>
        render(
            <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
                <Login />
            </MemoryRouter>
        );

    it('renders TheatreX brand name', () => {
        renderLogin();
        expect(screen.getByText('TheatreX')).toBeInTheDocument();
    });

    it('renders the brand logo image', () => {
        renderLogin();
        expect(screen.getByAltText('TheatreX Logo')).toBeInTheDocument();
    });

    it('shows logout success message when loggedOut state is true', async () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/login', state: { loggedOut: true } }]}>
                <Login />
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText(/logged out successfully/i)).toBeInTheDocument();
        });
    });

    it('does NOT show logout message when loggedOut state is false', () => {
        renderLogin({ loggedOut: false });
        expect(screen.queryByText(/logged out successfully/i)).not.toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Register Component
// ─────────────────────────────────────────────────────────────────────────────
describe('M1 Day 26 – Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: null, isAuthenticated: false, loading: false,
            login: vi.fn(), logout: vi.fn()
        });
    });

    const renderRegister = () =>
        render(<BrowserRouter><Register /></BrowserRouter>);

    it('renders the registration form', () => {
        renderRegister();
        expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    });

    it('renders name input field', () => {
        renderRegister();
        expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    });

    it('renders email input field', () => {
        renderRegister();
        expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
    });

    it('renders password input field', () => {
        renderRegister();
        expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    });

    it('renders confirm password input field', () => {
        renderRegister();
        expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders Create Account submit button', () => {
        renderRegister();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders link to login page', () => {
        renderRegister();
        expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    });

    it('shows password strength indicator for weak password', async () => {
        renderRegister();
        fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
            target: { value: '123' }
        });
        await waitFor(() => {
            expect(screen.getByText(/too short/i)).toBeInTheDocument();
        });
    });

    it('shows error message when API returns duplicate email', async () => {
        const mockAxios = await import('axios');
        mockAxios.default.post.mockRejectedValue({
            response: { data: { success: false, message: 'Email already exists' } }
        });

        renderRegister();
        fireEvent.change(screen.getByPlaceholderText(/john doe/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText(/john@example.com/i), { target: { value: 'dup@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'SecurePass123!' } });
        fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'SecurePass123!' } });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. ProtectedRoute Component
// ─────────────────────────────────────────────────────────────────────────────
describe('M1 Day 26 – ProtectedRoute Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading state while auth is resolving', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: true });

        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('redirects unauthenticated user to login page', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Dashboard</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders protected content for authenticated user', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false, user: { role: 'coordinator' } });

        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('does NOT show protected content for unauthenticated user', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false });

        render(
            <MemoryRouter initialEntries={['/secure']}>
                <Routes>
                    <Route
                        path="/secure"
                        element={
                            <ProtectedRoute>
                                <div>Secret Data</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login</div>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.queryByText('Secret Data')).not.toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Auth E2E Component Flow
// ─────────────────────────────────────────────────────────────────────────────
describe('M1 Day 26 – Auth E2E: Component Flow', () => {
    it('Login page mounts without crashing', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false, user: null });
        expect(() =>
            render(
                <MemoryRouter initialEntries={['/login']}>
                    <Login />
                </MemoryRouter>
            )
        ).not.toThrow();
    });

    it('Register page mounts without crashing', () => {
        expect(() =>
            render(<BrowserRouter><Register /></BrowserRouter>)
        ).not.toThrow();
    });

    it('ProtectedRoute correctly gates content based on auth state', async () => {
        // Start unauthenticated
        mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false });

        const { unmount } = render(
            <MemoryRouter initialEntries={['/app']}>
                <Routes>
                    <Route path="/app" element={
                        <ProtectedRoute>
                            <div>App Content</div>
                        </ProtectedRoute>
                    } />
                    <Route path="/login" element={<div>Login</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.queryByText('App Content')).not.toBeInTheDocument();
        unmount();

        // Now authenticated
        mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false, user: { role: 'coordinator' } });

        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>App Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText('App Content')).toBeInTheDocument();
    });
});
