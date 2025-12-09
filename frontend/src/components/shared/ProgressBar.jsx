import React from 'react';

/**
 * Reusable progress bar component
 * Used in QuizMode, StudyDeck, and ProgressStats
 */
const ProgressBar = ({ 
  current, 
  total, 
  label, 
  showPercentage = true,
  barColor = "bg-gradient-to-r from-purple-600 to-orange-500",
  bgColor = "bg-gray-200 dark:bg-gray-700",
  height = "h-2",
  textSize = "text-xs",
  animate = true
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className={`flex justify-between mb-1 ${textSize} text-gray-600 dark:text-gray-300`}>
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className={`w-full ${bgColor} rounded-full ${height}`}>
        <div 
          className={`${barColor} ${height} rounded-full ${animate ? 'transition-all duration-300' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
