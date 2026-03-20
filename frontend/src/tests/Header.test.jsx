import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Header from '../components/Header';

vi.mock('../components/NotificationDropdown', () => ({
    default: () => <div data-testid="notification-dropdown" />,
}));

vi.mock('../components/RoleGuard', () => ({
    default: ({ children }) => <>{children}</>,
}));

const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
};

const renderHeader = () =>
    render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <Header />
            <LocationDisplay />
        </MemoryRouter>
    );

describe('Header Search', () => {
    it('opens search input when search button is clicked', () => {
        renderHeader();

        expect(screen.queryByPlaceholderText('Search pages...')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Search' }));

        expect(screen.getByPlaceholderText('Search pages...')).toBeInTheDocument();
    });

    it('navigates to matched page on search submit', () => {
        renderHeader();

        fireEvent.click(screen.getByRole('button', { name: 'Search' }));
        fireEvent.change(screen.getByPlaceholderText('Search pages...'), {
            target: { value: 'surgeries' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Go' }));

        expect(screen.getByTestId('location-display')).toHaveTextContent('/surgeries');
    });
});
