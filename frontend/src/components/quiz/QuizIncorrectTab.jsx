import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useOptimization } from '../../components/PerformanceMonitor';

const QuizIncorrectTab = ({ questions }) => {
  const { styles } = useTheme();
  const optimizationSettings = useOptimization();

  return (
    <div className={`${optimizationSettings.useAnimations ? 'animate-fade-in' : ''}`}>
      {questions.length > 0 ? (
        <div className="space-y-4">
          <h3 className={`text-xl font-semibold mb-4 ${styles.text}`}>Incorrect Answers</h3>
          {questions.map((question, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-xl ${optimizationSettings.useShadowEffects ? 'shadow-sm' : 'border'} border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50`}
            >
              <div className="flex justify-between">
                <span className={`font-medium ${styles.text}`}>Question {index + 1}</span>
                <span className="text-red-600 dark:text-red-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Incorrect
                </span>
              </div>
              <p className={`mt-3 ${styles.text} font-medium`}>{question.question}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${styles.background} p-3 rounded-lg border border-red-200 dark:border-red-800`}>
                  <div className={`text-sm ${styles.text}`}>Your answer:</div>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    {question.userAnswer || '(No answer)'}
                  </div>
                </div>
                <div className={`${styles.background} p-3 rounded-lg border border-green-200 dark:border-green-800`}>
                  <div className={`text-sm ${styles.text}`}>Correct answer:</div>
                  <div className="font-medium text-green-600 dark:text-green-400">{question.correctAnswer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${styles.text}`}>Perfect Score!</h3>
          <p className={`${styles.textSecondary}`}>You answered all questions correctly. Great job!</p>
        </div>
      )}
    </div>
  );
};

export default QuizIncorrectTab;
