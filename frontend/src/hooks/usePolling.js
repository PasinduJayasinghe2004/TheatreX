// ============================================================================
// usePolling Custom Hook
// ============================================================================
// Created by: M3 (Janani) - Day 11
//
// A reusable React hook that polls an async function at a configurable
// interval (default 30 000 ms = 30 s). Provides loading, error, and data
// state plus manual refresh capabilities.
//
// Features:
//   - Configurable polling interval (default 30s)
//   - Auto-starts on mount, cleans up on unmount
//   - Pause / resume support
//   - Manual refresh trigger
//   - Skips overlapping requests (won't fire again while one is in-flight)
//   - Tracks last-polled timestamp
//
// Usage:
//   const { data, loading, error, lastPolledAt, refresh, pause, resume }
//       = usePolling(fetchFn, { interval: 30000, enabled: true });
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @param {() => Promise<any>} fetchFn  - Async function to call on each tick
 * @param {object}  options
 * @param {number}  [options.interval=30000]  - Polling interval in ms
 * @param {boolean} [options.enabled=true]    - Whether polling is active
 * @param {boolean} [options.immediate=true]  - Fetch immediately on mount
 */
const usePolling = (fetchFn, { interval = 30000, enabled = true, immediate = true } = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastPolledAt, setLastPolledAt] = useState(null);

    // Refs to avoid stale closures
    const fetchFnRef = useRef(fetchFn);
    const inFlightRef = useRef(false);
    const timerRef = useRef(null);

    // Keep the fetchFn ref current
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    // Core fetch wrapper — prevents overlapping calls
    const executeFetch = useCallback(async (isInitial = false) => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        if (isInitial) setLoading(true);

        try {
            const result = await fetchFnRef.current();
            setData(result);
            setError(null);
            setLastPolledAt(new Date());
        } catch (err) {
            setError(err.message || 'Polling error');
            // Keep stale data on error so the UI doesn't flash empty
        } finally {
            inFlightRef.current = false;
            if (isInitial) setLoading(false);
        }
    }, []);

    // Start / stop the interval
    useEffect(() => {
        if (!enabled) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // Fetch immediately if requested
        if (immediate) {
            executeFetch(true);
        }

        timerRef.current = setInterval(() => {
            executeFetch(false);
        }, interval);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [enabled, interval, immediate, executeFetch]);

    // Manual refresh (resets loading state)
    const refresh = useCallback(() => {
        executeFetch(true);
    }, [executeFetch]);

    // Pause / resume helpers (swap `enabled` from outside or use these)
    const [paused, setPaused] = useState(false);

    const pause = useCallback(() => {
        setPaused(true);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const resume = useCallback(() => {
        setPaused(false);
    }, []);

    // Restart interval when un-paused
    useEffect(() => {
        if (paused || !enabled) return;

        // Re-fetch once to get fresh data, then set interval
        executeFetch(false);

        timerRef.current = setInterval(() => {
            executeFetch(false);
        }, interval);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paused]);

    return { data, loading, error, lastPolledAt, refresh, pause, resume, paused };
};

export default usePolling;
