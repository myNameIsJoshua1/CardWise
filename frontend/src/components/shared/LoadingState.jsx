import React from 'react';

export const LoadingState = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className={`${sizeClass} text-purple-600 animate-pulse`}>
        {text}
      </div>
    </div>
  );
};

export default LoadingState;
