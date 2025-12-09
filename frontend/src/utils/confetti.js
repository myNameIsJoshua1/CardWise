const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

export const generateConfettiPieces = (count = 100) => {
  return Array.from({ length: count }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotate: Math.random() * 360
  }));
};
