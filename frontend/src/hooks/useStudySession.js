import { useState, useCallback, useMemo } from 'react';
import { flashcardService } from '../services/flashcardService';
import { achievementService } from '../services/achievementService';

export const useStudySession = (flashcards, user) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardsLearned, setCardsLearned] = useState(() => {
    return flashcards.filter(card => card.learned).length;
  });
  const [achievement, setAchievement] = useState(null);
  const [localFlashcards, setLocalFlashcards] = useState(flashcards);

  const handleNext = useCallback(() => {
    if (currentIndex < localFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      alert("You've reached the end of this flashcard set.");
    }
  }, [currentIndex, localFlashcards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    } else {
      alert("You're at the beginning of this flashcard set.");
    }
  }, [currentIndex]);

  const toggleFlip = useCallback(() => {
    setFlipped(prev => !prev);
  }, []);

  const checkAndUnlockAchievements = useCallback(async (newCardsLearned, totalCards) => {
    if (!user) return;
    
    const userId = user.id || user.userId;
    
    try {
      const achievementsToCheck = [
        {
          title: 'First Steps',
          description: 'Started your first study session',
          condition: true
        },
        {
          title: 'Learning Begins',
          description: 'Marked your first flashcard as learned',
          condition: newCardsLearned === 1
        },
        {
          title: 'Getting Started',
          description: 'Learned 5 flashcards',
          condition: newCardsLearned >= 5
        },
        {
          title: 'Deck Master',
          description: 'Completed an entire flashcard deck',
          condition: newCardsLearned === totalCards
        }
      ].filter(ach => ach.condition);
      
      const achievementPromises = achievementsToCheck.map(async (ach) => {
        try {
          const result = await achievementService.unlockAchievement(userId, ach.title, ach.description);
          return { ...ach, ...result };
        } catch (error) {
          achievementService.saveAchievementsLocally(userId, { title: ach.title, description: ach.description });
          return { ...ach, error: true };
        }
      });
      
      const results = await Promise.allSettled(achievementPromises);
      
      const newlyUnlocked = results
        .filter(r => r.status === 'fulfilled' && r.value?.newlyUnlocked)
        .map(r => r.value);
      
      if (newlyUnlocked.length > 0) {
        setAchievement(newlyUnlocked[newlyUnlocked.length - 1]);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [user]);

  const handleMarkLearned = useCallback(async () => {
    const currentCard = localFlashcards[currentIndex];
    if (!currentCard) return;

    try {
      const isNewlyLearned = !currentCard.learned;
      
      await flashcardService.updateFlashcard(currentCard.id, {
        ...currentCard,
        learned: true
      });
      
      setLocalFlashcards(prevFlashcards => {
        const updatedFlashcards = [...prevFlashcards];
        updatedFlashcards[currentIndex] = {
          ...currentCard,
          learned: true
        };
        return updatedFlashcards;
      });
      
      if (isNewlyLearned) {
        const newCardsLearned = cardsLearned + 1;
        setCardsLearned(newCardsLearned);
        checkAndUnlockAchievements(newCardsLearned, localFlashcards.length);
      }
      
      if (currentIndex < localFlashcards.length - 1) {
        handleNext();
      }
    } catch (error) {
      alert('Failed to mark card as learned');
    }
  }, [currentIndex, localFlashcards, cardsLearned, checkAndUnlockAchievements, handleNext]);

  const progressPercentage = useMemo(() => {
    return localFlashcards.length > 0 ? Math.round((cardsLearned / localFlashcards.length) * 100) : 0;
  }, [cardsLearned, localFlashcards.length]);

  const currentFlashcard = useMemo(() => {
    return localFlashcards[currentIndex] || null;
  }, [localFlashcards, currentIndex]);

  return {
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
  };
};
