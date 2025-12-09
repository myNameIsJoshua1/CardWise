import { useState, useEffect } from 'react';
import { progressService } from '../services/progressService';
import { flashcardService } from '../services/flashcardService';

export const useProgressData = (user) => {
  const [progressData, setProgressData] = useState([]);
  const [flashcardMap, setFlashcardMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalDecks, setTotalDecks] = useState(0);
  const [totalLearnedCards, setTotalLearnedCards] = useState(0);
  const [stats, setStats] = useState({
    totalCards: 0,
    averageScore: 0,
    averageTime: 0,
    excellentCount: 0,
    goodCount: 0,
    fairCount: 0,
    needsImprovementCount: 0
  });

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        
        let userId = user?.id || user?.userId;
        if (!userId) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            userId = parsedUser.id || parsedUser.userId;
          }
        }
        
        if (!userId) {
          console.warn('No userId found, using local data only');
        }
        
        // Fetch decks
        let decks = [];
        try {
          decks = await flashcardService.getDecksByUserId(userId);
          setTotalDecks(decks?.length || 0);
        } catch (error) {
          console.error('Error fetching decks:', error);
          setTotalDecks(0);
        }
        
        // Fetch progress entries
        let progressEntries = [];
        if (userId) {
          try {
            progressEntries = await progressService.getProgressByUserId(userId);
          } catch (error) {
            console.error('Error fetching progress from API:', error);
            progressEntries = progressService.getLocalProgress(userId);
          }
        } else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const id = parsedUser.id || parsedUser.userId;
            progressEntries = progressService.getLocalProgress(id);
          }
        }
        
        // Calculate learned cards
        let learnedCount = 0;
        const userFlashcardIds = new Set();
        
        if (decks && Array.isArray(decks)) {
          for (const deck of decks) {
            try {
              const flashcards = await flashcardService.getFlashcards(deck.id);
              if (flashcards && Array.isArray(flashcards)) {
                const learned = flashcards.filter(card => card.learned).length;
                learnedCount += learned;
                flashcards.forEach(card => userFlashcardIds.add(card.id));
              }
            } catch (error) {
              console.warn(`Could not fetch flashcards for deck ${deck.id}`);
            }
          }
        }
        
        setTotalLearnedCards(learnedCount);
        
        // Filter progress to user's flashcards
        const userProgressEntries = progressEntries.filter(entry => {
          return entry.flashCardId && userFlashcardIds.has(entry.flashCardId);
        });
        
        // Fetch flashcard details
        const flashcardDetails = {};
        const flashcardIds = [...new Set(userProgressEntries.map(entry => entry.flashCardId))];
        
        for (const id of flashcardIds) {
          try {
            const flashcard = await flashcardService.getFlashcardById(id);
            if (flashcard) {
              flashcardDetails[id] = flashcard;
            }
          } catch (error) {
            console.warn(`Could not fetch details for flashcard ${id}`);
          }
        }
        
        // Calculate stats
        const calculatedStats = calculateStats(userProgressEntries);
        
        setProgressData(userProgressEntries);
        setFlashcardMap(flashcardDetails);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setError('Failed to load progress data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, [user]);

  return { progressData, flashcardMap, loading, error, totalDecks, totalLearnedCards, stats };
};

const calculateStats = (entries) => {
  if (!entries || entries.length === 0) {
    return {
      totalCards: 0,
      averageScore: 0,
      averageTime: 0,
      excellentCount: 0,
      goodCount: 0,
      fairCount: 0,
      needsImprovementCount: 0
    };
  }
  
  const totalCards = entries.length;
  const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
  const averageScore = Math.round(totalScore / totalCards);
  
  const totalTime = entries.reduce((sum, entry) => sum + entry.timeSpent, 0);
  const averageTime = Math.round(totalTime / totalCards);
  
  const excellentCount = entries.filter(entry => entry.scoreComparison === 'EXCELLENT').length;
  const goodCount = entries.filter(entry => entry.scoreComparison === 'GOOD').length;
  const fairCount = entries.filter(entry => entry.scoreComparison === 'FAIR').length;
  const needsImprovementCount = entries.filter(entry => entry.scoreComparison === 'NEEDS_IMPROVEMENT').length;
  
  return {
    totalCards,
    averageScore,
    averageTime,
    excellentCount,
    goodCount,
    fairCount,
    needsImprovementCount
  };
};
