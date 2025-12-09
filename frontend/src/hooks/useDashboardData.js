import { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { flashcardService } from '../services/flashcardService';
import { reviewService } from '../services/reviewService';
import api from '../services/api';

// Helper: Calculates "How long ago" an event happened
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Handle invalid dates

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 30) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'just now';
};

export const useDashboardData = () => {
    const { user: contextUser, setUser: updateUserContext } = useUser();
    
    // State to store our data
    const [user, setUser] = useState(contextUser);
    const [loading, setLoading] = useState(true);
    const [decks, setDecks] = useState([]);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ 
        totalDecks: 0, 
        cardsStudied: 0, 
        successRate: 0, 
        recentActivity: [] 
    });

    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        
        const fetchAllData = async () => {
            try {
                // 1. Get User ID
                let userId = contextUser?.id || contextUser?.userId;
                if (!userId) {
                    const stored = localStorage.getItem('user');
                    if (stored) userId = JSON.parse(stored).id || JSON.parse(stored).userId;
                }
                
                if (!userId) { 
                    setLoading(false); 
                    return; 
                }

                // 2. Fetch User Profile
                try {
                    const { data: userData } = await api.get(`/user/${userId}`);
                    const completeUser = { 
                        ...userData, 
                        token: contextUser?.token || localStorage.getItem('token'), 
                        firstName: userData.firstName || userData.email?.split('@')[0] 
                    };
                    setUser(completeUser);
                    updateUserContext(completeUser);
                    localStorage.setItem('user', JSON.stringify(completeUser));
                } catch (e) {
                    console.error("User fetch failed, using context user");
                }

                // 3. Fetch Decks & Calculate Card Stats
                const userDecks = await flashcardService.getDecksByUserId(userId);
                let totalStudied = 0;
                let totalCards = 0;
                
                for (const deck of userDecks) {
                    try {
                        const cards = await flashcardService.getFlashcards(deck.id);
                        totalCards += cards.length;
                        totalStudied += cards.filter(c => c.learned).length;
                    } catch { /* ignore empty decks */ }
                }

                // 4. Calculate Reviews & Success Rate
                let successRate = 0;
                let recentActivity = [];
                
                try {
                    const reviews = await reviewService.getReviewsByUserId(userId);
                    if (reviews?.length) {
                        const successful = reviews.filter(r => r.score >= 0.7 || r.correct > (r.total / 2)).length;
                        successRate = Math.round((successful / reviews.length) * 100);
                        
                        // Recent Activity List
                        recentActivity = reviews
                            .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
                            .slice(0, 5)
                            .map(r => {
                                const isQuiz = r.type?.includes('quiz') || r.score != null;
                                const action = isQuiz ? 'Completed quiz for' : 'Studied';
                                const deckName = r.deckName || 'a deck';
                                const timeStr = formatTimeAgo(r.date || r.createdAt);
                                return `${action} ${deckName} - ${timeStr}`;
                            });
                    }
                } catch { 
                    successRate = totalCards > 0 ? Math.round((totalStudied / totalCards) * 100) : 0; 
                }

                // --- FIX: Reset success rate to 0 if no decks exist ---
                if (userDecks.length === 0) {
                    successRate = 0;
                }

                // 5. Update State
                setStats({ totalDecks: userDecks.length, cardsStudied: totalStudied, successRate, recentActivity });
                setDecks(userDecks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
                
            } catch (err) { 
                setError('Failed to load dashboard data.'); 
            } finally { 
                fetchedRef.current = true; 
                setLoading(false); 
            }
        };

        fetchAllData();
    }, [contextUser, updateUserContext]);

    return { user, loading, stats, decks, error };
};