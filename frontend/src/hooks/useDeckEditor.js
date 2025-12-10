import { useState, useEffect } from 'react';
import { flashcardService } from '../services/flashcardService';

/**
 * Custom hook for editing an existing deck with flashcards
 * Handles loading deck data, form state, and validation
 */
export const useDeckEditor = (deckId, userId) => {
    const [isLoading, setIsLoading] = useState(true);
    const [deckData, setDeckData] = useState({
        title: '',
        description: '',
        category: '',
        flashcards: []
    });
    const [originalFlashcards, setOriginalFlashcards] = useState([]);
    const [error, setError] = useState('');

    // Load deck data
    useEffect(() => {
        const fetchDeckData = async () => {
            if (!deckId || !userId) return;
            
            try {
                setIsLoading(true);
                setError('');
                
                // Fetch deck info
                const deckInfo = await flashcardService.getDeck(deckId);
                
                if (!deckInfo) {
                    setError("Deck not found");
                    return;
                }
                
                // Check if user owns this deck
                if (deckInfo.userId !== userId) {
                    setError("You don't have permission to edit this deck");
                    return;
                }
                
                // Fetch flashcards for this deck
                const flashcards = await flashcardService.getFlashcards(deckId);
                
                // Set deck data
                setDeckData({
                    title: deckInfo.title || '',
                    description: deckInfo.description || '',
                    category: deckInfo.category || '',
                    flashcards: flashcards.length > 0 ? flashcards : [
                        { term: '', definition: '' }
                    ]
                });
                
                // Store original flashcards for comparison
                setOriginalFlashcards(flashcards);
                
            } catch (err) {
                console.error('Failed to fetch deck data:', err);
                setError('Failed to load deck. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDeckData();
    }, [deckId, userId]);

    // Handle input change for deck information
    const handleDeckChange = (e) => {
        const { name, value } = e.target;
        setDeckData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle flashcard changes
    const handleFlashcardChange = (index, field, value) => {
        const updatedFlashcards = [...deckData.flashcards];
        updatedFlashcards[index] = {
            ...updatedFlashcards[index],
            [field]: value
        };
        setDeckData(prev => ({
            ...prev,
            flashcards: updatedFlashcards
        }));
    };

    // Add a new empty flashcard
    const addFlashcard = () => {
        setDeckData(prev => ({
            ...prev,
            flashcards: [...prev.flashcards, { term: '', definition: '' }]
        }));
    };

    // Remove a flashcard
    const removeFlashcard = (index) => {
        if (deckData.flashcards.length <= 1) {
            throw new Error('You need at least one flashcard');
        }

        const updatedFlashcards = deckData.flashcards.filter((_, i) => i !== index);
        setDeckData(prev => ({
            ...prev,
            flashcards: updatedFlashcards
        }));
    };

    // Validate deck data and return valid flashcards
    const validateDeck = () => {
        if (!deckData.title.trim()) {
            throw new Error('Title is required');
        }

        const validFlashcards = deckData.flashcards.filter(card => 
            card.term.trim() && card.definition.trim()
        );

        if (validFlashcards.length === 0) {
            throw new Error('Please create at least one flashcard with both question and answer');
        }

        return validFlashcards;
    };

    return {
        isLoading,
        deckData,
        originalFlashcards,
        error: error,
        handleDeckChange,
        handleFlashcardChange,
        addFlashcard,
        removeFlashcard,
        validateDeck
    };
};
