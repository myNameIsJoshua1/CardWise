import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useTheme } from '../../contexts/ThemeContext';

// --- Header Component ---
export const WelcomeHeader = ({ user }) => {
    const { styles } = useTheme();
    return (
        <div className="mb-8">
            <h1 className={`text-3xl font-bold ${styles.text}`}>
                Welcome back, {user.firstName || user.email?.split('@')[0] || 'User'}!
            </h1>
            <p className={`${styles.textSecondary} mt-2`}>Let's continue your learning journey</p>
        </div>
    );
};

// --- Statistics Grid Component ---
export const StatsGrid = ({ stats }) => {
    const { styles } = useTheme();
    
    const getBadge = (rate, studied) => {
        if (studied === 0) return null;
        if (rate >= 80) return <span className="text-sm text-green-600 bg-green-50 rounded-full px-2 py-0.5">Excellent</span>;
        if (rate >= 60) return <span className="text-sm text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">Good</span>;
        return <span className="text-sm text-orange-600 bg-orange-50 rounded-full px-2 py-0.5">Needs work</span>;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Decks" value={stats.totalDecks} linkText="View all decks" linkTo="/decks" color="text-purple-600" />
            <StatCard title="Cards Studied" value={stats.cardsStudied} linkText="View progress" linkTo="/progress" color="text-purple-600" />
            <Card className={`${styles.card} ${styles.border} shadow-sm`}>
                <CardHeader className="pb-2"><CardTitle className={`text-lg font-medium ${styles.textSecondary}`}>Success Rate</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">{stats.successRate}%</div>
                        <div className="ml-2">{getBadge(stats.successRate, stats.cardsStudied)}</div>
                    </div>
                    <Link to="/achievements" className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center mt-2">View achievements</Link>
                </CardContent>
            </Card>
        </div>
    );
};

const StatCard = ({ title, value, linkText, linkTo, color }) => {
    const { styles } = useTheme();
    return (
        <Card className={`${styles.card} ${styles.border} shadow-sm`}>
            <CardHeader className="pb-2"><CardTitle className={`text-lg font-medium ${styles.textSecondary}`}>{title}</CardTitle></CardHeader>
            <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">{value}</div>
                <div className="flex justify-between mt-2">
                    <Link to={linkTo} className={`text-sm ${color} hover:text-purple-700 inline-flex items-center`}>{linkText}</Link>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Deck List Component ---
export const DecksSection = ({ decks, error }) => {
    const { styles } = useTheme();
    return (
        <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${styles.text}`}>Your Decks</h2>
                <Link to="/decks/new" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700"> + Create new deck</Link>
            </div>
            
            {error ? (
                <div className="bg-white shadow-sm rounded-lg p-6 text-red-500">{error}</div>
            ) : decks.length === 0 ? (
                <div className={`${styles.border} shadow-sm rounded-lg border border-gray-200 p-6 text-center`}>
                    <p className={`${styles.textSecondary} mb-4`}>You don't have any flashcard decks yet</p>
                    <Link to="/decks/new" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-orange-500">Create your first deck</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {decks.slice(0, 4).map(deck => (
                        <Card key={deck.id} className={`${styles.card} ${styles.border} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardHeader className="pb-2"><CardTitle className={`text-lg font-medium ${styles.text}`}>{deck.title || deck.subject}</CardTitle></CardHeader>
                            <CardContent>
                                <p className={`text-sm ${styles.textMuted} mb-4`}>{deck.description || deck.category || 'General'}</p>
                                <div className="flex space-x-2">
                                    <Link to={`/decks/${deck.id}`} className="text-xs px-3 py-1.5 text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors">View</Link>
                                    <Link to={`/study/${deck.id}`} className="text-xs px-3 py-1.5 text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors">Study</Link>
                                    {/* --- ADDED QUIZ BUTTON HERE --- */}
                                    <Link to={`/quiz/${deck.id}`} className="text-xs px-3 py-1.5 text-yellow-700 bg-yellow-50 rounded-md hover:bg-yellow-100 transition-colors">Quiz</Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Activity Sidebar Component ---
export const ActivitySidebar = ({ recentActivity, firstDeckId }) => {
    const { styles } = useTheme();
    return (
        <div>
            <h2 className={`text-xl font-bold ${styles.text} mb-4`}>Recent Activity</h2>
            <Card className={`${styles.card} ${styles.border} shadow-sm`}>
                <CardContent className="pt-6">
                    {recentActivity.length > 0 ? (
                        <ul className="space-y-3">
                            {recentActivity.map((activity, i) => (
                                <li key={i} className={`pb-3 ${styles.border} last:border-0 last:pb-0`}>
                                    <p className={`text-sm ${styles.textSecondary}`}>{activity}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className={`text-center py-6 ${styles.textSecondary}`}>No recent activity</p>}
                </CardContent>
            </Card>

            <Card className="mt-6 bg-gradient-to-tr from-purple-800 via-orange-500 to-yellow-400 text-white">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">Quick Study</h3>
                    <p className="text-sm text-white/80 mb-4">Take 5 minutes to review your flashcards.</p>
                    <Link to={firstDeckId ? `/study/${firstDeckId}` : '/decks/new'} className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm">
                        {firstDeckId ? 'Start a session' : 'Create a deck first'}
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};