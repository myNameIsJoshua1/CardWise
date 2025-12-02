import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { achievementService } from '../services/achievementService';
import { useUser } from '../contexts/UserContext';

// All possible achievements in the game
const ALL_ACHIEVEMENTS = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Started your first study session',
    icon: '🚀'
  },
  {
    id: 'first-deck-creator',
    title: 'First Deck Creator',
    description: 'Created your first flashcard deck!',
    icon: '📚'
  },
  {
    id: 'deck-builder',
    title: 'Deck Builder',
    description: 'Create 5 flashcard decks',
    icon: '🏗️'
  },
  {
    id: 'master-creator',
    title: 'Master Creator',
    description: 'Create 10 flashcard decks',
    icon: '🎓'
  },
  {
    id: 'learning-begins',
    title: 'Learning Begins',
    description: 'Marked your first flashcard as learned',
    icon: '✨'
  },
  {
    id: 'deck-master',
    title: 'Deck Master',
    description: 'Completed an entire flashcard deck',
    icon: '👑'
  },
  {
    id: 'quiz-taker',
    title: 'Quiz Taker',
    description: 'Completed your first quiz',
    icon: '📝'
  },
  {
    id: 'high-achiever',
    title: 'High Achiever',
    description: 'Scored 80% or higher on a quiz',
    icon: '⭐'
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Achieved a perfect score on a quiz',
    icon: '🏆'
  },
  {
    id: 'learning-journey',
    title: 'Learning Journey',
    description: 'Get 0% on a quiz',
    icon: '🌱'
  }
];

const Achievements = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
    }

    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const userData = user || JSON.parse(localStorage.getItem('user'));
        const userId = userData?.id || userData?.userId;
        
        console.log('Fetching achievements for userId:', userId);
        console.log('User data:', userData);
        
        // Attempt to get achievements from backend
        let userAchievements = [];
        try {
          userAchievements = await achievementService.getUserAchievements(userId);
          console.log('Backend achievements:', userAchievements);
        } catch (error) {
          console.error('Error fetching achievements from API:', error);
          // Fall back to local achievements data
          userAchievements = achievementService.getLocalAchievements(userId);
          console.log('Local achievements:', userAchievements);
        }
        
        // Create a map of unlocked achievements by title
        const unlockedMap = {};
        userAchievements.forEach(a => {
          if (a.unlocked || a.title) {
            unlockedMap[a.title] = a;
          }
        });
        
        console.log('Unlocked achievements map:', unlockedMap);
        
        // Merge with all possible achievements
        const mergedAchievements = ALL_ACHIEVEMENTS.map(achievement => {
          const unlockedVersion = unlockedMap[achievement.title];
          return {
            ...achievement,
            unlocked: !!unlockedVersion,
            unlockedAt: unlockedVersion?.unlockedAt
          };
        });
        
        console.log('Merged achievements:', mergedAchievements);
        
        // Sort achievements by unlocked status first, then by order in ALL_ACHIEVEMENTS
        mergedAchievements.sort((a, b) => {
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          if (a.unlocked && b.unlocked) {
            return new Date(b.unlockedAt) - new Date(a.unlockedAt);
          }
          return 0;
        });
        
        setAchievements(mergedAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setError('Failed to load achievements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user, navigate]);
  
  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Not unlocked yet';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today: Show time
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week
      return `${diffDays} days ago`;
    } else {
      // More than a week
      return date.toLocaleDateString();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading achievements...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-12 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Achievements</h1>
      
      {achievements.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No Achievements Yet</h2>
          <p className="text-gray-600 mb-4">
            Complete quizzes and study decks to unlock achievements!
          </p>
          <button 
            onClick={() => navigate('/decks')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Browse Decks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`rounded-lg shadow-md p-4 border-l-4 transition-all ${
                achievement.unlocked 
                  ? 'bg-white border-green-500' 
                  : 'bg-gray-100 border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start">
                <div className={`rounded-full p-3 mr-3 text-2xl flex items-center justify-center ${
                  achievement.unlocked ? 'bg-green-100' : 'bg-gray-300'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${
                    achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    achievement.unlocked ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  <p className={`text-xs ${
                    achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {achievement.unlocked 
                      ? `Unlocked: ${formatDate(achievement.unlockedAt)}` 
                      : 'Locked'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements; 