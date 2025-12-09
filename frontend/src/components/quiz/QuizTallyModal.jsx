import React from 'react';
import { quizStyles } from '../../styles/quizStyles';

/**
 * Quiz tallying/completion modal showing score calculation progress
 */
const QuizTallyModal = ({ tallyState, totalQuestions }) => {
  return (
    <div className={quizStyles.overlayDark}>
      <div className={quizStyles.tallyCard}>
        <h2 className={quizStyles.tallyTitle}>Quiz Complete!</h2>
        
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium dark:text-gray-300">{tallyState.tallyStep}</span>
            <span className="text-sm font-medium dark:text-gray-300">{tallyState.tallyProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${tallyState.tallyProgress}%` }}
            />
          </div>
        </div>
        
        {tallyState.tallyProgress >= 30 && (
          <div className="text-center mb-6">
            <div className={quizStyles.tallyScore}>
              {tallyState.tallyScore}%
            </div>
            <div className="text-gray-600 dark:text-gray-300 mt-2">
              {tallyState.correctTally} of {totalQuestions} questions correct
            </div>
          </div>
        )}
        
        {tallyState.tallyComplete ? (
          <div className="text-center text-green-600 dark:text-green-400 font-medium">
            Redirecting to results...
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTallyModal;
