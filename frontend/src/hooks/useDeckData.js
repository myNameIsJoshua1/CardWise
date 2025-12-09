import { useState, useEffect } from 'react';
import { flashcardService } from '../services/flashcardService';

export const useDeckData = (deckId) => {
  const [flashcards, setFlashcards] = useState([]);
  const [deckTitle, setDeckTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!deckId || deckId === 'null' || deckId === 'undefined') {
        setError('Invalid deck ID. Please go back and try again.');
        setLoading(false);
        return;
      }
      
      try {
        const [deckInfo, cards] = await Promise.all([
          flashcardService.getDeck(deckId),
          flashcardService.getFlashcards(deckId)
        ]);
        
        setDeckTitle(deckInfo.title);
        setFlashcards(cards);
      } catch (error) {
        setError('Failed to fetch deck data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [deckId]);

  return { flashcards, deckTitle, loading, error };
};
