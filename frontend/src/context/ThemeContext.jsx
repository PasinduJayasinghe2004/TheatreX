/* eslint-disable react-refresh/only-export-components */

/**
 * Theme Context - Dark / Light Mode
 * Created by: M1 (Pasindu) - Day 13
 *
 * PURPOSE:
 *  - Provide a global dark/light mode toggle to the entire application
 *  - Persist user preference in localStorage
 *  - Toggle the `.dark` class on the <html> element so Tailwind v4
 *    `dark:` variants and our CSS variable overrides both activate
 *
 * USAGE:
 *  1. Wrap your app: <ThemeProvider><App /></ThemeProvider>
 *  2. In any component: const { isDark, toggleTheme } = useTheme();
 */

import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    // Initialise from localStorage, fallback to system preference
    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem('theatrex-theme');
        if (stored !== null) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Apply / remove .dark class on <html> whenever isDark changes
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theatrex-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider — wrap your app in App.jsx');
    return ctx;
};

export default ThemeContext;
