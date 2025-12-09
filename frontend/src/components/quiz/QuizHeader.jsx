import React from 'react';
import { quizStyles } from '../../styles/quizStyles';

/**
 * Quiz header with title, timer, and close button
 */
const QuizHeader = ({ title, timeSpent, onClose }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={quizStyles.header}>
      <h3 className={quizStyles.headerTitle}>{title} - Quiz</h3>
      <div className="flex items-center space-x-4">
        <div className={quizStyles.timer}>
          <span className="font-mono">{formatTime(timeSpent)}</span>
        </div>
        <button
          className="text-white hover:text-gray-200 transition-colors"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default QuizHeader;
