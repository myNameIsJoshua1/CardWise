import React from 'react';

const QuizConfetti = ({ show, pieces }) => {
  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center" aria-hidden="true">
        <div className="confetti-container">
          {pieces.map((c, i) => (
            <div
              key={i}
              className="confetti"
              style={{ 
                left: c.left, 
                animationDelay: c.delay, 
                backgroundColor: c.color, 
                transform: `rotate(${c.rotate}deg)` 
              }}
            />
          ))}
        </div>
      </div>
      
      <style jsx="true">{`
        .confetti-container { 
          position: absolute; 
          width: 100%; 
          height: 100%; 
          overflow: hidden; 
        }
        .confetti { 
          position: absolute; 
          width: 10px; 
          height: 10px; 
          opacity: 0; 
          animation: confetti-fall 3s ease-in-out forwards; 
          transform-origin: center; 
        }
        @keyframes confetti-fall { 
          0% { 
            opacity: 1; 
            top: -10px; 
            transform: translateX(0) rotate(0deg); 
          } 
          100% { 
            opacity: 0; 
            top: 100%; 
            transform: translateX(calc(100px - 200px * var(--random, 0.5))) rotate(720deg); 
          } 
        }
      `}</style>
    </>
  );
};

export default QuizConfetti;
