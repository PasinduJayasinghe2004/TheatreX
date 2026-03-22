/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback } from 'react';

const StaffContext = createContext(null);

export const StaffProvider = ({ children }) => {
    // Array of listeners that will be called when staff data changes
    // Each listener is a { refresh: Function }
    const listeners = [];

    // ========================================
    // Subscribe to staff data changes
    // Returns unsubscribe function
    // ========================================
    const subscribe = useCallback((refreshCallback) => {
        listeners.push(refreshCallback);
        // Return unsubscribe function
        return () => {
            const index = listeners.indexOf(refreshCallback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []);

    // ========================================
    // Notify all listeners that staff data has changed
    // Called when surgeon, nurse, anaesthetist, or technician is added/updated/deleted
    // ========================================
    const notifyStaffDataChanged = useCallback((staffType) => {
        listeners.forEach(callback => {
            if (typeof callback === 'function') {
                callback(staffType);
            }
        });
    }, []);

    const value = {
        subscribe,
        notifyStaffDataChanged,
    };

    return (
        <StaffContext.Provider value={value}>
            {children}
        </StaffContext.Provider>
    );
};

export const useStaff = () => {
    const context = useContext(StaffContext);
    if (!context) {
        throw new Error('useStaff must be used within a StaffProvider');
    }
    return context;
};
