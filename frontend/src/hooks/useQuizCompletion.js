import { useState } from 'react';
import { quizService } from '../services/quizService';
import { progressService } from '../services/progressService';
import { reviewService } from '../services/reviewService';
import { achievementService } from '../services/achievementService';
import { calculateQuizResults } from '../utils/quizGenerator';
import { ACHIEVEMENT_CHECKS, QUESTION_TYPES } from '../constants/quiz';

export const useQuizCompletion = () => {
  const [tallyState, setTallyState] = useState({
    isTallyingScore: false,
    tallyProgress: 0,
    tallyStep: '',
    tallyScore: 0,
    correctTally: 0,
    tallyComplete: false
  });

  const animateScore = (targetScore, targetCorrect, callback) => {
    let currentTally = 0;
    let currentCorrect = 0;
    
    const animate = () => {
      let updated = false;
      
      if (currentTally < targetScore) {
        currentTally = Math.min(currentTally + 2, targetScore);
        updated = true;
      }
      
      if (currentCorrect < targetCorrect) {
        currentCorrect = Math.min(currentCorrect + 1, targetCorrect);
        updated = true;
      }
      
      if (updated) {
        setTallyState(prev => ({
          ...prev,
          tallyScore: currentTally,
          correctTally: currentCorrect
        }));
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    };
    
    requestAnimationFrame(animate);
  };

  const saveQuizResults = async (userId, deckId, title, questions, answers, timeSpent) => {
    const results = calculateQuizResults(questions, answers);
    const { correctCount, incorrectCount, correctAnswers, incorrectAnswers, score } = results;

    // Store results in sessionStorage
    const quizResultData = {
      deckId,
      title,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      timeSpent,
      score,
      date: new Date().toISOString(),
      questions: questions.map(q => ({
        question: q.question,
        questionType: q.questionType,
        correctAnswer: q.correctAnswer,
        userAnswer: answers[q.id] || ""
      }))
    };
    
    sessionStorage.setItem(`quizResult-${deckId}`, JSON.stringify(quizResultData));

    // Save to backend
    const apiPromises = [];
    
    apiPromises.push(
      quizService.completeQuiz(userId, deckId, score)
    );

    // Save progress for each question
    const progressPromises = questions.map(question => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return Promise.resolve();
      
      const isCorrect = question.questionType === QUESTION_TYPES.IDENTIFICATION
        ? userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
        : userAnswer === question.correctAnswer;
      
      const questionScore = isCorrect ? 100 : 0;
      
      return progressService.createProgress({
        flashCardId: question.id,
        score: questionScore,
        timeSpent: Math.round(timeSpent / questions.length),
        scoreComparison: progressService.getScoreComparison(questionScore)
      }).catch(err => {
        progressService.saveProgressLocally(userId, {
          flashCardId: question.id,
          score: questionScore,
          timeSpent: Math.round(timeSpent / questions.length),
          scoreComparison: progressService.getScoreComparison(questionScore)
        });
        return null;
      });
    });
    
    apiPromises.push(Promise.allSettled(progressPromises));

    // Track study time
    apiPromises.push(
      progressService.trackStudyTime(userId, Math.ceil(timeSpent / 60))
        .catch(err => console.error('Error tracking study time:', err))
    );

    // Save reviews
    const reviewPromises = [
      ...incorrectAnswers.map(item => 
        reviewService.createReview({
          flashCardId: item.flashCardId,
          reviewCorrectAnswer: item.correctAnswer,
          reviewIncorrectAnswer: item.userAnswer
        }).catch(() => {
          reviewService.saveReviewLocally(userId, {
            flashCardId: item.flashCardId,
            questionText: item.question,
            reviewCorrectAnswer: item.correctAnswer,
            reviewIncorrectAnswer: item.userAnswer,
            deckId,
            deckTitle: title
          });
          return null;
        })
      ),
      ...correctAnswers.slice(0, 2).map(item =>
        reviewService.createReview({
          flashCardId: item.flashCardId,
          reviewCorrectAnswer: item.correctAnswer,
          reviewIncorrectAnswer: null
        }).catch(() => null)
      )
    ];
    
    apiPromises.push(Promise.allSettled(reviewPromises));

    // Save review summary locally
    reviewService.saveReviewLocally(userId, {
      type: 'quiz_summary',
      deckId,
      deckTitle: title,
      score,
      correctCount,
      totalQuestions: questions.length,
      timeSpent
    });

    // Check achievements
    const achievementChecks = Object.values(ACHIEVEMENT_CHECKS).filter(ach => 
      ach.condition(score, timeSpent, questions.length)
    );
    
    const achievementPromises = achievementChecks.map(async (ach) => {
      try {
        const result = await achievementService.unlockAchievement(userId, ach.title, ach.description);
        return { ...ach, ...result };
      } catch (error) {
        achievementService.saveAchievementsLocally(userId, { title: ach.title, description: ach.description });
        return { ...ach, error: true };
      }
    });
    
    const achievementResults = await Promise.allSettled(achievementPromises);
    const newlyUnlocked = achievementResults
      .filter(r => r.status === 'fulfilled' && r.value?.newlyUnlocked)
      .map(r => r.value);

    apiPromises.push(Promise.resolve(newlyUnlocked));

    await Promise.allSettled(apiPromises);

    return { score, correctCount };
  };

  const completeQuiz = async (userId, deckId, title, questions, answers, timeSpent, stopTimer, navigate) => {
    try {
      if (!userId || !deckId) return;
      
      stopTimer();
      
      // Start tallying
      setTallyState({
        isTallyingScore: true,
        tallyProgress: 10,
        tallyStep: 'Calculating results...',
        tallyScore: 0,
        correctTally: 0,
        tallyComplete: false
      });

      const results = calculateQuizResults(questions, answers);
      
      setTallyState(prev => ({ ...prev, tallyProgress: 30, tallyStep: 'Tallying answers...' }));
      
      animateScore(results.score, results.correctCount);
      
      setTallyState(prev => ({ ...prev, tallyProgress: 50, tallyStep: 'Saving quiz results...' }));
      
      await saveQuizResults(userId, deckId, title, questions, answers, timeSpent);
      
      setTallyState(prev => ({ ...prev, tallyProgress: 70, tallyStep: 'Tracking flashcard progress...' }));
      setTallyState(prev => ({ ...prev, tallyProgress: 85, tallyStep: 'Updating learning history...' }));
      setTallyState(prev => ({ ...prev, tallyProgress: 90, tallyStep: 'Checking achievements...' }));
      
      setTallyState({
        isTallyingScore: true,
        tallyProgress: 100,
        tallyStep: 'All done!',
        tallyScore: results.score,
        correctTally: results.correctCount,
        tallyComplete: true
      });
      
      setTimeout(() => {
        navigate(`/quiz-results/${deckId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error completing quiz:', error);
      setTallyState(prev => ({ ...prev, isTallyingScore: false }));
      throw error;
    }
  };

  return { tallyState, completeQuiz };
};
