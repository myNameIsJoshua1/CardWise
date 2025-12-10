import { flashcardService } from '../services/flashcardService';
import { achievementService } from '../services/achievementService';

/**
 * Achievement milestones configuration
 */
const DECK_MILESTONES = [
    { count: 1, title: 'First Deck Creator', description: 'Created your first flashcard deck!' },
    { count: 5, title: 'Deck Builder', description: 'Create 5 flashcard decks' },
    { count: 10, title: 'Master Creator', description: 'Create 10 flashcard decks' }
];

/**
 * Check and unlock deck creation achievement based on milestone
 * @param {number} userId - The user's ID
 * @returns {Promise<Object|null>} - Achievement object if unlocked, null otherwise
 */
export const checkDeckAchievement = async (userId) => {
    try {
        const userDecks = await flashcardService.getDecksByUserId(userId);
        
        if (!userDecks) {
            return null;
        }

        const deckCount = userDecks.length;
        const milestone = DECK_MILESTONES.find(m => m.count === deckCount);
        
        if (!milestone) {
            return null;
        }

        console.log('Unlocking achievement for userId:', userId);
        
        // Always save to localStorage
        achievementService.saveAchievementsLocally(userId, milestone);
        
        // Try to unlock via backend and check if it's newly unlocked
        try {
            const result = await achievementService.unlockAchievement(
                userId,
                milestone.title,
                milestone.description
            );
            
            // Only return achievement if this is a new unlock
            return result.newlyUnlocked ? milestone : null;
        } catch (err) {
            console.log('Backend achievement unlock failed, using localStorage:', err);
            // Return achievement for localStorage fallback
            return milestone;
        }
    } catch (err) {
        console.error('Error checking deck count for achievement:', err);
        return null;
    }
};
