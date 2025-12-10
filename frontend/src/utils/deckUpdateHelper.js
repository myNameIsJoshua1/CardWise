import { flashcardService } from '../services/flashcardService';

/**
 * Update deck information and synchronize flashcards
 * Handles creating new flashcards, updating existing ones, and deleting removed ones
 * 
 * @param {string} deckId - The ID of the deck to update
 * @param {Object} deckData - The updated deck information
 * @param {Array} validFlashcards - The valid flashcards to sync
 * @param {Array} originalFlashcards - The original flashcards before editing
 * @param {number} userId - The user's ID
 * @returns {Promise<void>}
 */
export const updateDeckWithFlashcards = async (
    deckId,
    deckData,
    validFlashcards,
    originalFlashcards,
    userId
) => {
    // Update the deck information
    await flashcardService.updateDeck(deckId, {
        title: deckData.title,
        description: deckData.description,
        category: deckData.category,
        userId: userId
    });
    
    // Organize flashcards into categories for operations
    const existingIds = new Set(originalFlashcards.map(card => card.id));
    const updatedIds = new Set(validFlashcards.filter(card => card.id).map(card => card.id));
    
    // Create new flashcards (cards without IDs)
    const createPromises = validFlashcards
        .filter(card => !card.id)
        .map(card => 
            flashcardService.createFlashcard({
                deckId: deckId,
                term: card.term,
                definition: card.definition,
                learned: false,
                userId: userId
            })
        );
    
    // Update existing flashcards
    const updatePromises = validFlashcards
        .filter(card => card.id && existingIds.has(card.id))
        .map(card => 
            flashcardService.updateFlashcard(card.id, {
                term: card.term,
                definition: card.definition,
                deckId: deckId,
                userId: userId
            })
        );
    
    // Delete removed flashcards
    const deletePromises = originalFlashcards
        .filter(card => !updatedIds.has(card.id))
        .map(card => flashcardService.deleteFlashcard(card.id));
    
    // Execute all operations in parallel
    await Promise.all([
        ...createPromises,
        ...updatePromises,
        ...deletePromises
    ]);
};
