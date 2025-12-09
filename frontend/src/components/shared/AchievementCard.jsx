import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Reusable achievement display card
 * Separates achievement UI from Achievements page logic
 */
const AchievementCard = ({ achievement, formatDate }) => {
  const { styles } = useTheme();

  return (
    <div
      className={`rounded-lg shadow-md p-4 border-l-4 transition-all ${
        achievement.unlocked
          ? `${styles.card} border-green-500`
          : `${styles.backgroundSecondary} ${styles.border} opacity-60`
      }`}
    >
      <div className="flex items-start">
        <div className={`rounded-full p-3 mr-3 text-2xl flex items-center justify-center ${
          achievement.unlocked ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-300 dark:bg-gray-700'
        }`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${
            achievement.unlocked ? styles.text : styles.textMuted
          }`}>
            {achievement.title}
          </h3>
          <p className={`text-sm mb-2 ${
            achievement.unlocked ? styles.textSecondary : styles.textMuted
          }`}>
            {achievement.description}
          </p>
          <p className={`text-xs ${
            achievement.unlocked ? 'text-green-600 dark:text-green-400' : styles.textMuted
          }`}>
            {achievement.unlocked
              ? `Unlocked: ${formatDate ? formatDate(achievement.unlockedAt) : achievement.unlockedAt}`
              : 'Locked'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
