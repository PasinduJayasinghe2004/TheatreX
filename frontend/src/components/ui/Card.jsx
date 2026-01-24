import React from 'react';

/**
 * Card Component
 * Reusable card container with header, body, and footer sections
 * 
 * @param {ReactNode} children - Card content
 * @param {string} title - Card title
 * @param {ReactNode} header - Custom header content
 * @param {ReactNode} footer - Footer content
 * @param {string} className - Additional CSS classes
 * @param {boolean} hoverable - Add hover effect
 * @param {function} onClick - Click handler (makes card clickable)
 */

const Card = ({
    children,
    title,
    header,
    footer,
    className = '',
    hoverable = false,
    onClick,
    ...props
}) => {
    // Base card styles
    const baseStyles = 'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden';

    // Hover styles
    const hoverStyles = hoverable || onClick ? 'hover:shadow-lg transition-shadow duration-200' : '';

    // Clickable styles
    const clickableStyles = onClick ? 'cursor-pointer' : '';

    const cardClasses = `${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`;

    return (
        <div className={cardClasses} onClick={onClick} {...props}>
            {/* Header Section */}
            {(title || header) && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    {header || (
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    )}
                </div>
            )}

            {/* Body Section */}
            <div className="px-6 py-4">
                {children}
            </div>

            {/* Footer Section */}
            {footer && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {footer}
                </div>
            )}
        </div>
    );
};

// Card.Header subcomponent
Card.Header = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>
        {children}
    </div>
);

// Card.Body subcomponent
Card.Body = ({ children, className = '' }) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
);

// Card.Footer subcomponent
Card.Footer = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
        {children}
    </div>
);

export default Card;
