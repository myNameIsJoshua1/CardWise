import React from 'react';

/**
 * Reusable stat display card
 * Used in ProgressStats and Dashboard for displaying metrics
 */
const StatCard = ({ label, value, bgColor = "bg-blue-50", darkBgColor = "bg-blue-900/30", icon }) => {
  return (
    <div className={`${bgColor} dark:${darkBgColor} p-4 rounded-lg transition-colors`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">{label}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
        </div>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
    </div>
  );
};

export default StatCard;
