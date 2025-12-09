import React from 'react';
import { quizStyles } from '../../styles/quizStyles';

/**
 * Quiz question display with answer input
 */
const QuizQuestion = ({ 
  question, 
  questionIndex, 
  totalQuestions, 
  answer, 
  onAnswerChange, 
  styles 
}) => {
  const QUESTION_TYPES = {
    IDENTIFICATION: 'identification',
    MULTIPLE_CHOICE: 'multiple-choice',
    TRUE_FALSE: 'true-false'
  };

  return (
    <div className="mb-6">
      <div className={quizStyles.questionHeader}>
        <h4 className={`${quizStyles.questionLabel} ${styles.textSecondary}`}>
          Question {questionIndex + 1} of {totalQuestions}
        </h4>
        <span className={`${quizStyles.questionLabel} text-purple-600 dark:text-purple-400`}>
          {question.questionType === QUESTION_TYPES.IDENTIFICATION ? 'Identification' : 
           question.questionType === QUESTION_TYPES.MULTIPLE_CHOICE ? 'Multiple Choice' : 'True/False'}
        </span>
      </div>
      
      <h3 className={`${quizStyles.questionTitle} ${styles.text}`}>
        {question.question}
      </h3>
      
      {question.questionType === QUESTION_TYPES.IDENTIFICATION && (
        <div className="mb-4">
          <label htmlFor="answer" className={`${quizStyles.answerLabel} ${styles.text}`}>
            Your Answer:
          </label>
          <textarea
            id="answer"
            rows="3"
            className={`${quizStyles.textarea} ${styles.input}`}
            value={answer || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
          />
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;
