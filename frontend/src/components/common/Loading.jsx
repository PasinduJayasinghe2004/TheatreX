/**
 * Loading Spinner Component
 * A premium, modern loading indicator with glassmorphism and smooth animations.
 */
import { AnimatedLogoLoader } from '../AnimatedIcons';

const Loading = ({ fullPage = false, message = 'Loading...' }) => {
  const isBuffering = String(message || '').toLowerCase().includes('buffer');

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <AnimatedLogoLoader mode={isBuffering ? 'buffering' : 'loading'} iconSize={56} />
      
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
