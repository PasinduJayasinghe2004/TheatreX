/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, useRef } from 'react';

const StaffContext = createContext(null);

export const StaffProvider = ({ children }) => {
    // Use useRef to store listeners array (doesn't trigger re-renders)
    const listenersRef = useRef([]);

    // ========================================
    // Subscribe to staff data changes
    // Returns unsubscribe function
    // ========================================
    const subscribe = useCallback((refreshCallback) => {
        listenersRef.current.push(refreshCallback);
        // Return unsubscribe function
        return () => {
            const index = listenersRef.current.indexOf(refreshCallback);
            if (index > -1) {
                listenersRef.current.splice(index, 1);
            }
        };
    }, []);

    // ========================================
    // Notify all listeners that staff data has changed
    // Called when surgeon, nurse, anaesthetist, or technician is added/updated/deleted
    // ========================================
    const notifyStaffDataChanged = useCallback((staffType) => {
        listenersRef.current.forEach(callback => {
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
