import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTimer } from '../../hooks/useTimer';
import { useQuizCompletion } from '../../hooks/useQuizCompletion';
import { generateQuestions } from '../../utils/quizGenerator';
import { QUIZ_CONFIG } from '../../constants/quiz';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import EmptyStateCard from '../../components/shared/EmptyStateCard';
import QuizHeader from '../../components/quiz/QuizHeader';
import QuizQuestion from '../../components/quiz/QuizQuestion';
import QuizNavigation from '../../components/quiz/QuizNavigation';
import QuizTallyModal from '../../components/quiz/QuizTallyModal';
import ProgressBar from '../../components/shared/ProgressBar';
import { quizStyles } from '../../styles/quizStyles';

const QuizMode = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { styles } = useTheme();
  
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { timeSpent, stopTimer } = useTimer(questions.length > 0);
  const { tallyState, completeQuiz } = useQuizCompletion();

  useEffect(() => {
    const fetchDeckAndGenerateQuestions = async () => {
      try {
        setIsLoading(true);
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        if (!deckId) {
          setError('No deck ID provided');
          return;
        }
        
        const deckInfo = await flashcardService.getDeck(deckId);
        setTitle(deckInfo.title);
        
        const flashcards = await flashcardService.getFlashcards(deckId);
        
        if (!flashcards || flashcards.length === 0) {
          setError('This deck has no flashcards. Please add some before taking a quiz.');
          return;
        }
        
        const questionCount = Math.min(QUIZ_CONFIG.DEFAULT_QUESTION_COUNT, flashcards.length);
        const quizQuestions = generateQuestions(flashcards, questionCount);
        setQuestions(quizQuestions);
      } catch (error) {
        console.error('Error preparing quiz:', error);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeckAndGenerateQuestions();
  }, [deckId, navigate, user]);
  
  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleCompleteQuiz();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleCloseQuiz = () => {
    if (Object.keys(answers).length > 0) {
      const confirmed = window.confirm("Are you sure you want to exit the quiz? Your progress will be lost.");
      if (!confirmed) return;
    }
    stopTimer();
    navigate(`/decks/${deckId}`);
  };
  const handleCompleteQuiz = async () => {
    const userId = user?.id || user?.userId;
    await completeQuiz(userId, deckId, title, questions, answers, timeSpent, stopTimer, navigate);
  };

  // Show loading state
  if (isLoading) return <LoadingState text={`Loading questions for ${title || 'your deck'}...`} />;

  // Show error state
  if (error) return <ErrorState message={error} onBack={() => navigate(`/decks/${deckId}`)} backText="Back to Deck" />;

  // If tallying scores, show the tallying animation
  if (tallyState.isTallyingScore) {
    return <QuizTallyModal tallyState={tallyState} totalQuestions={questions.length} />;
  }

  // Show the quiz
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className={quizStyles.overlay}>
        <EmptyStateCard
          message="There are no questions available for this quiz."
          actionText="Back to Deck"
          onAction={() => navigate(`/decks/${deckId}`)}
        />
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 ${styles.modalBackdrop} backdrop-blur-sm flex items-center justify-center z-50`}>
      <div className={`${styles.modal} ${quizStyles.modalWide}`}>
        <QuizHeader 
          title={title} 
          timeSpent={timeSpent} 
          onClose={handleCloseQuiz} 
        />
        
        <div className="p-6">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
            showPercentage={false}
            barColor="bg-gradient-to-r from-purple-600 to-orange-500"
          />
          
          <QuizQuestion
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answer={answers[currentQuestion.id]}
            onAnswerChange={handleAnswer}
            styles={styles}
          />
          
          <QuizNavigation
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onPrevious={handlePrevQuestion}
            onNext={handleNextQuestion}
            styles={styles}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
