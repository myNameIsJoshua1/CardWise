import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { achievementService } from '../services/achievementService';
import { useUser } from '../contexts/UserContext';


const Achievements = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        
        // Get user ID from context or localStorage
        let userId = user?.id || user?.userId;
        
        if (!userId) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              userId = userData.id || userData.userId;
            } catch (err) {
              console.error('Failed to parse stored user:', err);
            }
          }
        }
        
        if (!userId) {
          console.error('No user ID found');
          setError('User ID not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching achievements for userId:', userId);
        
        // Get all achievements with unlock status
        const userAchievements = await achievementService.getAchievementsWithStatus(userId);
        
        console.log('Fetched achievements:', userAchievements);
        
        // Sort achievements by unlocked status and date (newest first)
        userAchievements.sort((a, b) => {
          // First sort by unlock status (unlocked first)
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          
          // If both have same unlock status, sort by date (newest first)
          if (a.unlocked && b.unlocked) {
            return new Date(b.unlockedAt) - new Date(a.unlockedAt);
          }
          
          // If both locked, sort by title
          return a.title.localeCompare(b.title);
        });
        
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setError('Failed to load achievements. Please try again later. Error: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user]);
  
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
          <div className="text-lg text-gray-600 mb-4">
            Loading achievements...
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all ${
                achievement.unlocked 
                  ? 'border-green-500 hover:shadow-lg' 
                  : 'border-gray-300 opacity-75'
              }`}
            >
              <div className="flex items-start">
                <div className={`text-3xl mr-3 ${
                  achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-50'
                }`}>
                  {achievement.icon || '🏆'}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm mb-2 ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  <p className={`text-xs ${achievement.unlocked ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    {achievement.unlocked 
                      ? `✓ Unlocked: ${formatDate(achievement.unlockedAt)}` 
                      : '🔒 Locked'}
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
