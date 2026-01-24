import React from 'react';

/**
 * Input Component
 * Reusable input field with label and error message support
 * 
 * @param {string} label - Input label
 * @param {string} type - Input type (text, email, password, number, etc.)
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {boolean} required - Required field
 * @param {boolean} disabled - Disable input
 * @param {string} className - Additional CSS classes
 */

const Input = ({
    label,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    error = '',
    required = false,
    disabled = false,
    name,
    id,
    className = '',
    ...props
}) => {
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    // Base input styles
    const baseStyles = 'w-full px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';

    // Error styles
    const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';

    const inputClasses = `${baseStyles} ${errorStyles} ${className}`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input
                id={inputId}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={inputClasses}
                {...props}
            />

            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
