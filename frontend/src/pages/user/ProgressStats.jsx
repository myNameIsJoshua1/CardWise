import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useProgressData } from '../../hooks/useProgressData';
import { formatTime } from '../../utils/formatters';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import StatCard from '../../components/shared/StatCard';
import { progressStyles, scoreColors } from '../../styles/progressStyles';

const ProgressStats = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { progressData, flashcardMap, loading, error, totalDecks, totalLearnedCards, stats } = useProgressData(user);

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
      }
    }
  }, [user, navigate]);
  
  // Get color class based on score comparison
  const getScoreColorClass = (comparison) => scoreColors[comparison] || 'text-gray-600 dark:text-gray-400';
  
  // Get flashcard question text by ID
  const getFlashcardText = (flashcardId) => {
    if (!flashcardId) return 'Unknown Card';
    if (flashcardMap[flashcardId]) {
      return flashcardMap[flashcardId].question || flashcardMap[flashcardId].term || 'Unknown Question';
    }
    return `Card #${flashcardId.substring(0, 6)}...`;
  };
  
  if (loading) return <LoadingState text="Loading progress data..." />;
  
  if (error) return <ErrorState message={error} onBack={() => navigate('/dashboard')} backText="Back to Dashboard" />;

  return (
    <div className={progressStyles.container}>
      <h1 className="text-white text-2xl font-bold mb-6">Your Learning Progress</h1>
      
      {/* Summary Stats */}
      <div className={progressStyles.summaryCard}>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Overall Progress Summary</h2>
        
        <div className={progressStyles.statsGrid}>
          <StatCard label="Decks Created" value={totalDecks} />
          <StatCard label="Cards Learned" value={totalLearnedCards} bgColor="bg-purple-50" darkBgColor="bg-purple-900/30" />
          <StatCard label="Cards Studied" value={stats.totalCards} bgColor="bg-green-50" darkBgColor="bg-green-900/30" />
          <StatCard label="Average Score" value={`${stats.averageScore}%`} bgColor="bg-orange-50" darkBgColor="bg-orange-900/30" />
        </div>
        
        {/* Performance Distribution */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2 dark:text-white">Performance Distribution</h3>
          
          <div className={progressStyles.performanceBar}>
            <div className="bg-green-500" style={{ width: `${stats.totalCards > 0 ? (stats.excellentCount / stats.totalCards) * 100 : 0}%` }} title={`Excellent: ${stats.excellentCount} cards`} />
            <div className="bg-blue-500" style={{ width: `${stats.totalCards > 0 ? (stats.goodCount / stats.totalCards) * 100 : 0}%` }} title={`Good: ${stats.goodCount} cards`} />
            <div className="bg-yellow-500" style={{ width: `${stats.totalCards > 0 ? (stats.fairCount / stats.totalCards) * 100 : 0}%` }} title={`Fair: ${stats.fairCount} cards`} />
            <div className="bg-red-500" style={{ width: `${stats.totalCards > 0 ? (stats.needsImprovementCount / stats.totalCards) * 100 : 0}%` }} title={`Needs Improvement: ${stats.needsImprovementCount} cards`} />
          </div>
          
          <div className="flex justify-between text-xs mt-1">
            <div className={progressStyles.legendItem}>
              <div className={`${progressStyles.legendDot} bg-green-500`} />
              <span className="dark:text-gray-300">Excellent ({stats.excellentCount})</span>
            </div>
            <div className={progressStyles.legendItem}>
              <div className={`${progressStyles.legendDot} bg-blue-500`} />
              <span className="dark:text-gray-300">Good ({stats.goodCount})</span>
            </div>
            <div className={progressStyles.legendItem}>
              <div className={`${progressStyles.legendDot} bg-yellow-500`} />
              <span className="dark:text-gray-300">Fair ({stats.fairCount})</span>
            </div>
            <div className={progressStyles.legendItem}>
              <div className={`${progressStyles.legendDot} bg-red-500`} />
              <span className="dark:text-gray-300">Needs Improvement ({stats.needsImprovementCount})</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Progress History */}
      <div className={progressStyles.detailsCard}>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Detailed Progress History</h2>
        
        {progressData.length === 0 ? (
          <p className={progressStyles.emptyMessage}>No progress data yet. Start studying to track your progress!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={progressStyles.table}>
              <thead>
                <tr className={progressStyles.tableHeader}>
                  <th className="py-2 px-4 text-left dark:text-white">Flashcard</th>
                  <th className="py-2 px-4 text-left dark:text-white">Score</th>
                  <th className="py-2 px-4 text-left dark:text-white">Time Spent</th>
                  <th className="py-2 px-4 text-left dark:text-white">Rating</th>
                  <th className="py-2 px-4 text-left dark:text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {progressData.slice(0, 20).map((entry, index) => (
                  <tr key={index} className={progressStyles.tableRow(index)}>
                    <td className="py-2 px-4 dark:text-gray-300">{getFlashcardText(entry.flashCardId)}</td>
                    <td className="py-2 px-4 dark:text-gray-300">{entry.score}%</td>
                    <td className="py-2 px-4 dark:text-gray-300">{formatTime(entry.timeSpent)}</td>
                    <td className={`py-2 px-4 ${getScoreColorClass(entry.scoreComparison)}`}>
                      {entry.scoreComparison}
                    </td>
                    <td className="py-2 px-4 text-sm dark:text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {progressData.length > 20 && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                Showing 20 of {progressData.length} entries
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressStats; 
