import React from 'react';

/**
 * Reusable empty state card with icon, message, and action button
 * Consolidates empty state UI pattern used across multiple pages
 */
const EmptyStateCard = ({ 
  icon, 
  title, 
  message, 
  actionText, 
  onAction, 
  iconColor = "text-purple-600",
  iconBgColor = "bg-purple-100"
}) => {
  return (
    <div className="text-center py-16 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-inner border border-gray-200 dark:border-slate-700">
      <div className="max-w-md mx-auto">
        <div className={`mb-6 w-24 h-24 ${iconBgColor} rounded-full flex items-center justify-center mx-auto`}>
          {icon || (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          )}
        </div>
        {title && <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>}
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-md shadow-sm hover:shadow transition-all duration-200"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyStateCard;
