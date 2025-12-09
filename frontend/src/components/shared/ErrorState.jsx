import React from 'react';
import Button from '../ui/button';

export const ErrorState = ({ 
  message, 
  onRetry, 
  onBack, 
  retryText = 'Try Again',
  backText = 'Go Back' 
}) => {
  return (
    <div className="max-w-lg mx-auto mt-10 rounded-lg p-4 shadow-md bg-white">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {message || 'An error occurred. Please try again.'}
      </div>
      <div className="flex gap-2 justify-center">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {retryText}
          </Button>
        )}
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            {backText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
