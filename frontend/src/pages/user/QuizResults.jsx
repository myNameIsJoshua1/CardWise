import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useOptimization } from '../../components/PerformanceMonitor';
import { useQuizResults, useQuizStats, useQuizGrading, useAnswerChecker, useGroupedQuestions } from '../../hooks/useQuizResults';
import { formatTimeMinutesSeconds } from '../../utils/formatters';
import { generateConfettiPieces } from '../../utils/confetti';
import AchievementNotification from '../../components/AchievementNotification';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import QuizConfetti from '../../components/quiz/QuizConfetti';
import QuizOverviewTab from '../../components/quiz/QuizOverviewTab';
import QuizIncorrectTab from '../../components/quiz/QuizIncorrectTab';
import QuizAllQuestionsTab from '../../components/quiz/QuizAllQuestionsTab';

const QuizResults = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser() || {};
  const { styles } = useTheme(); 
  const optimizationSettings = useOptimization();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const { results, deckTitle, loading, error, showCelebration, achievement, setAchievement } = useQuizResults(deckId, user);
  const stats = useQuizStats(results);
  const getGrade = useQuizGrading();
  const isAnswerCorrect = useAnswerChecker();
  const groupedQuestions = useGroupedQuestions(results, isAnswerCorrect);
  
  const confettiPieces = generateConfettiPieces(100);

  const selectTab = (tab) => () => setActiveTab(tab);

  const handleRetryQuiz = () => {
    sessionStorage.removeItem(`quizResult-${deckId}`);
    navigate(`/quiz/${deckId}`);
  };

  const handleBackToDeck = () => navigate(`/decks/${deckId}`);

  if (loading) {
    return (
      <div className={`min-h-screen ${styles.background} flex items-center justify-center`}>
        <LoadingState text="Loading quiz results..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${styles.background} flex items-center justify-center`}>
        <ErrorState 
          message={error} 
          onBack={() => navigate(`/decks/${deckId}`)} 
          backText="Back to Deck" 
        />
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`min-h-screen ${styles.background} flex items-center justify-center`}>
        <ErrorState 
          message="No quiz results available." 
          onBack={handleBackToDeck} 
          backText="Back to Deck" 
        />
      </div>
    );
  }

  const grade = getGrade(results.score);

  return (
    <div className={`min-h-screen ${styles.background} py-8 px-4`}>
      {achievement && (
        <AchievementNotification achievement={achievement} onClose={() => setAchievement(null)} />
      )}

      <QuizConfetti 
        show={showCelebration && (optimizationSettings.useAnimations || Number(results?.score ?? 0) === 100)} 
        pieces={confettiPieces} 
      />

      <div className="max-w-3xl mx-auto">
        <div className={`${styles.card} rounded-xl ${optimizationSettings.useShadowEffects ? 'shadow-xl' : styles.border} overflow-hidden`}>
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
            <p className="text-white/80">{deckTitle}</p>

            <div className="mt-8 flex flex-col md:flex-row items-center justify-between">
              <div className="relative flex items-center">
                <div className={`text-7xl font-bold transition-all duration-500 ${optimizationSettings.useAnimations ? 'animate-scale-in' : ''}`}>{results.score}%</div>
                <div className={`ml-4 flex flex-col items-start ${optimizationSettings.useAnimations ? 'animate-fade-in' : ''}`}>
                  <div className={`${grade.color} text-3xl font-bold bg-white/20 px-2 rounded backdrop-blur-sm`}>{grade.letter}</div>
                  <div className="text-white mt-1 flex items-center">
                    <span className="text-2xl mr-2">{grade.emoji}</span> 
                    <span>{grade.description}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-0 text-center md:text-right">
                <div className="text-white/80 mb-1">Completed</div>
                <div className="text-xl font-semibold">{results.correctCount ?? 0} of {results.totalQuestions ?? 0} questions</div>
                <div className="text-white/80 mt-2 mb-1">Time Taken</div>
                <div className="text-xl font-semibold">{formatTimeMinutesSeconds(results.timeSpent)}</div>
              </div>
            </div>
          </div>
          
          <div className={`px-4 border-b ${styles.borderSecondary}`}>
            <div className="flex overflow-x-auto -mb-px space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : `border-transparent ${styles.textMuted} hover:${styles.text} hover:border-gray-300`
                }`}
                onClick={selectTab('overview')}
              >
                Overview
              </button>

              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'incorrect'
                    ? 'border-purple-500 text-purple-600'
                    : `border-transparent ${styles.textMuted} hover:${styles.text} hover:border-gray-300`
                }`}
                onClick={selectTab('incorrect')}
              >
                Incorrect ({groupedQuestions.incorrect.length})
              </button>

              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-purple-500 text-purple-600'
                    : `border-transparent ${styles.textMuted} hover:${styles.text} hover:border-gray-300`
                }`}
                onClick={selectTab('all')}
              >
                All Questions ({(results.questions ?? []).length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <QuizOverviewTab
                results={results}
                stats={stats}
                grade={grade}
                groupedQuestions={groupedQuestions}
                onRetry={handleRetryQuiz}
                onBack={handleBackToDeck}
                onTabChange={setActiveTab}
              />
            )}

            {activeTab === 'incorrect' && (
              <QuizIncorrectTab questions={groupedQuestions.incorrect} />
            )}

            {activeTab === 'all' && (
              <QuizAllQuestionsTab 
                questions={results.questions} 
                isAnswerCorrect={isAnswerCorrect} 
              />
            )}
          </div>
          
          {(activeTab === 'incorrect' || activeTab === 'all') && (
            <div className={`p-6 border-t ${styles.borderSecondary} ${styles.backgroundSecondary} flex justify-between`}>
              <button 
                onClick={handleBackToDeck}
                className={`px-4 py-2 rounded transition-colors ${styles.buttonSecondary}`}
              >
                Back to Deck
              </button>
              <button 
                onClick={handleRetryQuiz}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded shadow-sm hover:shadow transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style jsx="true">{`
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; } 
        @keyframes scale-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; } 
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default QuizResults;
