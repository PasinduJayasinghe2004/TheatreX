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
    const [themeMode, setThemeMode] = useState(() => {
        const stored = localStorage.getItem('theatrex-theme-mode');
        return stored || 'system';
    });

    const [isDark, setIsDark] = useState(false);
    const [density, setDensity] = useState(() => localStorage.getItem('theatrex-density') || 'comfortable');
    const [highContrast, setHighContrast] = useState(() => localStorage.getItem('theatrex-high-contrast') === 'true');

    // Resolve dark mode from themeMode
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const resolvedIsDark = themeMode === 'dark' || (themeMode === 'system' && prefersDark);
        setIsDark(resolvedIsDark);

        const root = document.documentElement;
        if (resolvedIsDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        root.dataset.density = density;
        if (highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        localStorage.setItem('theatrex-theme-mode', themeMode);
        localStorage.setItem('theatrex-density', density);
        localStorage.setItem('theatrex-high-contrast', String(highContrast));
    }, [themeMode, density, highContrast]);

    useEffect(() => {
        if (themeMode !== 'system') return undefined;

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event) => {
            setIsDark(event.matches);
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [themeMode]);

    const toggleTheme = () => {
        setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider
            value={{
                isDark,
                toggleTheme,
                themeMode,
                setThemeMode,
                density,
                setDensity,
                highContrast,
                setHighContrast,
            }}
        >
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
