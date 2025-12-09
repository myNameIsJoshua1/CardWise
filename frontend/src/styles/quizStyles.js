/**
 * Quiz-related CSS classes extracted for better organization
 */

export const quizStyles = {
  // Modal/Overlay styles
  overlay: "fixed inset-0 bg-gray-50 dark:bg-slate-900 flex items-center justify-center z-50",
  overlayDark: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
  modal: "bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md max-w-md w-full",
  modalWide: "rounded-lg w-full max-w-2xl mx-4 overflow-hidden shadow-xl",
  
  // Header styles
  header: "p-4 flex justify-between items-center bg-gradient-to-r from-purple-600 to-orange-500",
  headerTitle: "text-lg font-bold text-white",
  timer: "bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm",
  
  // Progress bar
  progressContainer: "w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8",
  progressBar: "h-full bg-gradient-to-r from-purple-600 to-orange-500 rounded-full",
  
  // Question card
  questionHeader: "flex justify-between items-center mb-4",
  questionTitle: "text-xl font-semibold mb-4",
  questionLabel: "text-sm font-medium",
  
  // Input styles
  answerLabel: "block text-sm font-medium mb-1",
  textarea: "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors",
  
  // Button styles
  navButton: "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
  primaryButton: "px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-md shadow-sm hover:shadow text-sm font-medium transition-all duration-200 flex items-center",
  disabledButton: "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500",
  
  // Tally/Loading states
  tallyCard: "bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full",
  tallyTitle: "text-xl font-bold text-center mb-6 dark:text-white",
  tallyScore: "text-3xl font-bold text-blue-600 dark:text-blue-400 animate-pulse",
  
  // Icon container
  iconContainer: "mb-6 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto",
  icon: "h-12 w-12 text-purple-600 dark:text-purple-400"
};
