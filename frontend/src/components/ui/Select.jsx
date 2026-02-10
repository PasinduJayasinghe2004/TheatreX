

/**
 * Select Component
 * Reusable dropdown select with label and error message support
 * Created by: M2 - Day 2
 * 
 * @param {string} label - Select label
 * @param {Array} options - Array of { value, label } objects
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {boolean} required - Required field
 * @param {boolean} disabled - Disable select
 * @param {string} size - Select size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */

const Select = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    error = '',
    required = false,
    disabled = false,
    size = 'md',
    name,
    id,
    className = '',
    ...props
}) => {
    const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    // Base select styles
    const baseStyles = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white cursor-pointer';

    // Size styles
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-4 py-3 text-lg'
    };

    // Error styles
    const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';

    const selectClasses = `${baseStyles} ${sizes[size]} ${errorStyles} ${className}`;

    return (
        <div className="w-full relative">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <select
                    id={selectId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className={selectClasses}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Select;
