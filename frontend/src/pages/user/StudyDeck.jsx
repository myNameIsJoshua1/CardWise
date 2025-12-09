import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useOptimization } from '../../components/PerformanceMonitor';
import { useDeckData } from '../../hooks/useDeckData';
import { useStudySession } from '../../hooks/useStudySession';
import AchievementNotification from '../../components/AchievementNotification';
import ProgressBar from '../../components/shared/ProgressBar';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import EmptyStateCard from '../../components/shared/EmptyStateCard';
import FlashcardFlip from '../../components/flashcard/FlashcardFlip';
import FlashcardControls from '../../components/flashcard/FlashcardControls';

const StudyDeck = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { styles } = useTheme();
    const optimizationSettings = useOptimization();
    
    const { flashcards, deckTitle, loading, error } = useDeckData(deckId);
    const {
        currentIndex,
        flipped,
        cardsLearned,
        achievement,
        currentFlashcard,
        progressPercentage,
        handleNext,
        handlePrevious,
        toggleFlip,
        handleMarkLearned,
        setAchievement
    } = useStudySession(flashcards, user);

    const handleClose = useCallback(() => {
        navigate(`/decks/${deckId}`);
    }, [navigate, deckId]);

    if (loading) return <LoadingState text="Loading flashcards..." />;

    if (error) return <ErrorState message={error} onBack={() => navigate(-1)} backText="Go Back" />;

    if (flashcards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
                <EmptyStateCard
                    message="This deck doesn't have any flashcards yet."
                    actionText="Back to Deck"
                    onAction={handleClose}
                />
            </div>
        );
    }

    if (!currentFlashcard) return null;

    return (
        <div className={`fixed inset-0 ${styles.modalBackdrop} backdrop-blur-sm flex items-center justify-center z-50`}>
            {achievement && (
                <AchievementNotification achievement={achievement} onClose={() => setAchievement(null)} />
            )}
            <div className={`${styles.modal} rounded-lg w-full max-w-md mx-4 overflow-hidden ${optimizationSettings.useShadowEffects ? 'shadow-xl' : styles.border}`}>
                <div className="p-4 flex justify-between items-center bg-gradient-to-r from-purple-600 to-orange-500">
                    <h3 className="text-lg font-bold text-white">{deckTitle} - Study Mode</h3>
                    <button 
                        className="text-white hover:text-gray-200 transition-colors"
                        onClick={handleClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                
                <div className="px-5 pt-3">
                    <ProgressBar
                        current={cardsLearned}
                        total={flashcards.length}
                        label={`Progress: ${cardsLearned}/${flashcards.length} cards learned`}
                        barColor="bg-green-500"
                        animate={optimizationSettings.useAnimations}
                    />
                </div>
                
                <div className="p-5">
                    <FlashcardFlip
                        card={currentFlashcard}
                        flipped={flipped}
                        onFlip={toggleFlip}
                        useShadowEffects={optimizationSettings.useShadowEffects}
                    />
                    
                    <div className="flex justify-center mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentFlashcard.learned 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-700' 
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700'
                        }`}>
                            {currentFlashcard.learned ? 'Learned' : 'Learning'}
                        </span>
                    </div>
                    
                    <FlashcardControls
                        currentIndex={currentIndex}
                        total={flashcards.length}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onMarkLearned={handleMarkLearned}
                        isLearned={currentFlashcard.learned}
                    />
                </div>
            </div>
        </div>
    );
};

export default StudyDeck; 
