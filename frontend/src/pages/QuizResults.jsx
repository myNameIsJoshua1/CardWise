import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../services/flashcardService';
import { achievementService } from '../services/achievementService';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext'; // Added from new design
import AchievementNotification from '../components/AchievementNotification';
import { useOptimization } from '../components/PerformanceMonitor';

const DEFAULT_CONFETTI_COUNT = 24;

const QuizResults = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  // Using the safer destructuring from your old code
  const { user } = useUser() || {};
  // Using the theme hook from the new design
  const { styles } = useTheme(); 
  
  const [results, setResults] = useState(null);
  const [deckTitle, setDeckTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievement, setAchievement] = useState(null);

  const optimizationSettings = useOptimization();

  // Centralized achievement helper (Logic from old code)
  const tryUnlockAchievement = useCallback(async (userId, title, description) => {
    try {
      achievementService.saveAchievementsLocally(userId, { title, description });
    } catch (err) {
      console.warn('Local achievement save failed:', err);
    }

    if (!userId) return;

    try {
      await achievementService.unlockAchievement(userId, title, description);
    } catch (err) {
      console.info('Backend achievement unlock failed, falling back to local:', err);
    }
  }, []);

  // Fetch Data Effect (Logic from old code)
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const storedResults = sessionStorage.getItem(`quizResult-${deckId}`);
        if (!storedResults) {
          setError('Quiz results not found. Please take the quiz again.');
          return;
        }

        const quizResults = JSON.parse(storedResults);
        if (!mounted) return;
        setResults(quizResults);

        // Determine deck title if not present
        if (!quizResults.title) {
          try {
            const deckInfo = await flashcardService.getDeck(deckId);
            if (mounted) setDeckTitle(deckInfo?.title || 'Untitled Deck');
          } catch (err) {
            console.info('Failed to fetch deck title:', err);
            if (mounted) setDeckTitle('Untitled Deck');
          }
        } else {
          setDeckTitle(quizResults.title);
        }

        // Celebration for high scores
        const score = Number(quizResults.score ?? 0);
        if (score >= 80) {
          setTimeout(() => mounted && setShowCelebration(true), 500);
          setTimeout(() => mounted && setShowCelebration(false), 3500);
        }

        // Unlock achievements
        const userData = user || JSON.parse(localStorage.getItem('user') || 'null');
        const userId = userData?.id ?? userData?.userId;

        if (score === 100 && userId) {
          const perfectScoreAchievement = {
            title: 'Perfect Score',
            description: 'Achieved a perfect score on a quiz'
          };
          await tryUnlockAchievement(userId, perfectScoreAchievement.title, perfectScoreAchievement.description);
          if (mounted) setAchievement(perfectScoreAchievement);
        }

        if (score === 0 && userId) {
          const zeroScoreAchievement = {
            title: 'Learning Journey',
            description: 'Get 0% on a quiz'
          };
          await tryUnlockAchievement(userId, zeroScoreAchievement.title, zeroScoreAchievement.description);
          if (mounted) setAchievement(zeroScoreAchievement);
        }
      } catch (err) {
        console.error('Error loading quiz results:', err);
        if (mounted) setError('Failed to load quiz results.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [deckId, tryUnlockAchievement, user]);

  // Format time nicely: mm:ss
  const formatTime = useCallback((seconds) => {
    const s = Number(seconds) || 0;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
  }, []);

  // Grade helper
  const getGrade = useCallback((score) => {
    const s = Number(score ?? 0);
    if (s >= 90) return { letter: 'A', color: 'text-green-600', emoji: '🏆', description: 'Excellent!' };
    if (s >= 80) return { letter: 'B', color: 'text-blue-600', emoji: '🎉', description: 'Great job!' };
    if (s >= 70) return { letter: 'C', color: 'text-yellow-600', emoji: '👍', description: 'Good work!' };
    if (s >= 60) return { letter: 'D', color: 'text-orange-600', emoji: '🤔', description: 'Keep studying' };
    return { letter: 'F', color: 'text-red-600', emoji: '📚', description: 'Need improvement' };
  }, []);

  // Safe correctness check
  const isAnswerCorrect = useCallback((question) => {
    if (!question) return false;
    const userAnswer = question.userAnswer ?? '';
    if (!userAnswer) return false;
    if (question.questionType === 'identification') {
      return String(userAnswer).toLowerCase().trim() === String(question.correctAnswer ?? '').toLowerCase().trim();
    }
    return String(userAnswer) === String(question.correctAnswer);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    if (!results) return {
      percentComplete: 0,
      timePerQuestion: 0,
      accuracy: 0,
      averageScore: 0
    };

    const correctCount = Number(results.correctCount ?? 0);
    const totalQuestions = Number(results.totalQuestions ?? 0);
    const timeSpent = Number(results.timeSpent ?? 0);

    const answered = Math.max(0, Math.min(totalQuestions, correctCount));
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const timePerQuestion = totalQuestions > 0 ? (timeSpent / totalQuestions) : 0;

    return {
      percentComplete: totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0,
      timePerQuestion,
      accuracy,
      averageScore: Number(results.score ?? 0)
    };
  }, [results]);

  const groupedQuestions = useMemo(() => {
    const qs = results?.questions ?? [];
    const acc = { correct: [], incorrect: [] };
    for (const q of qs) {
      (isAnswerCorrect(q) ? acc.correct : acc.incorrect).push(q);
    }
    return acc;
  }, [results, isAnswerCorrect]);

  // Confetti setup
  const confettiPieces = useMemo(() => {
    const count = DEFAULT_CONFETTI_COUNT;
    const colors = ['#FFC107', '#FF5722', '#03A9F4', '#4CAF50'];
    return Array.from({ length: count }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.floor(Math.random() * 720)
    }));
  }, []);

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  const handleRetryQuiz = useCallback(() => {
    sessionStorage.removeItem(`quizResult-${deckId}`);
    navigate(`/quiz/${deckId}`);
  }, [navigate, deckId]);

  const handleBackToDeck = useCallback(() => navigate(`/decks/${deckId}`), [navigate, deckId]);

  // Keyboard support
  const handleTabKey = useCallback((e, tab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  }, []);

  // --- RENDERING (Using the New Design / Theme System) ---

  if (loading) {
    return (
      <div className={`fixed inset-0 ${styles.backgroundSecondary} flex justify-center items-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xl text-purple-600">Loading your results…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`fixed inset-0 ${styles.backgroundSecondary} flex items-center justify-center`}>
        <div className={`${styles.card} p-8 rounded-lg shadow-md max-w-md w-full`}>
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={handleBackToDeck} className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 py-3 rounded">
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`fixed inset-0 ${styles.backgroundSecondary} flex items-center justify-center`}>
        <div className={`${styles.card} p-8 rounded-lg shadow-md max-w-md w-full`}>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>No quiz results available. Please take the quiz first.</span>
          </div>
          <button onClick={handleBackToDeck} className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 py-3 rounded">Back to Deck</button>
        </div>
      </div>
    );
  }

  const grade = getGrade(results.score);

  return (
    <div className={`min-h-screen ${styles.backgroundSecondary} py-8 px-4`}>
      {/* Achievement Notification */}
      {achievement && (
        <AchievementNotification achievement={achievement} onClose={() => setAchievement(null)} />
      )}

      {showCelebration && (optimizationSettings.useAnimations || Number(results?.score ?? 0) === 100) && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center" aria-hidden>
          <div className="confetti-container">
            {confettiPieces.map((c, i) => (
              <div
                key={i}
                className="confetti"
                style={{ left: c.left, animationDelay: c.delay, backgroundColor: c.color, transform: `rotate(${c.rotate}deg)` }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className={`${styles.card} rounded-xl ${optimizationSettings.useShadowEffects ? 'shadow-xl' : styles.border} overflow-hidden`}>
          {/* Header */}
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
                <div className="text-xl font-semibold">{formatTime(results.timeSpent)}</div>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className={`px-4 border-b ${styles.borderSecondary}`}>
            <div className="flex overflow-x-auto -mb-px space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : `border-transparent ${styles.textMuted} hover:${styles.text} hover:border-gray-300`
                }`}
                onClick={() => handleTabChange('overview')}
                onKeyDown={(e) => handleTabKey(e, 'overview')}
              >
                Overview
              </button>

              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'incorrect'
                    ? 'border-purple-500 text-purple-600'
                    : `border-transparent ${styles.textMuted} hover:${styles.text} hover:border-gray-300`
                }`}
                onClick={() => handleTabChange('incorrect')}
                onKeyDown={(e) => handleTabKey(e, 'incorrect')}
              >
                Incorrect ({groupedQuestions.incorrect.length})
              </button>

              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-purple-500 text-purple-600'
                    : `border-transparent ${styles.textMuted} hover:${styles.text} hover:border-gray-300`
                }`}
                onClick={() => handleTabChange('all')}
                onKeyDown={(e) => handleTabKey(e, 'all')}
              >
                All Questions ({(results.questions ?? []).length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
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
                            <p className={`text-lg font-semibold ${styles.text}`}>{formatTime(Math.round(stats.timePerQuestion))}</p>
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
                            <li className="text-sm text-purple-600 font-medium cursor-pointer" onClick={() => handleTabChange('incorrect')}>
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
                </div>
              </div>
            )}

            {activeTab === 'incorrect' && (
              <div className={`${optimizationSettings.useAnimations ? 'animate-fade-in' : ''}`}>
                {groupedQuestions.incorrect.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className={`text-xl font-semibold mb-4 ${styles.text}`}>Incorrect Answers</h3>
                    {groupedQuestions.incorrect.map((question, index) => (
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
                          <div className="bg-white/60 dark:bg-gray-900/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            <div className={`text-sm ${styles.textMuted}`}>Your answer:</div>
                            <div className="font-medium text-red-600 dark:text-red-400">
                              {question.userAnswer || '(No answer)'}
                            </div>
                          </div>
                          <div className="bg-white/60 dark:bg-gray-900/40 p-3 rounded-lg border border-green-200 dark:border-green-800">
                            <div className={`text-sm ${styles.textMuted}`}>Correct answer:</div>
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
            )}

            {activeTab === 'all' && (
              <div className={`${optimizationSettings.useAnimations ? 'animate-fade-in' : ''}`}>
                <h3 className={`text-xl font-semibold mb-4 ${styles.text}`}>All Questions</h3>
                <div className="space-y-4">
                  {(results.questions ?? []).map((question, index) => {
                    const isCorrect = isAnswerCorrect(question);
                    return (
                      <div 
                        key={index} 
                        className={`p-6 rounded-xl ${optimizationSettings.useShadowEffects ? 'shadow-sm' : 'border'} ${
                          isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">Question {index + 1}</span>
                          <span className={`flex items-center ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
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
                        <p className="mt-3 text-gray-800 font-medium">{question.question}</p>
                        <div className={`mt-4 ${!isCorrect ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
                          <div className={`bg-white/60 p-3 rounded-lg border ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                            <div className="text-sm text-gray-500">Your answer:</div>
                            <div className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {question.userAnswer || '(No answer)'}
                            </div>
                          </div>
                          {!isCorrect && (
                            <div className="bg-white/60 p-3 rounded-lg border border-green-200">
                              <div className="text-sm text-gray-500">Correct answer:</div>
                              <div className="font-medium text-green-600">{question.correctAnswer}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
        .confetti-container { position: absolute; width: 100%; height: 100%; overflow: hidden; }
        .confetti { position: absolute; width: 10px; height: 10px; opacity: 0; animation: confetti-fall 3s ease-in-out forwards; transform-origin: center; }
        @keyframes confetti-fall { 0% { opacity: 1; top: -10px; transform: translateX(0) rotate(0deg); } 100% { opacity: 0; top: 100%; transform: translateX(calc(100px - 200px * var(--random, 0.5))) rotate(720deg); } }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; } @keyframes scale-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default QuizResults;