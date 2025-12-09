/**
 * Tailwind CSS utilities extracted from ProgressStats
 * Keeps component logic clean while organizing styling
 */

export const progressStyles = {
  container: "max-w-4xl mx-auto p-4",
  summaryCard: "bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-6",
  statsGrid: "grid grid-cols-1 md:grid-cols-4 gap-4",
  performanceBar: "flex h-4 rounded-full overflow-hidden",
  legendItem: "flex items-center",
  legendDot: "w-3 h-3 rounded-full mr-1",
  detailsCard: "bg-white dark:bg-slate-800 rounded-lg shadow-md p-4",
  table: "min-w-full",
  tableHeader: "bg-gray-100 dark:bg-slate-700",
  tableRow: (index) => index % 2 === 0 ? 'bg-gray-50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-800',
  emptyMessage: "text-center text-gray-500 dark:text-gray-400 py-4"
};

export const scoreColors = {
  EXCELLENT: 'text-green-600 dark:text-green-400',
  GOOD: 'text-blue-600 dark:text-blue-400',
  FAIR: 'text-yellow-600 dark:text-yellow-400',
  NEEDS_IMPROVEMENT: 'text-red-600 dark:text-red-400'
};
