import React from 'react';

/**
 * Reusable flashcard flip component for StudyDeck
 */
const FlashcardFlip = ({ card, flipped, onFlip, useShadowEffects }) => {
  return (
    <div 
      className="h-64 w-full cursor-pointer relative rounded-lg"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <div 
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease-in-out',
        }}
      >
        {/* Front side - Question */}
        <div 
          className={`bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg flex flex-col items-center justify-center p-6 text-center h-full border border-purple-200 dark:border-purple-700 absolute w-full ${useShadowEffects ? 'shadow-inner' : ''}`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <h4 className="text-purple-800 dark:text-purple-200 text-xl font-medium mb-4">{card.term}</h4>
          <div className="mt-auto">
            <p className="text-purple-600 dark:text-purple-300 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Click to see answer
            </p>
          </div>
        </div>

        {/* Back side - Answer */}
        <div 
          className={`bg-gradient-to-br from-orange-100 to-yellow-50 dark:from-orange-900/40 dark:to-yellow-800/40 rounded-lg flex flex-col items-center justify-center p-6 text-center h-full border border-orange-200 dark:border-orange-700 absolute w-full ${useShadowEffects ? 'shadow-inner' : ''}`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-gray-800 dark:text-gray-200 text-lg">{card.definition}</p>
          <div className="mt-auto">
            <p className="text-orange-600 dark:text-orange-300 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Click to see question
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardFlip;
