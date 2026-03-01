// ============================================================================
// Anaesthetists Page Tests - M3 Day 14
// ============================================================================
// Created by: M3 (Janani) - Day 14
//
// Tests for the AnaesthetistsPage component:
// - Renders loading skeleton
// - Displays anaesthetist list after fetch
// - Search filtering works
// - Edit modal opens with correct data
// - Delete modal opens and confirms
// - Stats strip shows correct counts
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnaesthetistsPage from '../pages/AnaesthetistsPage';
import anaesthetistService from '../services/anaesthetistService';

// Mock the anaesthetist service
vi.mock('../services/anaesthetistService');

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { role: 'admin', name: 'Test Admin' },
        isAuthenticated: true,
    }),
}));

// Mock Layout to just render children
vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

describe('AnaesthetistsPage Tests (Day 14)', () => {
    const mockAnaesthetists = [
        {
            id: 1,
            name: 'Dr. Alice Anaes',
            email: 'alice@hospital.com',
            phone: '+94771234567',
            specialization: 'General Anaesthesia',
            license_number: 'LIC-001',
            years_of_experience: 8,
            qualification: 'MBBS, MD',
            is_available: true,
            shift_preference: 'morning',
            is_active: true,
        },
        {
            id: 2,
            name: 'Dr. Bob Anaes',
            email: 'bob@hospital.com',
            phone: '+94771112222',
            specialization: 'Pediatric Anaesthesia',
            license_number: 'LIC-002',
            years_of_experience: 12,
            qualification: 'MBBS, MD, Fellowship',
            is_available: false,
            shift_preference: 'night',
            is_active: true,
        },
        {
            id: 3,
            name: 'Dr. Carol Anaes',
            email: 'carol@hospital.com',
            phone: '+94773334444',
            specialization: 'Cardiac Anaesthesia',
            license_number: 'LIC-003',
            years_of_experience: 5,
            qualification: 'MBBS',
            is_available: true,
            shift_preference: 'flexible',
            is_active: true,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderPage = () =>
        render(
            <BrowserRouter>
                <AnaesthetistsPage />
            </BrowserRouter>
        );

    // ── Loading State ────────────────────────────────────────────────────────
    it('should show loading skeletons while fetching', () => {
        anaesthetistService.getAllAnaesthetists.mockReturnValue(new Promise(() => { })); // never resolves
        renderPage();
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    // ── Success State ────────────────────────────────────────────────────────
    it('should display anaesthetist cards after successful fetch', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Dr. Alice Anaes')).toBeInTheDocument();
            expect(screen.getByText('Dr. Bob Anaes')).toBeInTheDocument();
            expect(screen.getByText('Dr. Carol Anaes')).toBeInTheDocument();
        });
    });

    // ── Stats Strip ──────────────────────────────────────────────────────────
    it('should display correct stats (total, available, unavailable)', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Total Anaesthetists')).toBeInTheDocument();
            expect(screen.getAllByText('Available')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Unavailable')[0]).toBeInTheDocument();
            // 3 total, 2 available, 1 unavailable
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument();
        });
    });

    // ── Search Filtering ─────────────────────────────────────────────────────
    it('should filter anaesthetists by search text', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Dr. Alice Anaes')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/search by name/i);
        fireEvent.change(searchInput, { target: { value: 'Alice' } });

        expect(screen.getByText('Dr. Alice Anaes')).toBeInTheDocument();
        expect(screen.queryByText('Dr. Bob Anaes')).not.toBeInTheDocument();
        expect(screen.queryByText('Dr. Carol Anaes')).not.toBeInTheDocument();
    });

    // ── Error State ──────────────────────────────────────────────────────────
    it('should show error message on fetch failure', async () => {
        anaesthetistService.getAllAnaesthetists.mockRejectedValue(
            new Error('Network error')
        );

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
            expect(screen.getByText('Try again')).toBeInTheDocument();
        });
    });

    // ── Empty State ──────────────────────────────────────────────────────────
    it('should show empty state when no anaesthetists', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: [],
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText(/no anaesthetists found/i)).toBeInTheDocument();
        });
    });

    // ── Add Button (Admin) ──────────────────────────────────────────────────
    it('should show Add Anaesthetist button for admin', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Add Anaesthetist')).toBeInTheDocument();
        });
    });

    // ── Create Modal ─────────────────────────────────────────────────────────
    it('should open create modal on Add button click', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Add Anaesthetist')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Add Anaesthetist'));

        await waitFor(() => {
            expect(screen.getByText('Add New Anaesthetist')).toBeInTheDocument();
        });
    });

    // ── Edit Button and Modal ───────────────────────────────────────────────
    it('should show edit buttons on anaesthetist cards', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            const editBtn = document.getElementById('edit-anaesthetist-1');
            expect(editBtn).toBeInTheDocument();
        });
    });

    it('should open edit modal when edit button is clicked', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Dr. Alice Anaes')).toBeInTheDocument();
        });

        const editBtn = document.getElementById('edit-anaesthetist-1');
        fireEvent.click(editBtn);

        await waitFor(() => {
            expect(screen.getByText('Edit Anaesthetist')).toBeInTheDocument();
        });
    });

    // ── Delete Button and Modal ─────────────────────────────────────────────
    it('should show delete buttons on anaesthetist cards', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            const deleteBtn = document.getElementById('delete-anaesthetist-1');
            expect(deleteBtn).toBeInTheDocument();
        });
    });

    it('should open delete modal when delete button is clicked', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Dr. Alice Anaes')).toBeInTheDocument();
        });

        const deleteBtn = document.getElementById('delete-anaesthetist-1');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(screen.getByText('Delete Anaesthetist')).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
            expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
        });
    });

    it('should call deleteAnaesthetist on confirm and remove card', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });
        anaesthetistService.deleteAnaesthetist.mockResolvedValue({
            success: true,
            message: 'Anaesthetist deleted successfully',
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Dr. Alice Anaes')).toBeInTheDocument();
        });

        const deleteBtn = document.getElementById('delete-anaesthetist-1');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Confirm Delete'));

        await waitFor(() => {
            expect(anaesthetistService.deleteAnaesthetist).toHaveBeenCalledWith(1);
            expect(screen.queryByText('Dr. Alice Anaes')).not.toBeInTheDocument();
        });
    });

    // ── Update via Edit Modal ───────────────────────────────────────────────
    it('should call updateAnaesthetist on save and update the card', async () => {
        anaesthetistService.getAllAnaesthetists.mockResolvedValue({
            success: true,
            data: mockAnaesthetists,
        });
        anaesthetistService.updateAnaesthetist.mockResolvedValue({
            success: true,
            data: { ...mockAnaesthetists[0], name: 'Dr. Alice Updated' },
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Dr. Alice Anaes')).toBeInTheDocument();
        });

        const editBtn = document.getElementById('edit-anaesthetist-1');
        fireEvent.click(editBtn);

        await waitFor(() => {
            expect(screen.getByText('Edit Anaesthetist')).toBeInTheDocument();
        });

        const nameInput = document.getElementById('edit-anaes-name');
        fireEvent.change(nameInput, { target: { value: 'Dr. Alice Updated' } });

        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(anaesthetistService.updateAnaesthetist).toHaveBeenCalledWith(
                1,
                expect.objectContaining({ name: 'Dr. Alice Updated' })
            );
        });
    });
});
