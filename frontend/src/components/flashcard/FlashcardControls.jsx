import React from 'react';

/**
 * Flashcard navigation controls for StudyDeck
 */
const FlashcardControls = ({ 
  currentIndex, 
  total, 
  onPrevious, 
  onNext, 
  onMarkLearned, 
  isLearned 
}) => {
  return (
    <div className="flex justify-between mt-5">
      <div className="flex items-center">
        <button 
          className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors text-purple-700 dark:text-purple-300"
          onClick={onPrevious}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-gray-700 dark:text-gray-300 mx-4 font-medium">{currentIndex + 1} / {total}</span>
        <button 
          className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors text-purple-700 dark:text-purple-300"
          onClick={onNext}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <button 
        className={`px-4 py-2 rounded-md font-medium ${
          isLearned
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          : 'bg-green-500 text-white hover:bg-green-600 transition-colors'
        }`}
        onClick={onMarkLearned}
        disabled={isLearned}
      >
        {isLearned ? 'Already Learned' : 'Mark as Learned'}
      </button>
    </div>
  );
};

export default FlashcardControls;
