import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import PageHeader from '../../components/shared/PageHeader';
import EmptyStateCard from '../../components/shared/EmptyStateCard';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';

const DecksList = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { styles } = useTheme();
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchedRef = useRef(false);
    
    const isDarkMode = styles.background && (styles.background.includes('slate-900') || styles.background.includes('gray-900'));

    useEffect(() => {
        // Prevent multiple API calls
        if (fetchedRef.current || !user) return;
        
        const fetchDecks = async () => {
            try {
                const userId = user.id || user.userId;
                
                if (!userId) {
                    throw new Error('User ID not available');
                }
                
                console.log('Fetching decks for user:', userId);
                const userDecks = await flashcardService.getDecksByUserId(userId);
                
                console.log('User decks:', userDecks);
                setDecks(userDecks);
            } catch (error) {
                console.error('Failed to fetch decks:', error);
                setError('Failed to load your decks. Please try again.');
            } finally {
                setLoading(false);
                fetchedRef.current = true;
            }
        };

        fetchDecks();
    }, [user]);

    const handleCreateNewDeck = () => {
        navigate('/decks/new');
    };

    if (loading) return <LoadingState text="Loading your decks..." />;

    if (error) return <ErrorState message={error} onBack={() => navigate('/dashboard')} backText="Return to Dashboard" />;

    return (
        <div className={`container mx-auto p-6 ${styles.background}`}>
            <PageHeader
                title="My Decks"
                actions={
                    <button
                        onClick={handleCreateNewDeck}
                        className="px-4 py-2 bg-white text-purple-700 rounded-md hover:bg-purple-50 shadow-sm transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Create New Deck
                    </button>
                }
            />

            {decks.length === 0 ? (
                <EmptyStateCard
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    }
                    message="You haven't created any decks yet."
                    actionText="Create Your First Deck"
                    onAction={handleCreateNewDeck}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map(deck => (
                        <div key={deck.id} className={`${styles.card} ${styles.border} rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200`}>
                            <h3 className={`text-xl font-semibold ${styles.text} mb-2`}>{deck.title}</h3>
                            <p className={`text-sm ${styles.textSecondary} mb-4 h-12 overflow-hidden`}>{deck.description || 'No description'}</p>
                            
                            <div className={`flex justify-between items-center text-sm ${styles.textSecondary} mb-4`}>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                    </svg>
                                    {deck.cardCount || 0} cards
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-700'}`}>
                                    {deck.category || 'Uncategorized'}
                                </span>
                            </div>
                            
                            <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} flex justify-between items-center`}>
                                <Link 
                                    to={`/decks/${deck.id}`} 
                                    className={`font-medium ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'}`}
                                >
                                    View Cards
                                </Link>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            if (deck && deck.id) {
                                                navigate(`/study/${deck.id}`);
                                            } else {
                                                alert('Cannot start study session: Invalid deck ID');
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-md text-sm shadow-sm transition-all duration-200"
                                    >
                                        Study
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (deck && deck.id) {
                                                navigate(`/quiz/${deck.id}`);
                                            } else {
                                                alert('Cannot start quiz: Invalid deck ID');
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-md text-sm shadow-sm transition-all duration-200"
                                    >
                                        Quiz
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DecksList; 
