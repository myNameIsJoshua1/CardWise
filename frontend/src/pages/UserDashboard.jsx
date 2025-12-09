import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { flashcardService } from '../services/flashcardService';
import { reviewService } from '../services/reviewService';
import api from '../services/api';

// Helper: format date to "time ago"
const formatTimeAgo = (date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 30) return `${Math.floor(diffDays / 30)} month${diffDays > 60 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'just now';
};

// Reusable loading spinner
const LoadingSpinner = ({ size = 'md', text }) => {
    const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <div className="flex flex-col items-center justify-center">
            <div className={`${sizeClasses[size]} border-t-2 border-b-2 border-purple-500 rounded-full animate-spin`} />
            {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
        </div>
    );
};

const UserDashboard = () => {
    const { user: contextUser, setUser: updateUserContext } = useUser();
    const { styles } = useTheme();
    
    const [user, setUser] = useState(contextUser);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalDecks: 0, cardsStudied: 0, successRate: 0, recentActivity: [] });
    const [decks, setDecks] = useState([]);
    const [decksError, setDecksError] = useState(null);
    
    const fetchedRef = useRef(false);

    // Fetch all user data in one effect
    useEffect(() => {
        if (fetchedRef.current) return;
        
        const fetchAllData = async () => {
            try {
                // Get user ID
                let userId = contextUser?.id || contextUser?.userId;
                if (!userId) {
                    const stored = localStorage.getItem('user');
                    if (stored) userId = JSON.parse(stored).id || JSON.parse(stored).userId;
                }
                
                if (!userId) {
                    setLoading(false);
                    return;
                }

                // Fetch complete user profile
                try {
                    const { data: userData } = await api.get(`/user/${userId}`);
                    const token = contextUser?.token || localStorage.getItem('token') || '';
                    const completeUser = { 
                        ...userData, 
                        token,
                        firstName: userData.firstName || userData.email?.split('@')[0]
                    };
                    setUser(completeUser);
                    updateUserContext(completeUser);
                    localStorage.setItem('user', JSON.stringify(completeUser));
                } catch {
                    setUser(contextUser);
                }

                // Fetch decks and calculate stats
                const userDecks = await flashcardService.getDecksByUserId(userId);
                let totalStudied = 0, totalCards = 0;
                
                for (const deck of userDecks) {
                    try {
                        const cards = await flashcardService.getFlashcards(deck.id);
                        totalCards += cards.length;
                        totalStudied += cards.filter(c => c.learned).length;
                    } catch { /* ignore */ }
                }

                // Calculate success rate from reviews
                let successRate = 0;
                let recentActivity = [];
                try {
                    const reviews = await reviewService.getReviewsByUserId(userId);
                    if (reviews?.length) {
                        const successful = reviews.filter(r => r.score >= 0.7 || r.correct > (r.total / 2)).length;
                        successRate = Math.round((successful / reviews.length) * 100);
                        
                        // Format recent activity
                        recentActivity = reviews
                            .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
                            .slice(0, 5)
                            .map(r => {
                                const action = r.type?.toLowerCase().includes('quiz') || r.score != null ? 'Completed quiz for' : 'Studied';
                                const deckName = r.deckName || r.deckTitle || 'a deck';
                                const timeAgo = formatTimeAgo(r.date || r.createdAt);
                                return `${action} ${deckName} - ${timeAgo}`;
                            });
                    }
                } catch {
                    successRate = totalCards > 0 ? Math.round((totalStudied / totalCards) * 100) : 0;
                }

                setStats({ totalDecks: userDecks.length, cardsStudied: totalStudied, successRate, recentActivity });
                setDecks(userDecks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
            } catch (error) {
                setDecksError('Failed to load dashboard data.');
            } finally {
                fetchedRef.current = true;
                setLoading(false);
            }
        };

        fetchAllData();
    }, [contextUser, updateUserContext]);

    // Success rate badge
    const successBadge = useMemo(() => {
        if (stats.cardsStudied === 0) return null;
        if (stats.successRate >= 80) return <span className="text-sm text-green-600 bg-green-50 rounded-full px-2 py-0.5">Excellent</span>;
        if (stats.successRate >= 60) return <span className="text-sm text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">Good</span>;
        if (stats.successRate >= 40) return <span className="text-sm text-yellow-600 bg-yellow-50 rounded-full px-2 py-0.5">Average</span>;
        return <span className="text-sm text-orange-600 bg-orange-50 rounded-full px-2 py-0.5">Needs work</span>;
    }, [stats.successRate, stats.cardsStudied]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Loading your dashboard..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-64">
                <p className={styles.textSecondary}>
                    {localStorage.getItem('token') ? "Having trouble loading your data. Please refresh." : "Please log in."}
                </p>
                {!localStorage.getItem('token') && (
                    <Link to="/login" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Go to Login</Link>
                )}
            </div>
        );
    }

    return (
        <div className={`${styles.background} container mx-auto px-4 py-8`}>
            {/* Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${styles.text}`}>
                    Welcome back, {user.firstName || user.email?.split('@')[0] || 'User'}!
                </h1>
                <p className={`${styles.textSecondary} mt-2`}>Let's continue your learning journey</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Decks */}
                <Card className={`${styles.card} ${styles.border} shadow-sm`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-lg font-medium ${styles.textSecondary}`}>Total Decks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">{stats.totalDecks}</div>
                        <div className="flex justify-between mt-2">
                            <Link to="/decks" className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center">
                                View all decks
                                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </Link>
                            {stats.totalDecks === 0 && (
                                <Link to="/decks/new" className="text-sm text-green-600 hover:text-green-700 inline-flex items-center">
                                    Create first deck
                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Cards Studied */}
                <Card className={`${styles.card} ${styles.border} shadow-sm`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-lg font-medium ${styles.textSecondary}`}>Cards Studied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">{stats.cardsStudied}</div>
                        <div className="flex justify-between items-center mt-2">
                            <Link to="/progress" className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center">
                                View progress
                                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </Link>
                            {stats.cardsStudied === 0 && stats.totalDecks > 0 && decks[0] && (
                                <Link to={`/study/${decks[0].id}`} className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center">
                                    Start studying
                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" /></svg>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Success Rate */}
                <Card className={`${styles.card} ${styles.border} shadow-sm`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-lg font-medium ${styles.textSecondary}`}>Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">{stats.successRate}%</div>
                            {successBadge && <div className="ml-2">{successBadge}</div>}
                        </div>
                        <Link to="/achievements" className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center mt-2">
                            View achievements
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Decks Section */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-xl font-bold ${styles.text}`}>Your Decks</h2>
                        <Link to="/decks/new" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Create new deck
                        </Link>
                    </div>
                    
                    {decksError ? (
                        <div className="bg-white shadow-sm rounded-lg p-6"><p className="text-red-500">{decksError}</p></div>
                    ) : decks.length === 0 ? (
                        <div className={`${styles.border} shadow-sm rounded-lg border border-gray-200 p-6 text-center`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className={`${styles.textSecondary} mb-4`}>You don't have any flashcard decks yet</p>
                            <Link to="/decks/new" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600">
                                Create your first deck
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {decks.slice(0, 4).map(deck => (
                                <Card key={deck.id} className={`${styles.card} ${styles.border} shadow-sm hover:shadow-md transition-shadow`}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className={`text-lg font-medium ${styles.text}`}>{deck.title || deck.subject}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className={`text-sm ${styles.textMuted} mb-4`}>{deck.description || deck.category || 'General'}</p>
                                        <div className="flex space-x-2">
                                            <Link to={`/decks/${deck.id}`} className="text-xs px-3 py-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">View</Link>
                                            <Link to={`/study/${deck.id}`} className="text-xs px-3 py-1.5 text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors">Study</Link>
                                            <Link to={`/quiz/${deck.id}`} className="text-xs px-3 py-1.5 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors">Quiz</Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {decks.length > 4 && (
                                <div className="sm:col-span-2 mt-2 text-center">
                                    <Link to="/decks" className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center">
                                        View all {decks.length} decks
                                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Activity & Quick Study */}
                <div>
                    <h2 className={`text-xl font-bold ${styles.text} mb-4`}>Recent Activity</h2>
                    <Card className={`${styles.card} ${styles.border} shadow-sm`}>
                        <CardContent className="pt-6">
                            {stats.recentActivity.length > 0 ? (
                                <ul className="space-y-3">
                                    {stats.recentActivity.map((activity, i) => (
                                        <li key={i} className={`pb-3 ${styles.border} last:border-0 last:pb-0`}>
                                            <p className={`text-sm ${styles.textSecondary}`}>{activity}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-6">
                                    <p className={styles.textSecondary}>No recent activity</p>
                                    <p className={`text-sm ${styles.textMuted}`}>Your study sessions will appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card className="mt-6 bg-gradient-to-tr from-purple-800 via-orange-500 to-yellow-400 text-white overflow-hidden">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-2">Quick Study</h3>
                            <p className="text-sm text-white/80 mb-4">Take 5 minutes to review your flashcards.</p>
                            <Link
                                to={decks.length > 0 ? `/study/${decks[0]?.id}` : '/decks/new'}
                                className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md text-sm transition-colors"
                            >
                                {decks.length > 0 ? 'Start a session' : 'Create a deck first'}
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
