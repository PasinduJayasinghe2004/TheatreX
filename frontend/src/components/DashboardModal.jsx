// ============================================================================
// Dashboard Modal Component
// ============================================================================
// Reusable overlay modal for dashboard summary card popups.
// Features: dimmed backdrop, rounded card, close on X / outside click,
// smooth fade + scale animation, scrollable content.
// ============================================================================

import { useEffect, useRef } from 'react';

const DashboardModal = ({ isOpen, onClose, title, children }) => {
    const backdropRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
            {/* Dimmed backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal Card */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{ maxWidth: '1000px', animation: 'scaleIn 0.25s ease-out' }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white rounded-t-2xl px-8 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-6">
                    {children}
                </div>
            </div>

            {/* CSS animations injected inline */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default DashboardModal;
