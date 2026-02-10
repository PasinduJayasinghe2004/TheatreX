// Import React hooks and PropTypes for component functionality and type checking
import { useEffect } from 'react'; // useEffect hook for side effects (event listeners, DOM manipulation)
import PropTypes from 'prop-types'; // Runtime type checking for component props

/**
 * Modal Component - A Reusable Dialog Box
 * ========================================
 * This component creates a popup dialog that appears on top of the main content.
 * It's used for forms, confirmations, alerts, or any content that needs user attention.
 * 
 * Created by: Pasindu - Day 2
 * 
 * HOW TO USE:
 * -----------
 * <Modal isOpen={true} onClose={() => setOpen(false)} title="My Modal">
 *   <p>Your content here</p>
 * </Modal>
 * 
 * PROPS EXPLAINED:
 * ----------------
 * @param {boolean} isOpen - true = modal shows, false = modal hides
 * @param {function} onClose - Function to call when user wants to close modal
 * @param {string} title - Text shown at the top of modal (optional)
 * @param {node} children - The main content inside the modal
 * @param {string} size - How wide the modal should be: 'sm', 'md', 'lg', 'xl', '2xl', 'full'
 * @param {node} footer - Content at the bottom (usually buttons like "Save" or "Cancel")
 * @param {boolean} closeOnBackdrop - If true, clicking outside modal closes it (default: true)
 * @param {boolean} closeOnEsc - If true, pressing ESC key closes modal (default: true)
 */
const Modal = ({
    isOpen,                      // Controls whether modal is visible or hidden
    onClose,                     // Function to close the modal
    title,                       // Optional title text
    children,                    // Main content of the modal
    size = 'md',                 // Default size is medium
    footer,                      // Optional footer content
    closeOnBackdrop = true,      // Allow closing by clicking outside
    closeOnEsc = true            // Allow closing with ESC key
}) => {


    // This useEffect sets up keyboard event listening
    // Purpose: Allow users to close modal by pressing ESC key (common UX pattern)
    useEffect(() => {
        // Don't set up listener if modal is closed or ESC closing is disabled
        if (!isOpen || !closeOnEsc) return;

        // Function that runs when any key is pressed
        const handleEscape = (e) => {
            // Check if the pressed key is 'Escape'
            if (e.key === 'Escape') {
                onClose(); // Close the modal
            }
        };

        // Add the event listener to the entire document
        // This means ESC will work no matter where the user's focus is
        document.addEventListener('keydown', handleEscape);

        // CLEANUP FUNCTION: Runs when component unmounts or dependencies change
        // Removes the event listener to prevent memory leaks
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEsc]); // Re-run if any of these values change


    // This useEffect manages body scroll behavior
    // Purpose: When modal is open, prevent background page from scrolling
    useEffect(() => {
        if (isOpen) {
            // Modal is open: disable scrolling on the main page
            document.body.style.overflow = 'hidden'; // Stops page scrolling while modal is open
        } else {                                     // Improves user experience
            // Modal is closed: restore normal scrolling
            document.body.style.overflow = 'unset';
        }

        // CLEANUP FUNCTION: Always restore scrolling when component unmounts
        return () => {
            document.body.style.overflow = 'unset'; // Cleanup ensures scroll is restored even if component unmounts
        };
    }, [isOpen]); // Re-run whenever isOpen changes

    // ==========================================
    // FUNCTION: Handle Backdrop Click
    // ==========================================
    // This function determines if user clicked on the dark background (backdrop)
    // Purpose: Close modal when clicking outside of it (but not when clicking inside)
    const handleBackdropClick = (e) => {
        // e.target = the element that was actually clicked
        // e.currentTarget = the element this event listener is attached to (the backdrop)
        // If they're the same, user clicked the backdrop, not the modal content
        if (closeOnBackdrop && e.target === e.currentTarget) { // This is the key check here
            // Ensures only clicks on the backdrop, not modal content, close the modal
            onClose(); // Close the modal
        }
    };


    // Object mapping size names to Tailwind CSS classes
    // These control the maximum width of the modal
    const sizeClasses = {
        sm: 'max-w-sm',      // Small: ~384px wide
        md: 'max-w-md',      // Medium: ~448px wide (default)
        lg: 'max-w-lg',      // Large: ~512px wide
        xl: 'max-w-xl',      // Extra Large: ~576px wide
        '2xl': 'max-w-2xl',  // 2X Large: ~672px wide
        full: 'max-w-full mx-4' // Full width with small margin
    };


    // If modal is not open, return null (render nothing)
    // This completely removes the modal from the DOM when closed
    if (!isOpen) return null;


    return (

        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={handleBackdropClick} // Detect clicks on backdrop
        >

            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />


            <div
                className={`
          relative w-full ${sizeClasses[size]}
          bg-white dark:bg-gray-800 
          rounded-2xl shadow-2xl
          transform transition-all duration-300
          animate-slideUp
          max-h-[90vh] flex flex-col
        `}
            >
                {/* HEADER SECTION: Title and close button */}
                {/* Only renders if title prop is provided */}
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        {/* Modal Title */}
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h2>


                        <button
                            onClick={onClose}
                            className="
                p-2 rounded-lg
                text-gray-400 hover:text-gray-600
                dark:text-gray-500 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-200
              "
                            aria-label="Close modal"
                        >
                            {/* SVG X Icon */}
                            {/* The path draws two diagonal lines forming an X */}
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12" // Two lines: top-left to bottom-right, bottom-left to top-right
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* BODY SECTION: Main content area */}
                {/* - flex-1: Takes up all available space between header and footer */}
                {/* - overflow-y-auto: Allows vertical scrolling if content is too long */}
                {/* - p-6: Padding on all sides */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children} {/* Renders whatever content was passed to the Modal */}
                </div>

                {/* FOOTER SECTION: Action buttons area */}
                {/* Only renders if footer prop is provided */}
                {footer && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        {footer} {/* Renders footer content (usually buttons) */}
                    </div>
                )}
            </div>
        </div>
    );
};

// This validates that the component receives the correct prop types
// Helps catch bugs during development
Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,      // Must be a boolean, required
    onClose: PropTypes.func.isRequired,     // Must be a function, required
    title: PropTypes.string,                // Must be a string, optional
    children: PropTypes.node.isRequired,    // Can be any renderable content, required
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']), // Must be one of these strings
    footer: PropTypes.node,                 // Can be any renderable content, optional
    closeOnBackdrop: PropTypes.bool,        // Must be a boolean, optional
    closeOnEsc: PropTypes.bool,             // Must be a boolean, optional
};

// Export the component so it can be used in other files
export default Modal;
