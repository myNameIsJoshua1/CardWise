import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { achievementService } from '../../services/achievementService';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import AchievementCard from '../../components/shared/AchievementCard';
import EmptyStateCard from '../../components/shared/EmptyStateCard';

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
  const { styles } = useTheme();
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
  
  if (loading) return <LoadingState text="Loading achievements..." />;
  
  if (error) return <ErrorState message={error} onBack={() => navigate('/dashboard')} backText="Back to Dashboard" />;

  return (
    <div className={`max-w-4xl mx-auto p-4 ${styles.background}`}>
      <h1 className={`text-2xl font-bold mb-6 ${styles.text}`}>Your Achievements</h1>
      
      {achievements.length === 0 ? (
        <EmptyStateCard
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          title="No Achievements Yet"
          message="Complete quizzes and study decks to unlock achievements!"
          actionText="Browse Decks"
          onAction={() => navigate('/decks')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements; 
