import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Global mocks for Contexts used in Layout/Header/Sidebar
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { name: 'Test User', role: 'admin', email: 'test@example.com' },
        isAuthenticated: true,
        login: vi.fn().mockResolvedValue({ success: true }),
        logout: vi.fn(),
    }),
    AuthProvider: ({ children }) => children,
}));

vi.mock('../context/ThemeContext', () => ({
    useTheme: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));
