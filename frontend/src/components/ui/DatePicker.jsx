// Import React and PropTypes for component functionality and type checking
import PropTypes from 'prop-types'; // Runtime type checking for component props

/**
 * DatePicker Component - A Reusable Date Selection Input
 * =======================================================
 * This component creates a styled date input field that allows users to select dates.
 * It's used for surgery scheduling, patient appointments, filtering by date, etc.
 * 
 * Created by: Janani (M3) - Day 2
 * 
 * HOW TO USE:
 * -----------
 * <DatePicker 
 *   label="Surgery Date"
 *   value={selectedDate}
 *   onChange={(e) => setSelectedDate(e.target.value)}
 *   minDate="2024-01-01"
 *   maxDate="2024-12-31"
 * />
 * 
 * PROPS EXPLAINED:
 * ----------------
 * @param {string} label - Text shown above the date input (optional)
 * @param {string} value - The selected date in YYYY-MM-DD format
 * @param {function} onChange - Function called when user selects a date
 * @param {string} placeholder - Placeholder text when no date is selected (optional)
 * @param {string} minDate - Minimum selectable date in YYYY-MM-DD format (optional)
 * @param {string} maxDate - Maximum selectable date in YYYY-MM-DD format (optional)
 * @param {boolean} disabled - If true, user cannot interact with the input (default: false)
 * @param {string} error - Error message to display below the input (optional)
 * @param {boolean} required - If true, shows asterisk and makes field required (default: false)
 * @param {string} name - Name attribute for form submission (optional)
 * @param {string} id - ID attribute for the input element (optional)
 */
const DatePicker = ({
    label,                       // Optional label text above the input
    value,                       // Current selected date value (controlled component)
    onChange,                    // Function to handle date changes
    placeholder = 'Select date', // Default placeholder text
    minDate,                     // Optional minimum date restriction
    maxDate,                     // Optional maximum date restriction
    disabled = false,            // Whether input is disabled
    error,                       // Optional error message
    required = false,            // Whether field is required
    name,                        // Name for form submission
    id                           // ID for the input element
}) => {

    // ==========================================
    // FUNCTION: Format Date for Display
    // ==========================================
    // Converts YYYY-MM-DD format to more readable format
    // Example: "2024-02-09" -> "February 9, 2024"
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';

        try {
            // Create Date object from the date string
            const date = new Date(dateString);

            // Format options for readable date display
            const options = {
                year: 'numeric',   // Show full year (2024)
                month: 'long',     // Show full month name (February)
                day: 'numeric'     // Show day number (9)
            };

            // Return formatted date string
            return date.toLocaleDateString('en-US', options);
        } catch {
            // If date parsing fails, return original string
            return dateString;
        }
    };


    return (
        <div className="w-full">
            {/* LABEL SECTION: Shows label text if provided */}
            {/* Only renders if label prop is provided */}
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    {label}
                    {/* Show red asterisk if field is required */}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* DATE INPUT CONTAINER */}
            {/* Wrapper div provides consistent styling and positioning */}
            <div className="relative">
                {/* 
                    HTML5 DATE INPUT
                    ================
                    type="date" provides native date picker in browsers
                    - Chrome/Edge: Shows calendar popup
                    - Firefox: Shows calendar popup
                    - Safari: Shows dropdown with month/day/year
                    - Mobile: Shows native mobile date picker
                */}
                <input
                    type="date"
                    id={id}
                    name={name}
                    value={value || ''}  // Controlled component: value comes from parent
                    onChange={onChange}  // Call parent's onChange handler when date changes
                    min={minDate}        // Browser prevents selecting dates before this
                    max={maxDate}        // Browser prevents selecting dates after this
                    disabled={disabled}  // Grays out input if disabled
                    required={required}  // HTML5 validation if required
                    placeholder={placeholder}
                    className={`
                        w-full px-4 py-3 rounded-lg pl-12
                        border-2 transition-all duration-200
                        
                        ${!error && !disabled
                            ? 'border-gray-300 dark:border-gray-600'
                            : ''
                        }
                        
                        ${error
                            ? 'border-red-500 dark:border-red-500'
                            : ''
                        }
                        
                        ${disabled
                            ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60'
                            : 'bg-white dark:bg-gray-800'
                        }
                        
                        ${!disabled && !error
                            ? 'hover:border-blue-400 dark:hover:border-blue-500'
                            : ''
                        }
                        
                        ${!disabled && !error
                            ? 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : ''
                        }
                        
                        text-gray-900 dark:text-gray-100
                        outline-none
                        
                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                        [&::-webkit-calendar-picker-indicator]:dark:invert
                        [&::-webkit-calendar-picker-indicator]:dark:opacity-70
                    `}
                />

                {/* CALENDAR ICON (decorative) */}
                {/* Shows a calendar icon on the left side of the input */}
                {/* This is in addition to the browser's native calendar picker icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                        className={`w-5 h-5 ${disabled
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {/* Calendar icon SVG path */}
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>
            </div>

            {/* ERROR MESSAGE SECTION */}
            {/* Only shows if error prop is provided */}
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    {/* Error icon */}
                    <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {/* Error message text */}
                    {error}
                </p>
            )}

            {/* HELPER TEXT: Shows selected date in readable format */}
            {/* Only shows if there's a value and no error */}
            {value && !error && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Selected: {formatDateForDisplay(value)}
                </p>
            )}

            {/* DATE RANGE HINT */}
            {/* Shows min/max date restrictions if they exist */}
            {(minDate || maxDate) && !error && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {minDate && maxDate && (
                        <>Valid dates: {formatDateForDisplay(minDate)} to {formatDateForDisplay(maxDate)}</>
                    )}
                    {minDate && !maxDate && (
                        <>Minimum date: {formatDateForDisplay(minDate)}</>
                    )}
                    {!minDate && maxDate && (
                        <>Maximum date: {formatDateForDisplay(maxDate)}</>
                    )}
                </p>
            )}
        </div>
    );
};

// PropTypes: Validates that component receives correct prop types
// Helps catch bugs during development
DatePicker.propTypes = {
    label: PropTypes.string,              // Optional string
    value: PropTypes.string,              // Optional string (YYYY-MM-DD format)
    onChange: PropTypes.func.isRequired,  // Required function
    placeholder: PropTypes.string,        // Optional string
    minDate: PropTypes.string,            // Optional string (YYYY-MM-DD format)
    maxDate: PropTypes.string,            // Optional string (YYYY-MM-DD format)
    disabled: PropTypes.bool,             // Optional boolean
    error: PropTypes.string,              // Optional string
    required: PropTypes.bool,             // Optional boolean
    name: PropTypes.string,               // Optional string
    id: PropTypes.string,                 // Optional string
};

// Export the component so it can be used in other files
export default DatePicker;
