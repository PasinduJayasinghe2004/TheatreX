import React from 'react';

/**
 * Loading Spinner Component
 * A premium, modern loading indicator with glassmorphism and smooth animations.
 */
const Loading = ({ fullPage = false, message = 'Loading...' }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        {/* Pulsing center */}
        <div className="absolute inset-4 bg-primary/40 rounded-full animate-pulse"></div>
      </div>
      
      {message && (
        <p className="text-secondary font-medium tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {spinnerContent}
    </div>
  );
};

export default Loading;
