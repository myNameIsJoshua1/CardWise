export const QUESTION_TYPES = {
  TRUE_FALSE: 'true-false',
  MULTIPLE_CHOICE: 'multiple-choice',
  IDENTIFICATION: 'identification'
};

export const QUIZ_CONFIG = {
  DEFAULT_QUESTION_COUNT: 10,
  DEFAULT_DIFFICULTY: 'normal',
  DEFAULT_TYPE: 'flashcards'
};

export const ACHIEVEMENT_CHECKS = {
  QUIZ_TAKER: {
    title: 'Quiz Taker',
    description: 'Completed your first quiz',
    condition: () => true
  },
  PERFECT_SCORE: {
    title: 'Perfect Score',
    description: 'Achieved a perfect score on a quiz',
    condition: (score) => score === 100
  },
  HIGH_ACHIEVER: {
    title: 'High Achiever',
    description: 'Scored 80% or higher on a quiz',
    condition: (score) => score >= 80
  },
  SPEED_LEARNER: {
    title: 'Speed Learner',
    description: 'Completed a quiz in record time',
    condition: (score, timeSpent, questionCount) => timeSpent < 120 && questionCount >= 5
  }
};
