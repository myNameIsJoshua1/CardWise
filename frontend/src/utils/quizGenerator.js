import { QUESTION_TYPES } from '../constants/quiz';

export const generateQuestions = (flashcards, questionCount) => {
  const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
  const selectedFlashcards = shuffled.slice(0, questionCount);
  
  return selectedFlashcards.map(card => ({
    id: card.id,
    question: card.term,
    questionType: QUESTION_TYPES.IDENTIFICATION,
    correctAnswer: card.definition
  }));
};

export const calculateQuizResults = (questions, answers) => {
  let correctCount = 0;
  let incorrectCount = 0;
  const correctAnswers = [];
  const incorrectAnswers = [];
  
  questions.forEach(question => {
    const userAnswer = answers[question.id];
    
    if (!userAnswer) {
      incorrectCount++;
      incorrectAnswers.push({
        flashCardId: question.id,
        question: question.question,
        correctAnswer: question.correctAnswer,
        userAnswer: ''
      });
      return;
    }
    
    const isCorrect = question.questionType === QUESTION_TYPES.IDENTIFICATION
      ? userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
      : userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correctCount++;
      correctAnswers.push({
        flashCardId: question.id,
        question: question.question,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer
      });
    } else {
      incorrectCount++;
      incorrectAnswers.push({
        flashCardId: question.id,
        question: question.question,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer
      });
    }
  });
  
  const score = Math.round((correctCount / questions.length) * 100);
  
  return {
    correctCount,
    incorrectCount,
    correctAnswers,
    incorrectAnswers,
    score
  };
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
