import { useState } from 'react';

/**
 * Custom hook for managing deck form state and handlers
 * Handles deck information and flashcard operations
 */
export const useDeckForm = () => {
    const [deckData, setDeckData] = useState({
        title: '',
        description: '',
        category: '',
        flashcards: [
            { term: '', definition: '' },
            { term: '', definition: '' }
        ]
    });

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
        deckData,
        handleDeckChange,
        handleFlashcardChange,
        addFlashcard,
        removeFlashcard,
        validateDeck
    };
};
