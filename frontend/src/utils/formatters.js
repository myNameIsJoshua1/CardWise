export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds} sec`;
  } else {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
};

export const formatTimeMinutesSeconds = (seconds) => {
  const s = Number(seconds) || 0;
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}m ${secs}s`;
};

export const formatPercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};
