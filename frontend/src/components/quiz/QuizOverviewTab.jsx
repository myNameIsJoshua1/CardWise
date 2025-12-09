import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useOptimization } from '../../components/PerformanceMonitor';
import { formatTimeMinutesSeconds } from '../../utils/formatters';

const QuizOverviewTab = ({ results, stats, grade, groupedQuestions, onRetry, onBack, onTabChange }) => {
  const { styles } = useTheme();
  const optimizationSettings = useOptimization();

  return (
    <div className={`${optimizationSettings.useAnimations ? 'animate-fade-in' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`${styles.backgroundSecondary} rounded-xl p-6 ${optimizationSettings.useShadowEffects ? 'shadow-md' : styles.border}`}>
          <h3 className={`text-lg font-semibold mb-4 ${styles.text}`}>Performance Summary</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm font-medium ${styles.textSecondary}`}>Accuracy</span>
                <span className={`text-sm font-medium ${styles.textSecondary}`}>{stats.accuracy.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.accuracy}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm font-medium ${styles.textSecondary}`}>Completion</span>
                <span className={`text-sm font-medium ${styles.textSecondary}`}>{stats.percentComplete}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.percentComplete}%` }}></div>
              </div>
            </div>

            <div className="pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`text-sm ${styles.textMuted}`}>Time per question</span>
                  <p className={`text-lg font-semibold ${styles.text}`}>{formatTimeMinutesSeconds(Math.round(stats.timePerQuestion))}</p>
                </div>
                <div>
                  <span className={`text-sm ${styles.textMuted}`}>Score rating</span>
                  <p className="text-lg font-semibold flex items-center">
                    {grade.emoji} <span className={`ml-1 ${grade.color}`}>{grade.letter}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`${styles.backgroundSecondary} rounded-xl p-6 ${optimizationSettings.useShadowEffects ? 'shadow-md' : styles.border}`}>
          <h3 className={`text-lg font-semibold mb-4 ${styles.text}`}>Question Breakdown</h3>
          
          <div className="relative pt-1 mb-6">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  Correct
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-green-600">
                  {results.correctCount}/{results.totalQuestions}
                </span>
              </div>
            </div>
            <div className="flex h-4 mb-4 overflow-hidden rounded-lg bg-gray-200">
              <div style={{ width: `${(results.totalQuestions > 0 ? (results.correctCount / results.totalQuestions) * 100 : 0)}%` }} className="bg-green-500"></div>
            </div>
            
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                  Incorrect
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-red-600">
                  {(results.totalQuestions ?? 0) - (results.correctCount ?? 0)}/{results.totalQuestions ?? 0}
                </span>
              </div>
            </div>
            <div className="flex h-4 overflow-hidden rounded-lg bg-gray-200">
              <div style={{ width: `${(results.totalQuestions > 0 ? ((results.totalQuestions - results.correctCount) / results.totalQuestions) * 100 : 0)}%` }} className="bg-red-500"></div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className={`font-medium text-sm ${styles.text} mb-2`}>Areas to focus on:</h4>
            {groupedQuestions.incorrect.length > 0 ? (
              <ul className="space-y-1">
                {groupedQuestions.incorrect.slice(0, 3).map((q, i) => (
                  <li key={i} className={`text-sm ${styles.textMuted} flex items-start`}>
                    <span className="mr-2 text-red-500">•</span>
                    <span className="line-clamp-1">{q.question}</span>
                  </li>
                ))}
                {groupedQuestions.incorrect.length > 3 && (
                  <li className="text-sm text-purple-600 font-medium cursor-pointer" onClick={() => onTabChange('incorrect')}>
                    View all incorrect answers →
                  </li>
                )}
              </ul>
            ) : (
              <p className={`text-sm ${styles.textSecondary}`}>Great job! You answered all questions correctly.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <div>
          <div className={`text-sm ${styles.textMuted} mb-1`}>Date Taken</div>
          <div className={`font-medium ${styles.text}`}>{results.date ? new Date(results.date).toLocaleDateString() : '—'}</div>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={onBack}
            className={`px-4 py-2 rounded transition-colors ${styles.buttonSecondary}`}
          >
            Back to Deck
          </button>
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded shadow-sm hover:shadow transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizOverviewTab;
