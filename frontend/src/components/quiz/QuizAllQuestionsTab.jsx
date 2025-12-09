import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useOptimization } from '../../components/PerformanceMonitor';

const QuizAllQuestionsTab = ({ questions, isAnswerCorrect }) => {
  const { styles } = useTheme();
  const optimizationSettings = useOptimization();

  return (
    <div className={`${optimizationSettings.useAnimations ? 'animate-fade-in' : ''}`}>
      <h3 className={`text-xl font-semibold mb-4 ${styles.text}`}>All Questions</h3>
      <div className="space-y-4">
        {(questions ?? []).map((question, index) => {
          const isCorrect = isAnswerCorrect(question);
          return (
            <div 
              key={index} 
              className={`p-6 rounded-xl ${optimizationSettings.useShadowEffects ? 'shadow-sm' : 'border'} ${
                isCorrect 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800/50' 
                  : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50'
              }`}
            >
              <div className="flex justify-between">
                <span className={`font-medium ${styles.text}`}>Question {index + 1}</span>
                <span className={`${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
                  {isCorrect ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className={`mt-3 ${styles.text} font-medium`}>{question.question}</p>
              <div className={`mt-4 ${!isCorrect ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
                <div className={`${styles.background} p-3 rounded-lg border ${isCorrect ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                  <div className={`text-sm ${styles.text}`}>Your answer:</div>
                  <div className={`font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {question.userAnswer || '(No answer)'}
                  </div>
                </div>
                {!isCorrect && (
                  <div className={`${styles.background} p-3 rounded-lg border border-green-200 dark:border-green-800`}>
                    <div className={`text-sm ${styles.text}`}>Correct answer:</div>
                    <div className="font-medium text-green-600 dark:text-green-400">{question.correctAnswer}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizAllQuestionsTab;
