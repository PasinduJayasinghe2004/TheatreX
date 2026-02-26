// ============================================================================
// usePolling Hook Tests
// ============================================================================
// Created by: M3 (Janani) - Day 11
// Fixed by:   M6 (Dinil) - Day 11 Bug Fix
//
// Tests for the reusable usePolling custom hook that drives 30s auto-refresh
// across the TheatreList, TheatreDetail, and LiveStatusPage views.
//
// Bug fixed: `waitFor` internally uses real setTimeout which hangs when
// vi.useFakeTimers() is active. Replaced with `act(async () => {})` to
// flush microtasks / promise chains without relying on real timers.
//
// Run with: npx vitest run src/tests/usePolling.test.js
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePolling from '../hooks/usePolling';

describe('usePolling hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ── Basic fetch on mount ─────────────────────────────────────────────

    it('should call fetchFn immediately on mount when immediate=true (default)', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ theatres: [] });

        renderHook(() => usePolling(fetchFn, { interval: 30000 }));

        // fetchFn should have been called once immediately
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should set loading to true initially and false after fetch', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ theatres: [] });

        const { result } = renderHook(() => usePolling(fetchFn, { interval: 30000 }));

        // Flush all pending promises / microtasks
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual({ theatres: [] });
        expect(result.current.error).toBeNull();
    });

    // ── Data and error state ─────────────────────────────────────────────

    it('should expose data returned by fetchFn', async () => {
        const payload = { success: true, data: [{ id: 1, name: 'Theatre 1' }] };
        const fetchFn = vi.fn().mockResolvedValue(payload);

        const { result } = renderHook(() => usePolling(fetchFn, { interval: 5000 }));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.data).toEqual(payload);
    });

    it('should set error when fetchFn rejects', async () => {
        const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => usePolling(fetchFn, { interval: 5000 }));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.error).toBe('Network error');
    });

    it('should keep stale data when fetchFn later fails', async () => {
        let callCount = 0;
        const fetchFn = vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) return Promise.resolve({ ok: true });
            return Promise.reject(new Error('fail'));
        });

        const { result } = renderHook(() => usePolling(fetchFn, { interval: 1000 }));

        // Wait for initial successful fetch
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.data).toEqual({ ok: true });

        // Advance timer to trigger next poll
        await act(async () => {
            vi.advanceTimersByTime(1000);
            await Promise.resolve();
        });

        // Error should be set but data should be preserved
        expect(result.current.error).toBe('fail');
        expect(result.current.data).toEqual({ ok: true });
    });

    // ── Polling interval ─────────────────────────────────────────────────

    it('should call fetchFn again after the interval elapses', async () => {
        const fetchFn = vi.fn().mockResolvedValue('tick');

        renderHook(() => usePolling(fetchFn, { interval: 5000 }));

        // Wait for the initial fetch to complete so inFlightRef is cleared
        await act(async () => {
            await Promise.resolve();
        });

        // Initial call completed
        expect(fetchFn).toHaveBeenCalledTimes(1);

        // Advance by 5 seconds and flush the triggered interval callback
        await act(async () => {
            vi.advanceTimersByTime(5000);
            await Promise.resolve();
        });

        // Should have been called a second time
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    // ── lastPolledAt ─────────────────────────────────────────────────────

    it('should update lastPolledAt after each successful poll', async () => {
        const fetchFn = vi.fn().mockResolvedValue('data');

        const { result } = renderHook(() => usePolling(fetchFn, { interval: 3000 }));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.lastPolledAt).toBeInstanceOf(Date);
    });

    // ── Manual refresh ───────────────────────────────────────────────────

    it('should support manual refresh via refresh()', async () => {
        const fetchFn = vi.fn().mockResolvedValue('v1');

        const { result } = renderHook(() => usePolling(fetchFn, { interval: 60000 }));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.data).toBe('v1');

        fetchFn.mockResolvedValue('v2');

        await act(async () => {
            result.current.refresh();
            await Promise.resolve();
        });

        expect(result.current.data).toBe('v2');
    });

    // ── Enabled flag ─────────────────────────────────────────────────────

    it('should not fetch when enabled=false', () => {
        const fetchFn = vi.fn().mockResolvedValue('data');

        renderHook(() => usePolling(fetchFn, { interval: 5000, enabled: false }));

        expect(fetchFn).not.toHaveBeenCalled();
    });

    // ── Cleanup on unmount ───────────────────────────────────────────────

    it('should stop polling on unmount', async () => {
        const fetchFn = vi.fn().mockResolvedValue('data');

        const { unmount } = renderHook(() => usePolling(fetchFn, { interval: 3000 }));

        expect(fetchFn).toHaveBeenCalledTimes(1);

        unmount();

        await act(async () => {
            vi.advanceTimersByTime(6000);
            await Promise.resolve();
        });

        // No additional calls after unmount
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });
});
