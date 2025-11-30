import api from './api';

// All available achievements in the system
const ALL_ACHIEVEMENTS = [
  {
    id: 1,
    title: 'First Steps',
    description: 'Create your first flashcard deck',
    icon: '👣'
  },
  {
    id: 2,
    title: 'Learning Begins',
    description: 'Complete your first quiz',
    icon: '📖'
  },
  {
    id: 3,
    title: 'Getting Started',
    description: 'Study your first deck',
    icon: '🚀'
  },
  {
    id: 4,
    title: 'Deck Master',
    description: 'Create 3 flashcard decks',
    icon: '🎓'
  },
  {
    id: 5,
    title: 'First Perfect Score',
    description: 'Achieved a perfect score (100%) on a quiz',
    icon: '🏆'
  },
  {
    id: 6,
    title: '5 Notes Achievement',
    description: 'Created 5 flashcard decks',
    icon: '📚'
  },
  {
    id: 7,
    title: '10 Notes Achievement',
    description: 'Created 10 flashcard decks',
    icon: '🌟'
  }
];

export const achievementService = {
  // Get all available achievements
  getAllAchievements: () => {
    return ALL_ACHIEVEMENTS;
  },

  // Get all achievements for a specific user
  getUserAchievements: async (userId) => {
    try {
      const response = await api.get(`/achievements/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  },

  // Unlock a new achievement
  unlockAchievement: async (userId, title, description) => {
    try {
      const response = await api.post('/achievements/unlock', null, {
        params: {
          userId,
          title,
          description
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  },

  // Save achievements locally as a fallback
  saveAchievementsLocally: (userId, achievement) => {
    try {
      // Get existing achievements
      const existingAchievements = JSON.parse(localStorage.getItem(`achievements-${userId}`) || '[]');
      
      // Check if achievement already exists
      const achievementExists = existingAchievements.some(
        a => a.title === achievement.title
      );
      
      // Only add if it doesn't exist
      if (!achievementExists) {
        const newAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        
        // Add to beginning to keep newest first
        existingAchievements.unshift(newAchievement);
        
        // Save back to localStorage
        localStorage.setItem(`achievements-${userId}`, JSON.stringify(existingAchievements));
      }
      
      return existingAchievements;
    } catch (error) {
      console.error('Error saving achievements locally:', error);
      return [];
    }
  },
  
  // Get locally stored achievements
  getLocalAchievements: (userId) => {
    try {
      return JSON.parse(localStorage.getItem(`achievements-${userId}`) || '[]');
    } catch (error) {
      console.error('Error getting local achievements:', error);
      return [];
    }
  },

  // Merge unlocked achievements with all available achievements
  getAchievementsWithStatus: async (userId) => {
    try {
      if (!userId) {
        console.warn('No userId provided to getAchievementsWithStatus');
        // Return all achievements as locked if no user ID
        return ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, unlockedAt: null }));
      }
      
      // Get all available achievements
      const allAchievements = ALL_ACHIEVEMENTS;
      
      // Get unlocked achievements - try API first, then local storage
      let unlockedAchievements = [];
      try {
        unlockedAchievements = await achievementService.getUserAchievements(userId);
      } catch (err) {
        console.log('Fetching from API failed, trying local storage:', err.message);
        unlockedAchievements = achievementService.getLocalAchievements(userId);
      }
      
      // Map unlocked achievements by title for quick lookup
      const unlockedMap = new Map(
        unlockedAchievements.map(a => [a.title, a])
      );
      
      // Merge: mark which achievements are unlocked
      const mergedAchievements = allAchievements.map(achievement => {
        const unlockedData = unlockedMap.get(achievement.title);
        return {
          ...achievement,
          unlocked: !!unlockedData,
          unlockedAt: unlockedData?.unlockedAt || null
        };
      });
      
      return mergedAchievements;
    } catch (error) {
      console.error('Error merging achievements:', error);
      // Return all achievements as locked as fallback
      return ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, unlockedAt: null }));
    }
  }
}; 