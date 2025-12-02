import React, { useState, useEffect } from 'react';

const AchievementNotification = ({ achievement, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 500); // Match the slide-out animation duration
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-6 transform transition-all duration-500 ease-in-out ${
        isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-2xl p-6 max-w-sm border-2 border-yellow-300">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 animate-bounce"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-bold">🎉 Achievement Unlocked!</h3>
            <p className="text-sm font-semibold mt-1">{achievement.title}</p>
            <p className="text-xs mt-1 opacity-90">{achievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
