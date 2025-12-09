import { useState, useEffect, useCallback, useMemo } from 'react';
import { achievementService } from '../services/achievementService';

export const useQuizResults = (deckId, user) => {
  const [results, setResults] = useState(null);
  const [deckTitle, setDeckTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievement, setAchievement] = useState(null);

  const tryUnlockAchievement = useCallback(async (userId, title, description) => {
    if (!userId) return null;

    try {
      const result = await achievementService.unlockAchievement(userId, title, description);
      if (result?.newlyUnlocked) {
        return result;
      }
      return null;
    } catch (err) {
      console.error('Achievement unlock error:', err);
      achievementService.saveAchievementsLocally(userId, { title, description });
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const storedResults = sessionStorage.getItem(`quizResult-${deckId}`);
        
        if (!storedResults) {
          setError('No quiz results found. Please take the quiz first.');
          setLoading(false);
          return;
        }

        const parsedResults = JSON.parse(storedResults);
        
        if (mounted) {
          setResults(parsedResults);
          setDeckTitle(parsedResults.title || 'Quiz');
          
          const score = parsedResults.score ?? 0;
          if (score >= 70) {
            setShowCelebration(true);
          }

          // Check achievements
          if (user) {
            const userId = user.id || user.userId;
            
            const achievementsToCheck = [
              { title: 'Quiz Taker', description: 'Completed your first quiz', condition: true },
              { title: 'Perfect Score', description: 'Achieved a perfect score on a quiz', condition: score === 100 },
              { title: 'High Achiever', description: 'Scored 80% or higher on a quiz', condition: score >= 80 }
            ];

            for (const ach of achievementsToCheck) {
              if (ach.condition) {
                const result = await tryUnlockAchievement(userId, ach.title, ach.description);
                if (result && mounted) {
                  setAchievement(result);
                  break;
                }
              }
            }
          }
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading quiz results:', err);
        if (mounted) {
          setError('Failed to load quiz results. The data may be corrupted.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [deckId, tryUnlockAchievement, user]);

  return { results, deckTitle, loading, error, showCelebration, achievement, setAchievement };
};

export const useQuizStats = (results) => {
  return useMemo(() => {
    if (!results) {
      return {
        correctCount: 0,
        totalQuestions: 0,
        timeSpent: 0,
        accuracy: 0,
        percentComplete: 0,
        timePerQuestion: 0
      };
    }

    const correctCount = Number(results.correctCount ?? 0);
    const totalQuestions = Number(results.totalQuestions ?? 0);
    const timeSpent = Number(results.timeSpent ?? 0);

    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const percentComplete = 100;
    const timePerQuestion = totalQuestions > 0 ? timeSpent / totalQuestions : 0;

    return {
      correctCount,
      totalQuestions,
      timeSpent,
      accuracy,
      percentComplete,
      timePerQuestion
    };
  }, [results]);
};

export const useQuizGrading = () => {
  return useCallback((score) => {
    const s = Number(score ?? 0);
    if (s >= 90) return { letter: 'A', color: 'text-green-600', emoji: '🌟', description: 'Outstanding!' };
    if (s >= 80) return { letter: 'B', color: 'text-blue-600', emoji: '👍', description: 'Great job!' };
    if (s >= 70) return { letter: 'C', color: 'text-yellow-600', emoji: '👌', description: 'Good work!' };
    if (s >= 60) return { letter: 'D', color: 'text-orange-600', emoji: '📖', description: 'Keep practicing' };
    return { letter: 'F', color: 'text-red-600', emoji: '📚', description: 'Need improvement' };
  }, []);
};

export const useAnswerChecker = () => {
  return useCallback((question) => {
    if (!question) return false;
    const userAnswer = question.userAnswer ?? '';
    if (!userAnswer) return false;
    if (question.questionType === 'identification') {
      return userAnswer.toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
    }
    return String(userAnswer) === String(question.correctAnswer);
  }, []);
};

export const useGroupedQuestions = (results, isAnswerCorrect) => {
  return useMemo(() => {
    if (!results?.questions) {
      return { correct: [], incorrect: [] };
    }

    const correct = results.questions.filter(q => isAnswerCorrect(q));
    const incorrect = results.questions.filter(q => !isAnswerCorrect(q));

    return { correct, incorrect };
  }, [results, isAnswerCorrect]);
};
