// ============================================================================
// DeleteConfirmationModal
// ============================================================================
// A reusable modal for confirming destructive delete actions.
// ============================================================================

import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Confirmation",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemName = "",
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    {itemName && (
                        <p className="text-sm font-semibold text-red-600 mb-2">{itemName}</p>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Confirm Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
